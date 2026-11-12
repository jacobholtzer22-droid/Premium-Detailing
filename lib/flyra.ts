import 'server-only'

/**
 * The Flyra client. SERVER ONLY, and the `import 'server-only'` above is what
 * enforces it: importing this file from a client component is a build error,
 * not a runtime surprise that ships the API key to a browser.
 *
 * FLYRA_API_KEY is read from the environment on every call and never leaves
 * this file. It is not logged, not echoed in an error message, not attached to
 * a thrown object, and not included in anything returned to a caller. The
 * scrub in `redact()` is the second line of defence for the case nobody
 * predicted: a Flyra error body that quotes the key back at us.
 *
 * Spec: https://developers.flyra.io/openapi.json, version 2026-06-01, read
 * 2026-11-11. Results come back under "data". A 429 carries Retry-After.
 */

const BASE = 'https://app.flyra.io/v2026-06-01'
const TIMEOUT_MS = 10_000
/** One retry only. A visitor is waiting, and Flyra rate limits per org. */
const MAX_RETRY_WAIT_MS = 5_000

export class FlyraError extends Error {
  readonly status: number | null
  /** True when the call never reached Flyra, so nothing was created. */
  readonly transport: boolean

  constructor(message: string, status: number | null, transport = false) {
    super(message)
    this.name = 'FlyraError'
    this.status = status
    this.transport = transport
  }
}

export class FlyraNotConfiguredError extends FlyraError {
  constructor() {
    super('FLYRA_API_KEY is not set', null, true)
    this.name = 'FlyraNotConfiguredError'
  }
}

/**
 * Strips anything that looks like a Flyra key out of text before it can reach
 * a log line or an error message. Live keys are prefixed flr_live_, so the
 * pattern covers flr_ plus whatever follows it.
 */
function redact(text: string): string {
  return text.replace(/flr_[A-Za-z0-9_-]+/g, 'flr_[redacted]')
}

