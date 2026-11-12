import rawConfig from '@/site.config'
import { deriveConfig, siteConfigSchema, type SiteConfig } from './config-schema'

export { CONTACT_ENDPOINT, HONEYPOT_FIELD, formatDuration, formatPrice, priceLabel } from './config-schema'
export type {
  AddOn,
  BookingSettings,
  Faq,
  FlyraBooking,
  Review,
  Service,
  ServiceArea,
  ServiceTier,
  SiteConfig,
  Specials,
} from './config-schema'

function parseOrThrow(): SiteConfig {
  const result = siteConfigSchema.safeParse(rawConfig)
  if (!result.success) {
    const lines = result.error.issues.map((i) => `  - ${i.path.join('.') || '(root)'}: ${i.message}`)
    throw new Error(`site.config.ts failed validation:\n${lines.join('\n')}`)
  }
  return deriveConfig(result.data)
}

/**
 * The validated, typed config. Parsed once at module load: an invalid
 * site.config.ts throws here and fails `next build` before any page renders.
 */
export const config: SiteConfig = parseOrThrow()

export function getService(slug: string) {
  return config.services.find((s) => s.slug === slug) ?? null
}

export function getArea(slug: string) {
  return config.serviceAreas.find((a) => a.slug === slug) ?? null
}

/** Minutes-since-midnight "HH:MM" -> "8:00 AM". */
export function formatTime(hhmm: string): string {
  const [h = 0, m = 0] = hhmm.split(':').map(Number)
  const suffix = h >= 12 ? 'PM' : 'AM'
  const hour12 = h % 12 === 0 ? 12 : h % 12
  return `${hour12}:${String(m).padStart(2, '0')} ${suffix}`
}

/**
 * The packages that can actually be booked online, flattened across every
 * service, in config order.
 *
 * One function because four surfaces need the same answer and must never
 * disagree about it: /book builds a card per bookable package, the package
 * table links to it, the booking API resolves a slug to its Flyra service name
 * and duration, and the slot route reads the duration to ask Flyra for windows
 * that long. A slug that is not in this list is not bookable, which is how the
 * API rejects a tampered package without a second allowlist to keep in sync.
 */
export interface BookablePackage {
  /** URL slug: "<service>-<tier>" for a tier, or the service slug on its own. */
  slug: string
  name: string
  serviceSlug: string
  anchor: string | null
  priceFrom: number | null
  priceNote: string | null
  includes: readonly string[]
  /** EXACT Flyra price-book name, and the length of the window to reserve. */
  flyraService: string
  durationMinutes: number
}

export function bookablePackages(): BookablePackage[] {
  const out: BookablePackage[] = []
  for (const s of config.services) {
    for (const t of s.tiers) {
      if (!t.booking) continue
      out.push({
        slug: `${s.slug}-${t.slug}`,
        name: t.name,
        serviceSlug: s.slug,
        anchor: t.anchor,
        priceFrom: t.priceFrom,
        priceNote: t.priceNote,
        includes: t.includes,
        flyraService: t.booking.flyraService,
        durationMinutes: t.booking.durationMinutes,
      })
    }
    if (s.booking) {
      out.push({
        slug: s.slug,
        name: s.name,
        serviceSlug: s.slug,
        anchor: null,
        priceFrom: s.priceFrom,
        priceNote: s.priceNote,
        includes: [],
        flyraService: s.booking.flyraService,
        durationMinutes: s.booking.durationMinutes,
      })
    }
  }
  return out
}

export function getBookablePackage(slug: string): BookablePackage | null {
  return bookablePackages().find((p) => p.slug === slug) ?? null
}

/**
 * True when online booking is wired end to end. Everything falls back to a
 * quote CTA when it is false, which is the safe state: with no tech ids there
 * is nobody to check availability against, and a booking dispatched to nobody
 * is a job that never gets done.
 */
export function bookingEnabled(): boolean {
  return Boolean(config.booking && config.booking.techIds.length > 0 && bookablePackages().length > 0)
}

/** "2190 Reserve Park Trace, Port St. Lucie, FL 34986", for map and directions URLs. */
export function addressLine(): string | null {
  const a = config.address
  return a ? `${a.street}, ${a.city}, ${a.state} ${a.zip}` : null
}

/** Services whose work happens at the shop, so the page shows the map and directions. */
export function isShopService(slug: string): boolean {
  return getService(slug)?.where === 'shop'
}
