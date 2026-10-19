import rawConfig from '@/site.config'
import { deriveConfig, siteConfigSchema, type SiteConfig } from './config-schema'

export { CONTACT_ENDPOINT, HONEYPOT_FIELD } from './config-schema'
export type { Faq, Review, Service, ServiceArea, SiteConfig } from './config-schema'

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
