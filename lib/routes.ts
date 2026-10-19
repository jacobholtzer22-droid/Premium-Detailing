import { config } from './config'

/**
 * Every public route on the site, derived from the same config arrays that
 * drive generateStaticParams. sitemap.ts and llms.txt read this, so the
 * sitemap cannot list a route that does not exist or miss one that does.
 */
export const STATIC_ROUTES = ['/', '/services', '/book', '/gallery', '/about', '/contact', '/privacy-policy'] as const

export function serviceRoutes(): string[] {
  return config.services.map((s) => `/services/${s.slug}`)
}

export function areaRoutes(): string[] {
  return config.serviceAreas.map((a) => `/areas/${a.slug}`)
}

export function allRoutes(): string[] {
  return [...STATIC_ROUTES, ...serviceRoutes(), ...areaRoutes()]
}
