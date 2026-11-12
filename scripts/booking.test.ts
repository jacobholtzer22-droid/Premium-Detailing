import assert from 'node:assert/strict'
import { test } from 'node:test'
import { bookablePackages, getBookablePackage } from '../lib/config'
import {
  MIN_FILL_MS,
  RateLimiter,
  addressLineFor,
  bookingBodySchema,
  checkNotABot,
  firstAvailableTech,
  jobNote,
  normalizeUsPhone,
  slotRejection,
  vehicleLine,
} from '../lib/booking-rules'
import { HONEYPOT_FIELD } from '../lib/config-schema'
import {
  addDaysToKey,
  dateKeyInZone,
  formatTimeInZone,
  minutesIntoDay,
  offsetMinutes,
  startOfDayInZone,
  toZonedIso,
  zonedTimeToUtc,
} from '../lib/time-zone'

/**
 * Run with `npm test`.
 *
 * WHAT THIS FILE IS FOR. The booking route writes into the owner's live CRM.
 * There is no staging Flyra and no safe way to exercise the write path from a
 * test, so what gets proven here is everything that happens BEFORE the first
 * write: that a bot, a slot in the past, a slot outside business hours, a
 * package that is not bookable online and a tampered price or end time are all
 * refused while nothing has been created. Every one of these is a pure
 * function for that reason.
 *
 * The 409 fallback is tested with a fake availability check, because the thing
 * worth proving is the decision ("ask the second tech before telling anybody
 * the time has gone"), not Flyra's HTTP behaviour.
 *
 * The business zone is America/New_York throughout. The timezone tests use
 * dates either side of a real US clock change, because an hour of silent drift
 * in March is exactly the bug that puts a van at a house at the wrong time.
 */

const TZ = 'America/New_York'

// ---------------------------------------------------------------- phone

test('normalizeUsPhone accepts the shapes people actually type', () => {
  for (const input of [
    '(772) 302-0717',
    '772-302-0717',
    '772.302.0717',
    '7723020717',
    '17723020717',
    '+1 772 302 0717',
    ' +1 (772) 302 0717 ',
  ]) {
    assert.equal(normalizeUsPhone(input), '+17723020717', input)
  }
})

test('normalizeUsPhone refuses what Flyra would file as a new customer', () => {
  // Too short, too long, and an area code or exchange starting 0 or 1, which
  // the North American plan does not issue. A wrong number here does not fail
  // loudly: Flyra matches an existing customer on the phone, so a typo
  // silently creates a duplicate record instead.
  for (const input of ['', '123', '77230207', '772302071', '077302 0717', '1123020717', '7721020717', 'nope']) {
    assert.equal(normalizeUsPhone(input), null, input)
  }
})

// ---------------------------------------------------------------- bot checks

function body(overrides: Record<string, unknown> = {}) {
  return bookingBodySchema.parse({
    packageSlug: 'mobile-detailing-bronze',
    slotStart: '2026-12-01T09:00:00-05:00',
    firstName: 'Dana',
    lastName: 'Whitfield',
    phone: '772-302-0717',
    address: '1 Example Street',
    city: 'Port St. Lucie',
    zip: '34986',
    vehicleYear: '2021',
    vehicleMake: 'Toyota',
    vehicleModel: 'Tacoma',
    startedAt: 1_000_000,
    ...overrides,
  })
}

test('a filled honeypot is rejected', () => {
  const rejection = checkNotABot(body({ [HONEYPOT_FIELD]: 'http://spam.example' }), 1_000_000 + 60_000)
  assert.equal(rejection?.reason, 'honeypot')
})

test('an empty honeypot is not a rejection', () => {
  assert.equal(checkNotABot(body({ [HONEYPOT_FIELD]: '' }), 1_000_000 + 60_000), null)
  assert.equal(checkNotABot(body(), 1_000_000 + 60_000), null)
})

test('a form filled faster than a human could type it is rejected', () => {
  const started = 1_000_000
  assert.equal(checkNotABot(body({ startedAt: started }), started + 500)?.reason, 'too-fast')
  assert.equal(checkNotABot(body({ startedAt: started }), started + MIN_FILL_MS - 1)?.reason, 'too-fast')
  // On the boundary and beyond is a real visitor.
  assert.equal(checkNotABot(body({ startedAt: started }), started + MIN_FILL_MS), null)
})

// ---------------------------------------------------------------- tampering

