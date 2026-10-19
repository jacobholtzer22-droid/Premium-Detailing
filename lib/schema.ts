import { config } from './config'
import type { Faq, Service, ServiceArea, SiteConfig } from './config-schema'
import { getImage, hasImage } from './images'

/**
 * JSON-LD builders. Pure functions of config; no side effects, no authoring.
 *
 * The rule that a null config value can never become a schema property is
 * enforced by `when()`: a property is only spread into the object when its
 * backing value is present, so there is no code path that emits it otherwise.
 */

type Json = Record<string, unknown>

function when<T>(value: T | null | undefined, build: (v: NonNullable<T>) => Json): Json {
  return value === null || value === undefined ? {} : build(value as NonNullable<T>)
}

function whenNonEmpty<T>(value: readonly T[], build: (v: readonly T[]) => Json): Json {
  return value.length === 0 ? {} : build(value)
}

const site = () => config.domain
export const BUSINESS_ID = () => `${site()}/#business`
export const ORGANIZATION_ID = () => `${site()}/#organization`
export const WEBSITE_ID = () => `${site()}/#website`

function absolute(path: string): string {
  return new URL(path, site()).toString()
}

function sameAs(c: SiteConfig): string[] {
  return Object.values(c.profiles).filter((v): v is string => typeof v === 'string' && v.length > 0)
}

function heroImageUrl(c: SiteConfig): string | null {
  return c.images.hero && hasImage(c.images.hero) ? absolute(getImage(c.images.hero).src) : null
}

function areaServed(areas: readonly ServiceArea[]): Json[] {
  return areas.map((a) => ({ '@type': 'City', name: a.name }))
}

function aggregateRating(c: SiteConfig): Json {
  return whenNonEmpty(c.reviews, (reviews) => {
    const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    return {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: Number(avg.toFixed(1)),
        reviewCount: reviews.length,
        bestRating: 5,
        worstRating: 1,
      },
      review: reviews.map((r) => ({
        '@type': 'Review',
        author: { '@type': 'Person', name: r.author },
        reviewRating: { '@type': 'Rating', ratingValue: r.rating, bestRating: 5, worstRating: 1 },
        reviewBody: r.text,
        publisher: { '@type': 'Organization', name: r.source },
        url: r.url,
      })),
    }
  })
}

/**
 * The business itself, typed as config.schemaType. Pass `areas` to scope
 * areaServed to one service area (used on area pages).
 */
export function localBusiness(areas: readonly ServiceArea[] = config.serviceAreas): Json {
  const c = config
  const image = heroImageUrl(c)
  return {
    '@context': 'https://schema.org',
    '@type': c.schemaType,
    '@id': BUSINESS_ID(),
    name: c.displayName,
    legalName: c.legalName,
    description: c.tagline,
    url: site(),
    telephone: c.phone,
    ...when(c.email, (email) => ({ email })),
    ...when(image, (img) => ({ image: img, logo: img })),
    ...when(c.address, (a) => ({
      address: {
        '@type': 'PostalAddress',
        streetAddress: a.street,
        addressLocality: a.city,
        addressRegion: a.state,
        postalCode: a.zip,
        addressCountry: 'US',
      },
      ...when(a.lat !== null && a.lng !== null ? { lat: a.lat, lng: a.lng } : null, (geo) => ({
        geo: { '@type': 'GeoCoordinates', latitude: geo.lat, longitude: geo.lng },
      })),
    })),
    ...when(c.hours, (hours) => ({
      openingHoursSpecification: hours.map((h) => ({
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: h.day,
        opens: h.open,
        closes: h.close,
      })),
    })),
    areaServed: areaServed(areas),
    ...whenNonEmpty(sameAs(c), (urls) => ({ sameAs: urls })),
    ...when(c.yearsInBusiness, (years) => ({ foundingDate: String(new Date().getFullYear() - years) })),
    ...aggregateRating(c),
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: `${c.displayName} services`,
      itemListElement: c.services.map((s) => ({
        '@type': 'Offer',
        itemOffered: { '@type': 'Service', name: s.name, url: absolute(`/services/${s.slug}`) },
      })),
    },
  }
}

export function organization(): Json {
  const c = config
  const image = heroImageUrl(c)
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': ORGANIZATION_ID(),
    name: c.displayName,
    legalName: c.legalName,
    url: site(),
    telephone: c.phone,
    ...when(c.email, (email) => ({ email })),
    ...when(image, (img) => ({ logo: img })),
    ...whenNonEmpty(sameAs(c), (urls) => ({ sameAs: urls })),
  }
}

export function website(): Json {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': WEBSITE_ID(),
    name: config.displayName,
    url: site(),
    publisher: { '@id': ORGANIZATION_ID() },
    inLanguage: 'en-US',
  }
}

export function service(s: Service): Json {
  const c = config
  const img = s.image && hasImage(s.image) ? absolute(getImage(s.image).src) : null
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    '@id': `${absolute(`/services/${s.slug}`)}#service`,
    name: s.name,
    serviceType: s.name,
    description: s.shortDescription,
    url: absolute(`/services/${s.slug}`),
    provider: { '@id': BUSINESS_ID() },
    areaServed: areaServed(c.serviceAreas),
    ...when(img, (image) => ({ image })),
    ...when(s.priceFrom, (price) => ({
      offers: {
        '@type': 'Offer',
        price: String(price),
        priceCurrency: 'USD',
        ...when(s.priceNote, (note) => ({ description: `From $${price} ${note}` })),
      },
    })),
  }
}

/** Returns null for an empty list so a page never emits an empty FAQPage. */
export function faqPage(faqs: readonly Faq[]): Json | null {
  if (faqs.length === 0) return null
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  }
}

export interface Crumb {
  name: string
  path: string
}

export function breadcrumbList(trail: readonly Crumb[]): Json {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: trail.map((crumb, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: crumb.name,
      item: absolute(crumb.path),
    })),
  }
}