function apiKey(): string {
  const key = process.env.FLYRA_API_KEY
  if (!key || key.trim().length === 0) throw new FlyraNotConfiguredError()
  return key.trim()
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function retryAfterMs(res: Response): number {
  const header = res.headers.get('retry-after')
  if (!header) return 1_000
  const seconds = Number(header)
  if (Number.isFinite(seconds)) return Math.min(Math.max(seconds, 0) * 1000, MAX_RETRY_WAIT_MS)
  const date = Date.parse(header)
  if (Number.isFinite(date)) return Math.min(Math.max(date - Date.now(), 0), MAX_RETRY_WAIT_MS)
  return 1_000
}

interface Envelope<T> {
  data?: T
}

async function request<T>(path: string, init: { method: 'GET' | 'POST'; body?: unknown }, attempt = 0): Promise<T> {
  const key = apiKey()
  let res: Response
  try {
    res = await fetch(`${BASE}${path}`, {
      method: init.method,
      headers: {
        // The one place the key is used. Never logged, never returned.
        authorization: `Bearer ${key}`,
        accept: 'application/json',
        ...(init.body === undefined ? {} : { 'content-type': 'application/json' }),
      },
      ...(init.body === undefined ? {} : { body: JSON.stringify(init.body) }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
      cache: 'no-store',
    })
  } catch (err) {
    // A timeout or a DNS failure. Nothing was created, which the caller needs
    // to know: it is safe to tell the visitor to try again.
    const reason = err instanceof Error ? err.name : 'unknown'
    throw new FlyraError(`Flyra request to ${path} did not complete (${reason})`, null, true)
  }

  if (res.status === 429 && attempt === 0) {
    await sleep(retryAfterMs(res))
    return request<T>(path, init, attempt + 1)
  }

  const text = await res.text()

  if (!res.ok) {
    // A short, scrubbed excerpt only. Enough to find the problem in a log,
    // never the whole body and never a header.
    const excerpt = redact(text).slice(0, 200)
    throw new FlyraError(`Flyra ${init.method} ${path} returned ${res.status}: ${excerpt}`, res.status)
  }

  if (text.length === 0) return undefined as T
  let parsed: unknown
  try {
    parsed = JSON.parse(text)
  } catch {
    throw new FlyraError(`Flyra ${init.method} ${path} returned ${res.status} with a body that is not JSON`, res.status)
  }
  const envelope = parsed as Envelope<T>
  return (envelope && typeof envelope === 'object' && 'data' in envelope ? envelope.data : parsed) as T
}

/** True when a key is present. Routes use this to fail soft instead of throwing. */
export function flyraConfigured(): boolean {
  const key = process.env.FLYRA_API_KEY
  return Boolean(key && key.trim().length > 0)
}

// ---------------------------------------------------------------- reads

export interface FlyraEmployee {
  id: string
  first_name?: string
  last_name?: string
  name?: string
  email?: string
}

export function listEmployees(): Promise<FlyraEmployee[]> {
  return request<FlyraEmployee[]>('/employees', { method: 'GET' })
}

export interface FlyraService {
  id?: string
  name: string
  price?: number
}

export function listServices(): Promise<FlyraService[]> {
  return request<FlyraService[]>('/services', { method: 'GET' })
}

/**
 * The first open windows for one employee, inside the org's business hours and
 * timezone. Flyra decides what "open" means, which is the point: it holds the
 * real calendar, so it is the only thing that can answer without a race.
 *
 * The shape of each returned window is not pinned by the spec beyond carrying
 * a start, so `normaliseSlot` below accepts the three spellings Flyra uses for
 * the same idea rather than assuming one.
 */
export interface FlyraSlotRaw {
  start?: string
  end?: string
  start_time?: string
  end_time?: string
  scheduled_start?: string
  scheduled_end?: string
}

export function findOpenSlots(args: {
  employeeId: string
  durationMinutes: number
  startAfter?: string
  slots?: number
  skipWeekends?: boolean
}): Promise<FlyraSlotRaw[]> {
  return request<FlyraSlotRaw[]>('/actions/flyra_find_open_slot', {
    method: 'POST',
    body: {
      employee_id: args.employeeId,
      duration_minutes: args.durationMinutes,
      ...(args.startAfter ? { start_after: args.startAfter } : {}),
      ...(args.slots ? { slots: args.slots } : {}),
      ...(args.skipWeekends === undefined ? {} : { skip_weekends: args.skipWeekends }),
    },
  })
}

export interface FlyraAvailability {
  available?: boolean
  is_available?: boolean
}

export function checkAvailability(args: {
  employeeId: string
  start: string
  durationMinutes: number
}): Promise<FlyraAvailability> {
  return request<FlyraAvailability>('/actions/flyra_check_availability', {
    method: 'POST',
    body: {
      employee_id: args.employeeId,
      start: args.start,
      duration_minutes: args.durationMinutes,
    },
  })
}

// ---------------------------------------------------------------- writes

export interface FlyraCustomer {
  id: string
}

/**
 * if_exists "return" reuses an existing customer on an email or phone match,
 * which is what stops a repeat customer getting a second record every time
 * they book through the website.
 */
export function createCustomer(args: {
  firstName: string
  lastName: string
  email?: string
  mobilePhone: string
  address?: string
  unit?: string
  city?: string
  state?: string
  zip?: string
  notes?: string
}): Promise<FlyraCustomer> {
  return request<FlyraCustomer>('/actions/flyra_create_customer', {
    method: 'POST',
    body: {
      first_name: args.firstName,
      last_name: args.lastName,
      ...(args.email ? { email: args.email } : {}),
      mobile_phone: args.mobilePhone,
      ...(args.address ? { address: args.address } : {}),
      ...(args.unit ? { unit: args.unit } : {}),
      ...(args.city ? { city: args.city } : {}),
      ...(args.state ? { state: args.state } : {}),
      ...(args.zip ? { zip: args.zip } : {}),
      ...(args.notes ? { notes: args.notes } : {}),
      if_exists: 'return',
    },
  })
}

export interface FlyraJob {
  id?: string
  job_id?: string
  status?: string
}

/**
 * `send_confirmation` is deliberately NOT sent, so Flyra applies its own
 * setting and texts the confirmation itself. The site promises the visitor a
 * text; passing false here would silently break that promise.
 *
 * `dispatched_employee_ids` is not optional in practice even though the API
 * allows it to be: a job created with nobody dispatched sits on no calendar,
 * so the availability calls would not see it and two website bookings could
 * take the same slot.
 */
export function createJob(args: {
  customerId: string
  service: string
  scheduledStart: string
  scheduledEnd: string
  notes?: string
  price?: number
  dispatchedEmployeeIds: string[]
}): Promise<FlyraJob> {
  return request<FlyraJob>('/actions/flyra_create_job', {
    method: 'POST',
    body: {
      customer_id: args.customerId,
      service: args.service,
      scheduled_start: args.scheduledStart,
      scheduled_end: args.scheduledEnd,
      ...(args.notes ? { notes: args.notes } : {}),
      ...(args.price === undefined ? {} : { price: args.price }),
      dispatched_employee_ids: args.dispatchedEmployeeIds,
    },
  })
}

/** The start of a window, whichever of Flyra's three spellings it arrived as. */
export function rawSlotStart(slot: FlyraSlotRaw): string | null {
  return slot.start ?? slot.start_time ?? slot.scheduled_start ?? null
}

export function rawSlotEnd(slot: FlyraSlotRaw): string | null {
  return slot.end ?? slot.end_time ?? slot.scheduled_end ?? null
}

/** The job id, whichever spelling Flyra used. */
export function jobId(job: FlyraJob): string | null {
  return job.id ?? job.job_id ?? null
}

export function isAvailable(res: FlyraAvailability): boolean {
  return res.available === true || res.is_available === true
}
