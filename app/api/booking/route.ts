import { NextResponse } from 'next/server'
import { bookingEnabled, config, getBookablePackage } from '@/lib/config'
import type { BookingResponse } from '@/lib/booking-types'
import {
  RATE_LIMIT_PER_HOUR,
  RateLimiter,
  addressLineFor,
  bookingBodySchema,
  checkNotABot,
  firstAvailableTech,
  jobNote,
  normalizeUsPhone,
  slotRejection,
  vehicleLine,
} from '@/lib/booking-rules'
import {
  checkAvailability,
  createCustomer,
  createJob,
  flyraConfigured,
  isAvailable,
  jobId as readJobId,
} from '@/lib/flyra'
import { formatDayLabel, formatTimeInZone, dateKeyInZone, toZonedIso, zoneLabel } from '@/lib/time-zone'

/**
 * Takes a booking and writes it into the owner's CRM.
 *
 * THE ORDER OF THIS HANDLER IS THE POINT. Everything that can reject a request
 * runs before the first write, so a bot, a tampered price, a slot in the past
 * or a package that is not bookable online never reaches Flyra at all:
 *
 *   1  rate limit, honeypot, minimum fill time
 *   2  shape of the body
 *   3  phone is a real US number
 *   4  package is one config says is bookable      <- never from the client
 *   5  end time and price recomputed from config   <- never from the client
 *   6  slot is in the future, past the notice period, inside business hours
 *   7  a tech is actually free, asked one at a time
 *   ---- first write below this line ----
 *   8  find or create the customer
 *   9  create the job, dispatched to that tech
 *
 * The client sends a package slug and a start time. It does not send an end
 * time, a price, a duration, a Flyra service name or an employee id, and if it
 * did they would be ignored: steps 4 and 5 read all five out of
 * site.config.ts. That is what stops somebody booking two hours of Gold work
 * at the Bronze price.
 */

export const dynamic = 'force-dynamic'

/** Module scope, so it survives between requests on the same instance. */
const limiter = new RateLimiter(RATE_LIMIT_PER_HOUR, 3_600_000)

function clientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0]?.trim() ?? 'unknown'
  return request.headers.get('x-real-ip') ?? 'unknown'
}

type FailureCode = 'taken' | 'invalid' | 'unavailable' | 'failed'

function fail(error: string, code: FailureCode, status: number) {
  const body: BookingResponse = { ok: false, error, code }
  return NextResponse.json(body, { status, headers: { 'cache-control': 'no-store' } })
}

/** What a visitor is told when we cannot finish. Always points at the phone. */
const CALL_US = 'We could not finish that booking. Please call us and we will get you on the schedule.'

export async function POST(request: Request) {
  const now = new Date()

  // 1. Cheap rejections first, before any parsing work.
  if (!limiter.check(clientIp(request), now.getTime())) {
    return fail('That is a lot of bookings at once. Give us a call instead.', 'invalid', 429)
  }

  let json: unknown
  try {
    json = await request.json()
  } catch {
    return fail('That did not look right. Please try again.', 'invalid', 400)
  }

  const parsed = bookingBodySchema.safeParse(json)
  if (!parsed.success) {
    const first = parsed.error.issues[0]
    const where = first?.path.join('.') ?? 'the form'
    return fail(`Check ${where} and try again.`, 'invalid', 400)
  }
  const body = parsed.data

  const bot = checkNotABot(body, now.getTime())
  if (bot) {
    // 200, not 400: a bot learns nothing from a success, and a real visitor who
    // somehow tripped this gets the phone number either way.
    console.warn(`[booking] rejected: ${bot.reason}`)
    return fail(bot.message, 'invalid', 200)
  }

  // 3. Phone.
  const phone = normalizeUsPhone(body.phone)
  if (!phone) {
    return fail('That phone number does not look like a US mobile. Check it and try again.', 'invalid', 400)
  }

  // 4. Package, from config only.
  const pkg = getBookablePackage(body.packageSlug)
  const settings = config.booking
  if (!pkg || !settings) {
    return fail('That package cannot be booked online. Send us a quote request and we will sort it out.', 'invalid', 400)
  }
  if (!bookingEnabled() || !flyraConfigured()) {
    return fail(CALL_US, 'unavailable', 503)
  }

  // 5. Times and price, recomputed. Nothing here came from the request except
  // the start instant itself.
  const tz = settings.timezone
  const start = new Date(body.slotStart)
  const end = new Date(start.getTime() + pkg.durationMinutes * 60_000)

  // 6. Is this a slot we would honour at all?
  const rejected = slotRejection({
    start,
    durationMinutes: pkg.durationMinutes,
    now,
    minNoticeHours: settings.minNoticeHours,
    timeZone: tz,
    hours: config.hours,
  })
  if (rejected) {
    console.warn(`[booking] rejected: ${rejected.reason}`)
    return fail(rejected.message, rejected.reason === 'bad-slot' ? 'invalid' : 'taken', 400)
  }

  // 7. Who is free right now, not who was free when the page loaded.
  const startIso = toZonedIso(start, tz)
  const techId = await firstAvailableTech(settings.techIds, async (id) =>
    isAvailable(await checkAvailability({ employeeId: id, start: startIso, durationMinutes: pkg.durationMinutes })),
  )
  if (!techId) {
    return fail('That time was just taken. Pick another one and it is yours.', 'taken', 409)
  }

  // ---- first write ----
  const address = addressLineFor(body)
  const vehicle = vehicleLine(body)

  let customerId: string
  try {
    const customer = await createCustomer({
      firstName: body.firstName,
      lastName: body.lastName,
      email: body.email,
      mobilePhone: phone,
      address: body.address,
      unit: body.unit,
      city: body.city,
      state: body.state ?? config.primaryState,
      zip: body.zip,
    })
    customerId = customer.id
    if (!customerId) throw new Error('no customer id returned')
  } catch (err) {
    console.error('[booking] customer create failed:', err instanceof Error ? err.message : err)
    return fail(CALL_US, 'failed', 502)
  }

  try {
    const job = await createJob({
      customerId,
      // The EXACT price-book name. A mismatch files the job under something
      // the techs do not recognise.
      service: pkg.flyraService,
      scheduledStart: startIso,
      scheduledEnd: toZonedIso(end, tz),
      notes: jobNote({ vehicle, address, notes: body.notes }),
      // From config, never the request.
      ...(pkg.priceFrom === null ? {} : { price: pkg.priceFrom }),
      dispatchedEmployeeIds: [techId],
    })
    const id = readJobId(job)
    if (!id) throw new Error('no job id returned')

    // One line, first name and job id only. Enough to find a booking in
    // support; not a copy of a customer's address in a log aggregator.
    console.log(`[booking] ${body.firstName} booked ${pkg.name}, job ${id}`)

    const when = `${formatDayLabel(dateKeyInZone(start, tz), tz)} at ${formatTimeInZone(start, tz)} ${zoneLabel(start, tz)}`
    const ok: BookingResponse = { ok: true, jobId: id, start: startIso, end: toZonedIso(end, tz), when }
    return NextResponse.json(ok, { headers: { 'cache-control': 'no-store' } })
  } catch (err) {
    // The customer exists and the job does not. Log enough to find it by hand,
    // because this visitor is in the CRM with no appointment against them.
    console.error(
      `[booking] JOB FAILED after customer ${customerId} was created. Package ${pkg.slug}, start ${startIso}, tech ${techId}:`,
      err instanceof Error ? err.message : err,
    )
    return fail(CALL_US, 'failed', 502)
  }
}