test('the body schema DROPS an end time, a price, a duration and an employee id', () => {
  // This is the whole anti-tampering story. Those five values are recomputed
  // from site.config.ts in the route, so even a request that carries them
  // cannot influence what is written: the schema strips them here, and the
  // parsed object the route uses does not have them at all.
  const parsed = bookingBodySchema.parse({
    packageSlug: 'mobile-detailing-bronze',
    slotStart: '2026-12-01T09:00:00-05:00',
    firstName: 'Dana',
    lastName: 'Whitfield',
    phone: '772-302-0717',
    address: '1 Example Street',
    city: 'Port St. Lucie',
    zip: '34986',
    vehicleYear: '2021',
    vehicleMake: 'Toyota',
    vehicleModel: 'Tacoma',
    startedAt: 1_000_000,
    // All of this is an attacker's wishlist.
    slotEnd: '2026-12-01T23:00:00-05:00',
    price: 1,
    durationMinutes: 600,
    dispatched_employee_ids: ['someone-else'],
    flyraService: 'Gold Package',
  }) as Record<string, unknown>

  for (const key of ['slotEnd', 'price', 'durationMinutes', 'dispatched_employee_ids', 'flyraService']) {
    assert.equal(key in parsed, false, `${key} survived the schema`)
  }
})

test('the body schema refuses a malformed ZIP and vehicle year', () => {
  assert.equal(bookingBodySchema.safeParse({ ...rawBody(), zip: '3498' }).success, false)
  assert.equal(bookingBodySchema.safeParse({ ...rawBody(), zip: 'ABCDE' }).success, false)
  assert.equal(bookingBodySchema.safeParse({ ...rawBody(), vehicleYear: '21' }).success, false)
  assert.equal(bookingBodySchema.safeParse({ ...rawBody(), vehicleYear: '1812' }).success, false)
  assert.equal(bookingBodySchema.safeParse({ ...rawBody(), firstName: '' }).success, false)
})

function rawBody() {
  return {
    packageSlug: 'mobile-detailing-bronze',
    slotStart: '2026-12-01T09:00:00-05:00',
    firstName: 'Dana',
    lastName: 'Whitfield',
    phone: '772-302-0717',
    address: '1 Example Street',
    city: 'Port St. Lucie',
    zip: '34986',
    vehicleYear: '2021',
    vehicleMake: 'Toyota',
    vehicleModel: 'Tacoma',
    startedAt: 1_000_000,
  }
}

// ---------------------------------------------------------------- which packages are bookable

const HOURS = [
  { day: 'Monday' as const, open: '07:00', close: '19:00' },
  { day: 'Tuesday' as const, open: '07:00', close: '19:00' },
  { day: 'Wednesday' as const, open: '07:00', close: '19:00' },
  { day: 'Thursday' as const, open: '07:00', close: '19:00' },
  { day: 'Friday' as const, open: '07:00', close: '19:00' },
  { day: 'Saturday' as const, open: '07:00', close: '19:00' },
  { day: 'Sunday' as const, open: '07:00', close: '19:00' },
]

test('only the three detailing packages are bookable online', () => {
  const slugs = bookablePackages().map((p) => p.slug)
  assert.deepEqual(slugs, ['mobile-detailing-bronze', 'mobile-detailing-silver', 'mobile-detailing-gold'])
})

test('a package that is not bookable online resolves to null', () => {
  // Anything priced per vehicle must never reach the booking route. These are
  // the slugs somebody would try by hand.
  for (const slug of [
    'window-tint',
    'ceramic-coating',
    'ceramic-coating-clay-coating',
    'paint-protection-film',
    'paint-correction',
    'pressure-washing',
    'dealerships-fleet',
    'water-damage-detail',
    'mobile-detailing',
    '',
    'mobile-detailing-platinum',
  ]) {
    assert.equal(getBookablePackage(slug), null, slug)
  }
})

test('each bookable package carries the Flyra price-book name and its own duration', () => {
  const expected = [
    ['mobile-detailing-bronze', 'Bronze Package', 45, 160],
    ['mobile-detailing-silver', 'Silver Package', 60, 260],
    ['mobile-detailing-gold', 'Gold Package', 120, 360],
  ] as const
  for (const [slug, flyraService, durationMinutes, priceFrom] of expected) {
    const pkg = getBookablePackage(slug)
    assert.ok(pkg, slug)
    assert.equal(pkg.flyraService, flyraService)
    assert.equal(pkg.durationMinutes, durationMinutes)
    assert.equal(pkg.priceFrom, priceFrom)
  }
})

// ---------------------------------------------------------------- slot rules

test('a slot in the past is rejected', () => {
  const now = new Date('2026-12-01T18:00:00Z')
  const rejection = slotRejection({
    start: new Date('2026-12-01T17:00:00Z'),
    durationMinutes: 45,
    now,
    minNoticeHours: 6,
    timeZone: TZ,
    hours: HOURS,
  })
  assert.equal(rejection?.reason, 'slot-in-past')
})

