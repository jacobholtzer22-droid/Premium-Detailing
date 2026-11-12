import { NextResponse } from 'next/server'
import { bookingEnabled, config, formatDuration, getBookablePackage } from '@/lib/config'
import { findOpenSlots, flyraConfigured, rawSlotEnd, rawSlotStart } from '@/lib/flyra'
import type { SlotDay, SlotWindow, SlotsResponse } from '@/lib/booking-types'
import { slotRejection } from '@/lib/booking-rules'
import {
  addDaysToKey,
  dateKeyInZone,
  dayKeys,
  formatDayLabel,
  formatTimeInZone,
  startOfDayInZone,
  toZonedIso,
  zoneLabel,
} from '@/lib/time-zone'

/**
 * Open booking windows for one package, as the business's own clock reads them.
 *
 * This route exists because the Flyra key cannot go to a browser. The browser
 * asks for "the open times for the Gold Package"; the key, the employee ids
 * and the package duration all stay here. A response carries a start, an end
 * and a pre-rendered label and nothing else, so nothing a visitor can read
 * tells them who is free when.
 *
 * It NEVER guesses. With booking switched off, no key, or Flyra unreachable,
 * it answers 200 with available:false and no days, and the page shows its
 * call-us state. An empty calendar would read as "fully booked", and a 500
 * would read as a broken site; both lose the job quietly, which is the failure
 * mode this whole file is arranged to avoid.
 */

export const dynamic = 'force-dynamic'

/** How many windows to ask Flyra for, per tech. Covers a week comfortably. */
const SLOTS_PER_TECH = 80
/** Most windows shown for any one day. Beyond this the strip is noise. */
const MAX_PER_DAY = 14

function unavailable(packageSlug: string, packageName: string, durationMinutes: number): NextResponse {
  const body: SlotsResponse = {
    packageSlug,
    packageName,
    durationMinutes,
    durationLabel: formatDuration(durationMinutes),
    timezone: config.booking?.timezone ?? 'America/New_York',
    timezoneLabel: zoneLabel(new Date(), config.booking?.timezone ?? 'America/New_York'),
    days: [],
    available: false,
  }
  return NextResponse.json(body, { headers: { 'cache-control': 'no-store' } })
}

export async function GET(request: Request) {
  const url = new URL(request.url)
  const packageSlug = url.searchParams.get('package') ?? ''
  const from = url.searchParams.get('from')

  const pkg = getBookablePackage(packageSlug)
  if (!pkg) {
    return NextResponse.json(
      { error: 'unknown package' },
      { status: 400, headers: { 'cache-control': 'no-store' } },
    )
  }

  const settings = config.booking
  if (!settings || !bookingEnabled() || !flyraConfigured()) {
    return unavailable(pkg.slug, pkg.name, pkg.durationMinutes)
  }

  const tz = settings.timezone
  const now = new Date()

  // The window starts at the later of the day asked for and the earliest time
  // we are allowed to offer. Asking Flyra for anything inside the notice
  // period would put times on screen that the booking route then refuses.
  const todayKey = dateKeyInZone(now, tz)
  const requestedKey = from && /^\d{4}-\d{2}-\d{2}$/.test(from) && from >= todayKey ? from : todayKey
  const earliest = new Date(now.getTime() + settings.minNoticeHours * 3_600_000)
  const requestedStart = startOfDayInZone(requestedKey, tz)
  const startAfter = requestedStart.getTime() > earliest.getTime() ? requestedStart : earliest

  const lastKey = addDaysToKey(requestedKey, settings.daysAhead - 1, tz)
  const windowEnd = startOfDayInZone(addDaysToKey(lastKey, 1, tz), tz)

  // One call per tech, in parallel. A tech whose call fails is skipped rather
  // than failing the request: one dead employee record must not empty the
  // calendar for the other.
  const results = await Promise.allSettled(
    settings.techIds.map((techId) =>
      findOpenSlots({
        employeeId: techId,
        durationMinutes: pkg.durationMinutes,
        startAfter: toZonedIso(startAfter, tz),
        slots: SLOTS_PER_TECH,
      }),
    ),
  )

  const failures = results.filter((r) => r.status === 'rejected')
  if (failures.length === settings.techIds.length) {
    // Nobody answered. Tell the page to show the phone number.
    const first = failures[0]
    if (first && first.status === 'rejected') {
      console.error('[booking/slots] every tech lookup failed:', first.reason instanceof Error ? first.reason.message : first.reason)
    }
    return unavailable(pkg.slug, pkg.name, pkg.durationMinutes)
  }

  // De-duplicate on the instant: two techs free at the same time is one window
  // a visitor can pick, and which of them takes it is decided at booking.
  const byStart = new Map<number, SlotWindow>()
  for (const result of results) {
    if (result.status !== 'fulfilled') continue
    for (const raw of result.value ?? []) {
      const startStr = rawSlotStart(raw)
      if (!startStr) continue
      const start = new Date(startStr)
      if (Number.isNaN(start.getTime())) continue
      if (start.getTime() >= windowEnd.getTime()) continue

      // The same rules the booking route applies, so a window on screen is a
      // window that will be accepted. Flyra already filters by its own
      // business hours; this is the belt to that braces, and it is what keeps
      // a 7:30 PM slot for a 2 hour Gold off the page.
      const rejected = slotRejection({
        start,
        durationMinutes: pkg.durationMinutes,
        now,
        minNoticeHours: settings.minNoticeHours,
        timeZone: tz,
        hours: config.hours,
      })
      if (rejected) continue

      const endStr = rawSlotEnd(raw)
      const end = endStr ? new Date(endStr) : new Date(start.getTime() + pkg.durationMinutes * 60_000)
      byStart.set(start.getTime(), {
        start: toZonedIso(start, tz),
        end: toZonedIso(Number.isNaN(end.getTime()) ? new Date(start.getTime() + pkg.durationMinutes * 60_000) : end, tz),
        label: formatTimeInZone(start, tz),
      })
    }
  }

  const grouped = new Map<string, SlotWindow[]>()
  for (const [instant, slot] of [...byStart.entries()].sort((a, b) => a[0] - b[0])) {
    const key = dateKeyInZone(new Date(instant), tz)
    const list = grouped.get(key) ?? []
    if (list.length < MAX_PER_DAY) list.push(slot)
    grouped.set(key, list)
  }

  // Every day in the strip is returned, including the empty ones, so the page
  // can show "nothing open" against a date rather than hiding the date and
  // leaving a visitor wondering whether it exists.
  const days: SlotDay[] = dayKeys(requestedKey, settings.daysAhead, tz).map((key) => ({
    date: key,
    label: formatDayLabel(key, tz),
    slots: grouped.get(key) ?? [],
  }))

  const body: SlotsResponse = {
    packageSlug: pkg.slug,
    packageName: pkg.name,
    durationMinutes: pkg.durationMinutes,
    durationLabel: formatDuration(pkg.durationMinutes),
    timezone: tz,
    timezoneLabel: zoneLabel(now, tz),
    days,
    available: true,
  }

  return NextResponse.json(body, { headers: { 'cache-control': 'no-store' } })
}
