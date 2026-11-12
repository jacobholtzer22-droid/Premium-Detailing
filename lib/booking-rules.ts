import { z } from 'zod'
import { HONEYPOT_FIELD } from './config-schema'
import { minutesIntoDay, partsInZone } from './time-zone'

/**
 * Everything the booking route decides, as pure functions.
 *
 * Pulled out of the route handler so it can be unit tested without a network,
 * a key or a running server: scripts/booking.test.ts proves the rejection
 * paths and the two-tech fallback against these, which is the only honest way
 * to show that a tampered price or a slot in the past is refused BEFORE
 * anything is written to the owner's CRM.
 *
 * Nothing here reads process.env or imports lib/flyra.ts.
 */

/** Minimum time on the form before a submission is believable. */
export const MIN_FILL_MS = 3_000
/** Per-IP cap. See the note on the limiter in app/api/booking/route.ts. */
export const RATE_LIMIT_PER_HOUR = 5

/**
 * "(772) 302-0717", "772-302-0717", "17723020717", "+1 772 302 0717" all become
 * "+17723020717". Anything that is not a plausible US mobile returns null,
 * because Flyra matches an existing customer on the phone number and a wrong
 * one silently creates a duplicate rather than failing.
 */
export function normalizeUsPhone(input: string): string | null {
  const digits = input.replace(/\D/g, '')
  const ten = digits.length === 11 && digits.startsWith('1') ? digits.slice(1) : digits
  if (ten.length !== 10) return null
  // North American numbering: area code and exchange both start 2 to 9.
  if (!/^[2-9]\d{2}[2-9]\d{6}$/.test(ten)) return null
  return `+1${ten}`
}

const trimmed = (min: number, max: number) => z.string().trim().min(min).max(max)

/**
 * The request body, validated before anything else happens.
 *
 * Note what is NOT accepted: an end time, a price, a Flyra service name, a
 * duration or an employee id. Every one of those is recomputed server-side
 * from site.config.ts, so a visitor editing the request cannot book two hours
 * of work at the Bronze price or dispatch the job to somebody else.
 */
export const bookingBodySchema = z
  .object({
    packageSlug: trimmed(2, 80),
    slotStart: trimmed(10, 40),
    firstName: trimmed(1, 60),
    lastName: trimmed(1, 60),
    phone: trimmed(7, 30),
    email: z.string().trim().email().max(120).optional().or(z.literal('').transform(() => undefined)),
    address: trimmed(4, 160),
    unit: trimmed(1, 40).optional().or(z.literal('').transform(() => undefined)),
    city: trimmed(2, 80),
    state: z.string().trim().length(2).optional(),
    zip: z.string().trim().regex(/^\d{5}$/, 'needs a 5 digit ZIP'),
    vehicleYear: z.string().trim().regex(/^(19|20)\d{2}$/, 'needs a 4 digit year'),
    vehicleMake: trimmed(1, 60),
    vehicleModel: trimmed(1, 60),
    notes: trimmed(1, 1000).optional().or(z.literal('').transform(() => undefined)),
    [HONEYPOT_FIELD]: z.string().optional(),
    startedAt: z.number().int().nonnegative(),
  })
  .strip()

export type BookingBody = z.infer<typeof bookingBodySchema>

export type RejectionReason =
  | 'honeypot'
  | 'too-fast'
  | 'rate-limited'
  | 'bad-phone'
  | 'unknown-package'
  | 'bad-slot'
  | 'slot-in-past'
  | 'inside-notice'
  | 'outside-hours'

export interface Rejection {
  reason: RejectionReason
  /** What the visitor is shown. Never an internal detail. */
  message: string
}

/**
 * A bot check that costs a real visitor nothing.
 *
 * The honeypot field is the same name the platform's contact form uses, so a
 * bot that has learned to fill that one fills this one too. The fill time
 * catches the bots that do not bother with the field: three seconds is below
 * any human who typed a name, an address and a vehicle into this form.
 */
export function checkNotABot(body: BookingBody, now: number): Rejection | null {
  const honeypot = body[HONEYPOT_FIELD]
  if (typeof honeypot === 'string' && honeypot.trim().length > 0) {
    return { reason: 'honeypot', message: 'That did not go through. Give us a call and we will book it for you.' }
  }
  if (body.startedAt > 0 && now - body.startedAt < MIN_FILL_MS) {
    return { reason: 'too-fast', message: 'That did not go through. Give us a call and we will book it for you.' }
  }
  return null
}

export interface BusinessDay {
  day: string
  open: string
  close: string
}

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as const

/**
 * Whether a window of `durationMinutes` starting at `start` is one this
 * business would actually honour.
 *
 * Checked again here even though Flyra already applies its own business hours
 * and notice, because this is the last point before a write and the client
 * sent the start time. Flyra refusing it later is a job that never happens;
 * refusing it here is a visitor who picks a different time.
 */