test('a slot inside the minimum notice is rejected, and one just outside it is not', () => {
  const now = new Date('2026-12-01T12:00:00Z')
  const inside = slotRejection({
    start: new Date(now.getTime() + 5 * 3_600_000),
    durationMinutes: 45,
    now,
    minNoticeHours: 6,
    timeZone: TZ,
    hours: HOURS,
  })
  assert.equal(inside?.reason, 'inside-notice')

  // now + 6h is 18:00 UTC, which is 13:00 in New York in December: inside hours.
  const outside = slotRejection({
    start: new Date(now.getTime() + 6 * 3_600_000),
    durationMinutes: 45,
    now,
    minNoticeHours: 6,
    timeZone: TZ,
    hours: HOURS,
  })
  assert.equal(outside, null)
})

test('a slot before opening is rejected', () => {
  const now = new Date('2026-12-01T05:00:00-05:00')
  // 6:30 AM Eastern, half an hour before the doors open.
  const rejection = slotRejection({
    start: new Date('2026-12-02T06:30:00-05:00'),
    durationMinutes: 45,
    now,
    minNoticeHours: 6,
    timeZone: TZ,
    hours: HOURS,
  })
  assert.equal(rejection?.reason, 'outside-hours')
})

test('a job that would FINISH after closing is rejected, not just one that starts late', () => {
  const now = new Date('2026-12-01T05:00:00-05:00')
  // 6:00 PM start is inside hours. A 2 hour Gold from there ends at 8:00 PM,
  // an hour after close, so it must not be offered or accepted.
  const gold = slotRejection({
    start: new Date('2026-12-02T18:00:00-05:00'),
    durationMinutes: 120,
    now,
    minNoticeHours: 6,
    timeZone: TZ,
    hours: HOURS,
  })
  assert.equal(gold?.reason, 'outside-hours')

  // The same start is fine for a 45 minute Bronze, which ends at 6:45 PM.
  const bronze = slotRejection({
    start: new Date('2026-12-02T18:00:00-05:00'),
    durationMinutes: 45,
    now,
    minNoticeHours: 6,
    timeZone: TZ,
    hours: HOURS,
  })
  assert.equal(bronze, null)
})

test('the last slot that fits is accepted exactly', () => {
  const now = new Date('2026-12-01T05:00:00-05:00')
  // 5:00 PM plus 2 hours is 7:00 PM, which is closing time, so it fits.
  assert.equal(
    slotRejection({
      start: new Date('2026-12-02T17:00:00-05:00'),
      durationMinutes: 120,
      now,
      minNoticeHours: 6,
      timeZone: TZ,
      hours: HOURS,
    }),
    null,
  )
})

test('an unparseable slot is rejected rather than becoming an Invalid Date', () => {
  const rejection = slotRejection({
    start: new Date('not a date'),
    durationMinutes: 45,
    now: new Date('2026-12-01T12:00:00Z'),
    minNoticeHours: 6,
    timeZone: TZ,
    hours: HOURS,
  })
  assert.equal(rejection?.reason, 'bad-slot')
})

// ---------------------------------------------------------------- the 409 fallback

test('the first free tech takes the job', async () => {
  const asked: string[] = []
  const tech = await firstAvailableTech(['tech-a', 'tech-b'], async (id) => {
    asked.push(id)
    return true
  })
  assert.equal(tech, 'tech-a')
  assert.deepEqual(asked, ['tech-a'], 'the second tech should not have been asked')
})

test('a busy first tech falls through to the second instead of returning 409', async () => {
  // This is the case the fallback exists for: the slot list the visitor was
  // looking at was true when it loaded, and one of the two techs has been
  // given that time since. Giving up after the first would turn a bookable
  // slot into "that time was just taken".
  const asked: string[] = []
  const tech = await firstAvailableTech(['tech-a', 'tech-b'], async (id) => {
    asked.push(id)
    return id === 'tech-b'
  })
  assert.equal(tech, 'tech-b')
  assert.deepEqual(asked, ['tech-a', 'tech-b'])
})

test('both techs busy is the only case that returns no tech', async () => {
  const tech = await firstAvailableTech(['tech-a', 'tech-b'], async () => false)
  assert.equal(tech, null)
})

test('a tech whose availability check THROWS is skipped, never assumed free', async () => {
  // Booking a job into a calendar we could not read is worse than telling
  // somebody to pick another time.
  const tech = await firstAvailableTech(['tech-a', 'tech-b'], async (id) => {
    if (id === 'tech-a') throw new Error('Flyra 500')
    return true
  })
  assert.equal(tech, 'tech-b')

  const none = await firstAvailableTech(['tech-a'], async () => {
    throw new Error('Flyra 500')
  })
  assert.equal(none, null)
})

test('no techs configured means nobody is free', async () => {
  // With an empty tech list the route must not book anything. config.booking
  // .techIds is empty today, which is why this is the live behaviour.
  assert.equal(await firstAvailableTech([], async () => true), null)
})

