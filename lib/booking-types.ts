/**
 * The wire shapes the booking page and the booking routes agree on.
 *
 * TYPES ONLY. The client imports these with `import type`, so nothing in this
 * file reaches the browser bundle, and nothing in it can reach the Flyra key:
 * a slot carries a start and an end, never which tech is free at that time.
 * Which tech takes the job is decided server-side at the moment of booking,
 * which is also the only moment the answer is still true.
 */

/** One open window, as ISO strings carrying the business zone's offset. */
export interface SlotWindow {
  start: string
  end: string
  /** "1:30 PM", already rendered in the business zone so the client never formats a time. */
  label: string
}

export interface SlotDay {
  /** "2026-11-14" in the business zone. */
  date: string
  /** "Sat, Nov 14". */
  label: string
  slots: SlotWindow[]
}

export interface SlotsResponse {
  packageSlug: string
  packageName: string
  durationMinutes: number
  /** Human text for the length, e.g. "about 45 minutes". */
  durationLabel: string
  timezone: string
  /** Short zone name as a visitor reads it, e.g. "EST". */
  timezoneLabel: string
  days: SlotDay[]
  /**
   * False when online booking is switched off or unreachable. The page then
   * shows its call-us state instead of an empty calendar, because an empty
   * calendar reads as "they are fully booked".
   */
  available: boolean
}

export interface BookingRequestBody {
  packageSlug: string
  /** The exact `start` string from a SlotWindow. */
  slotStart: string
  firstName: string
  lastName: string
  phone: string
  email?: string
  address: string
  unit?: string
  city: string
  state?: string
  zip: string
  vehicleYear: string
  vehicleMake: string
  vehicleModel: string
  notes?: string
  /** Honeypot. Any value at all means a bot filled it. */
  hp_7d3a_ref?: string
  /** epoch ms when the form was first rendered, for the minimum fill time. */
  startedAt: number
}

export interface BookingSuccess {
  ok: true
  jobId: string
  start: string
  end: string
  /** "Sat, Nov 14 at 1:30 PM EST", rendered server-side in the business zone. */
  when: string
}

export interface BookingFailure {
  ok: false
  /** Shown to the visitor verbatim. Never carries an internal detail. */
  error: string
  /**
   * 'taken'     the slot went while they were filling the form; reload slots
   * 'invalid'   something in the form needs fixing
   * 'unavailable' booking is off; show the phone number
   * 'failed'    we could not finish; show the phone number
   */
  code: 'taken' | 'invalid' | 'unavailable' | 'failed'
}

export type BookingResponse = BookingSuccess | BookingFailure
