/**
 * Business-timezone arithmetic, with no dependencies.
 *
 * Every time a visitor reads or picks on the booking page is in the business's
 * zone (config.booking.timezone), never the visitor's. Somebody in Phoenix
 * booking a mobile detail in Port St. Lucie must see the time the van actually
 * turns up, and a date strip built from the browser's clock would show them
 * the wrong day near midnight.
 *
 * This file is pure and has unit tests in scripts/booking.test.ts, because the
 * two bugs it exists to prevent are both silent: an hour out in March or
 * November when the US changes clocks, and a day out either side of midnight.
 * Nothing here reads config or touches the network.
 */

const PARTS_FORMAT_CACHE = new Map<string, Intl.DateTimeFormat>()

function partsFormatter(timeZone: string): Intl.DateTimeFormat {
  let f = PARTS_FORMAT_CACHE.get(timeZone)
  if (!f) {
    f = new Intl.DateTimeFormat('en-US', {
      timeZone,
      hour12: false,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
    PARTS_FORMAT_CACHE.set(timeZone, f)
  }
  return f
}

export interface ZonedParts {
  year: number
  month: number
  day: number
  hour: number
  minute: number
  second: number
}

/** The wall-clock reading in `timeZone` at the instant `date`. */
export function partsInZone(date: Date, timeZone: string): ZonedParts {
  const map: Record<string, string> = {}
  for (const p of partsFormatter(timeZone).formatToParts(date)) {
    if (p.type !== 'literal') map[p.type] = p.value
  }
  return {
    year: Number(map.year),
    month: Number(map.month),
    day: Number(map.day),
    // Intl gives "24" for midnight under hour12:false in some ICU builds.
    hour: Number(map.hour) % 24,
    minute: Number(map.minute),
    second: Number(map.second),
  }
}

/**
 * The offset of `timeZone` from UTC, in minutes, at the instant `date`.
 * Positive east of Greenwich, so New York in summer is -240.
 */
export function offsetMinutes(date: Date, timeZone: string): number {
  const p = partsInZone(date, timeZone)
  const asUtc = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second)
  // Seconds are preserved above but milliseconds are not represented in the
  // formatted parts, so compare on whole seconds at both ends.
  return (asUtc - Math.floor(date.getTime() / 1000) * 1000) / 60000
}

/**
 * A wall-clock time in `timeZone` to the instant it names.
 *
 * Solved by iteration rather than algebra because the offset depends on the
 * answer: converting 2:30 AM on a spring-forward morning needs the offset that
 * applies AFTER the jump, which is not the offset at the naive guess. Two
 * passes settle every real case; a third is belt and braces.
 */
export function zonedTimeToUtc(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  timeZone: string,
): Date {
  const naive = Date.UTC(year, month - 1, day, hour, minute, 0)
  let guess = new Date(naive)
  for (let i = 0; i < 3; i += 1) {
    const offset = offsetMinutes(guess, timeZone)
    const next = new Date(naive - offset * 60000)
    if (next.getTime() === guess.getTime()) break
    guess = next
  }
  return guess
}

/** "2026-11-14" for the instant, read in `timeZone`. */
export function dateKeyInZone(date: Date, timeZone: string): string {
  const p = partsInZone(date, timeZone)
  return `${p.year}-${String(p.month).padStart(2, '0')}-${String(p.day).padStart(2, '0')}`
}

/** Midnight at the start of a "YYYY-MM-DD" day in `timeZone`. */
export function startOfDayInZone(dateKey: string, timeZone: string): Date {
  const [y, m, d] = dateKey.split('-').map(Number)
  if (!y || !m || !d) throw new Error(`bad date key: ${dateKey}`)
  return zonedTimeToUtc(y, m, d, 0, 0, timeZone)
}

/** Minutes since midnight, read in `timeZone`. 7:30 PM is 1170. */
export function minutesIntoDay(date: Date, timeZone: string): number {
  const p = partsInZone(date, timeZone)
  return p.hour * 60 + p.minute
}

/** "YYYY-MM-DD" plus whole days, staying on calendar days in `timeZone`. */
export function addDaysToKey(dateKey: string, days: number, timeZone: string): string {
  // Noon, not midnight: adding 24h blocks from noon can never land on the
  // missing or doubled hour of a clock change and slip a day.
  const [y, m, d] = dateKey.split('-').map(Number)
  if (!y || !m || !d) throw new Error(`bad date key: ${dateKey}`)
  const noon = zonedTimeToUtc(y, m, d, 12, 0, timeZone)
  return dateKeyInZone(new Date(noon.getTime() + days * 86400000), timeZone)
}

/** A list of `count` consecutive "YYYY-MM-DD" keys starting at `fromKey`. */
export function dayKeys(fromKey: string, count: number, timeZone: string): string[] {
  const out: string[] = []
  for (let i = 0; i < count; i += 1) out.push(addDaysToKey(fromKey, i, timeZone))
  return out
}

const TIME_CACHE = new Map<string, Intl.DateTimeFormat>()
const DAY_CACHE = new Map<string, Intl.DateTimeFormat>()

/** "1:30 PM", read in `timeZone`. */
export function formatTimeInZone(date: Date, timeZone: string): string {
  let f = TIME_CACHE.get(timeZone)
  if (!f) {
    f = new Intl.DateTimeFormat('en-US', { timeZone, hour: 'numeric', minute: '2-digit', hour12: true })
    TIME_CACHE.set(timeZone, f)
  }
  // Some ICU builds emit U+202F before AM/PM. Normalise it to a plain space so
  // the string is comparable and copyable.
  return f.format(date).replace(/[  ]/g, ' ')
}

/** "Sat, Nov 14" for a "YYYY-MM-DD" key, read in `timeZone`. */
export function formatDayLabel(dateKey: string, timeZone: string): string {
  let f = DAY_CACHE.get(timeZone)
  if (!f) {
    f = new Intl.DateTimeFormat('en-US', { timeZone, weekday: 'short', month: 'short', day: 'numeric' })
    DAY_CACHE.set(timeZone, f)
  }
  return f.format(startOfDayInZone(dateKey, timeZone)).replace(/[  ]/g, ' ')
}

const ZONE_CACHE = new Map<string, Intl.DateTimeFormat>()

/**
 * "EST" or "EDT", whichever applies at that instant.
 *
 * Printed beside every time a visitor reads, so somebody in another zone can
 * see at a glance that the time on screen is not theirs. Derived from the
 * instant rather than hardcoded, because half the year it is the other one.
 */
export function zoneLabel(date: Date, timeZone: string): string {
  let f = ZONE_CACHE.get(timeZone)
  if (!f) {
    f = new Intl.DateTimeFormat('en-US', { timeZone, timeZoneName: 'short' })
    ZONE_CACHE.set(timeZone, f)
  }
  const part = f.formatToParts(date).find((x) => x.type === 'timeZoneName')
  return part ? part.value : ''
}

/**
 * The zone's own offset written the way an ISO string wants it: "-05:00".
 * Used to send Flyra a start time that is unambiguous about which instant it
 * means, rather than a bare local string it has to guess the zone for.
 */
export function isoOffset(date: Date, timeZone: string): string {
  const total = offsetMinutes(date, timeZone)
  const sign = total < 0 ? '-' : '+'
  const abs = Math.abs(total)
  return `${sign}${String(Math.floor(abs / 60)).padStart(2, '0')}:${String(abs % 60).padStart(2, '0')}`
}

/** An instant as an ISO string carrying the business zone's offset. */
export function toZonedIso(date: Date, timeZone: string): string {
  const p = partsInZone(date, timeZone)
  const pad = (n: number) => String(n).padStart(2, '0')
  return (
    `${p.year}-${pad(p.month)}-${pad(p.day)}T${pad(p.hour)}:${pad(p.minute)}:${pad(p.second)}` +
    isoOffset(date, timeZone)
  )
}