// ---------------------------------------------------------------- the job note

test('the job note gives a tech the address and the vehicle without opening anything', () => {
  const b = body({ unit: 'Suite 14', notes: 'Gate code 1234' })
  const note = jobNote({ vehicle: vehicleLine(b), address: addressLineFor(b), notes: b.notes })
  assert.match(note, /^Booked on website\./)
  assert.match(note, /Vehicle: 2021 Toyota Tacoma/)
  assert.match(note, /Address: 1 Example Street, Suite 14, Port St\. Lucie, FL 34986/)
  assert.match(note, /Notes: Gate code 1234/)
})

test('the job note leaves the notes line out when there is nothing to say', () => {
  const note = jobNote({ vehicle: '2021 Toyota Tacoma', address: '1 Example Street' })
  assert.equal(note.includes('Notes:'), false)
})

// ---------------------------------------------------------------- rate limit

test('the rate limiter allows the limit and then refuses, and resets after the window', () => {
  const limiter = new RateLimiter(5, 3_600_000)
  const now = 1_000_000
  for (let i = 0; i < 5; i += 1) assert.equal(limiter.check('1.2.3.4', now + i), true, `request ${i + 1}`)
  assert.equal(limiter.check('1.2.3.4', now + 10), false, 'the sixth is refused')
  // A different visitor is unaffected.
  assert.equal(limiter.check('5.6.7.8', now + 10), true)
  // And the window rolls.
  assert.equal(limiter.check('1.2.3.4', now + 3_600_001), true)
})

// ---------------------------------------------------------------- timezone

test('a wall-clock time in the business zone maps to the right instant', () => {
  // 9:00 AM on 1 December 2026 in New York is EST, so UTC-5.
  assert.equal(zonedTimeToUtc(2026, 12, 1, 9, 0, TZ).toISOString(), '2026-12-01T14:00:00.000Z')
  // 9:00 AM on 1 July is EDT, so UTC-4. The same wall clock, a different
  // instant: this is the hour of drift the whole module exists to prevent.
  assert.equal(zonedTimeToUtc(2026, 7, 1, 9, 0, TZ).toISOString(), '2026-07-01T13:00:00.000Z')
})

test('the zone offset is read from the instant, not hardcoded', () => {
  assert.equal(offsetMinutes(new Date('2026-12-01T12:00:00Z'), TZ), -300)
  assert.equal(offsetMinutes(new Date('2026-07-01T12:00:00Z'), TZ), -240)
})

test('the day a slot belongs to is the business zone day, not the UTC day', () => {
  // 00:30 UTC on 2 December is 7:30 PM on 1 December in New York. A date strip
  // built off UTC would file this evening slot under the wrong day.
  assert.equal(dateKeyInZone(new Date('2026-12-02T00:30:00Z'), TZ), '2026-12-01')
  assert.equal(minutesIntoDay(new Date('2026-12-02T00:30:00Z'), TZ), 19 * 60 + 30)
})

test('adding days survives the spring clock change', () => {
  // US clocks go forward on 8 March 2026. Adding 24 hour blocks from midnight
  // would skip or repeat a day across it; the helper works from noon.
  assert.equal(addDaysToKey('2026-03-07', 1, TZ), '2026-03-08')
  assert.equal(addDaysToKey('2026-03-08', 1, TZ), '2026-03-09')
  assert.equal(addDaysToKey('2026-03-07', 3, TZ), '2026-03-10')
  // And the autumn one, when a day is 25 hours long.
  assert.equal(addDaysToKey('2026-10-31', 2, TZ), '2026-11-02')
  assert.equal(addDaysToKey('2026-11-01', 1, TZ), '2026-11-02')
})

test('the start of a business day is local midnight, not UTC midnight', () => {
  assert.equal(startOfDayInZone('2026-12-01', TZ).toISOString(), '2026-12-01T05:00:00.000Z')
  assert.equal(startOfDayInZone('2026-07-01', TZ).toISOString(), '2026-07-01T04:00:00.000Z')
})

test('a time label carries no narrow space that would break a text message', () => {
  const label = formatTimeInZone(new Date('2026-12-01T18:00:00Z'), TZ)
  assert.equal(label, '1:00 PM')
  assert.equal(/[  ]/.test(label), false, 'narrow or non-breaking space in a time label')
})

test('a slot is sent to Flyra with the business zone offset on it', () => {
  // A bare local string would leave Flyra guessing the zone. Both of these are
  // the same wall clock in different parts of the year.
  assert.equal(toZonedIso(new Date('2026-12-01T14:00:00Z'), TZ), '2026-12-01T09:00:00-05:00')
  assert.equal(toZonedIso(new Date('2026-07-01T13:00:00Z'), TZ), '2026-07-01T09:00:00-04:00')
})