export function slotRejection(args: {
  start: Date
  durationMinutes: number
  now: Date
  minNoticeHours: number
  timeZone: string
  hours: readonly BusinessDay[] | null
}): Rejection | null {
  const { start, durationMinutes, now, minNoticeHours, timeZone, hours } = args

  if (Number.isNaN(start.getTime())) {
    return { reason: 'bad-slot', message: 'That time did not look right. Pick a time and try again.' }
  }
  if (start.getTime() <= now.getTime()) {
    return { reason: 'slot-in-past', message: 'That time has already passed. Pick another one.' }
  }
  const earliest = now.getTime() + minNoticeHours * 3_600_000
  if (start.getTime() < earliest) {
    return {
      reason: 'inside-notice',
      message: `We need at least ${minNoticeHours} hours notice. Pick a later time, or call us if it is urgent.`,
    }
  }

  if (hours && hours.length > 0) {
    const parts = partsInZone(start, timeZone)
    const weekday = DAY_NAMES[new Date(Date.UTC(parts.year, parts.month - 1, parts.day)).getUTCDay()]
    const today = hours.find((h) => h.day === weekday)
    if (!today) {
      return { reason: 'outside-hours', message: 'We are not open then. Pick another time.' }
    }
    const openMin = toMinutes(today.open)
    const closeMin = toMinutes(today.close)
    const startMin = minutesIntoDay(start, timeZone)
    // The whole job has to finish inside the day, not just start inside it.
    if (startMin < openMin || startMin + durationMinutes > closeMin) {
      return { reason: 'outside-hours', message: 'We are not open then. Pick another time.' }
    }
  }

  return null
}

function toMinutes(hhmm: string): number {
  const [h = 0, m = 0] = hhmm.split(':').map(Number)
  return h * 60 + m
}

/**
 * The first tech who is actually free, asked one at a time in config order.
 *
 * This is the whole 409 story. The slot list a visitor is looking at was true
 * when it was fetched and may not be true now, so availability is re-checked
 * at the moment of booking. If the first tech has been given that slot in the
 * meantime, the second is asked before anybody is told the time has gone: two
 * techs mean two chances, and giving up after the first would turn half the
 * real double-bookings into a lost job.
 *
 * A tech whose check THROWS is skipped rather than treated as free. Booking a
 * job into a calendar we could not read is the one outcome worse than telling
 * somebody to pick another time.
 */
export async function firstAvailableTech(
  techIds: readonly string[],
  isFree: (techId: string) => Promise<boolean>,
): Promise<string | null> {
  for (const techId of techIds) {
    try {
      if (await isFree(techId)) return techId
    } catch {
      // Skip and try the next one.
    }
  }
  return null
}

/**
 * The note that goes on the Flyra job, so a tech reading their schedule knows
 * where they are going and what they are looking at without opening anything.
 */
export function jobNote(args: {
  vehicle: string
  address: string
  notes?: string
}): string {
  const lines = ['Booked on website.', `Vehicle: ${args.vehicle}`, `Address: ${args.address}`]
  if (args.notes) lines.push(`Notes: ${args.notes}`)
  return lines.join('\n')
}

export function vehicleLine(body: Pick<BookingBody, 'vehicleYear' | 'vehicleMake' | 'vehicleModel'>): string {
  return `${body.vehicleYear} ${body.vehicleMake} ${body.vehicleModel}`
}

export function addressLineFor(body: Pick<BookingBody, 'address' | 'unit' | 'city' | 'state' | 'zip'>): string {
  const street = body.unit ? `${body.address}, ${body.unit}` : body.address
  return `${street}, ${body.city}, ${body.state ?? 'FL'} ${body.zip}`
}

/**
 * A fixed-window per-IP counter.
 *
 * Deliberately in memory and therefore PER LAMBDA INSTANCE, which makes the
 * real limit a multiple of this number under load. That is the intended trade:
 * the job is to stop one script hammering the endpoint, not to be exact, and
 * the alternative is a database this site does not have. Same reasoning as the
 * dropped-lead alert on the Align and Acquire platform.
 */
export class RateLimiter {
  private hits = new Map<string, { count: number; resetAt: number }>()

  constructor(
    private readonly limit: number,
    private readonly windowMs: number,
  ) {}

  check(key: string, now: number): boolean {
    const entry = this.hits.get(key)
    if (!entry || now >= entry.resetAt) {
      this.hits.set(key, { count: 1, resetAt: now + this.windowMs })
      this.sweep(now)
      return true
    }
    if (entry.count >= this.limit) return false
    entry.count += 1
    return true
  }

  private sweep(now: number): void {
    if (this.hits.size < 500) return
    for (const [key, entry] of this.hits) if (now >= entry.resetAt) this.hits.delete(key)
  }
}
