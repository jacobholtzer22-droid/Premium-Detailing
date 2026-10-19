import type { Metadata } from 'next'
import { config } from './config'
import type { Service, ServiceArea } from './config-schema'
import { getImage, hasImage } from './images'

/**
 * Title template applied by the root layout. Every builder below already
 * includes the display name, so no suffix is appended, but the template is
 * still applied here so `renderedTitleLength` is the number a browser shows.
 */
export const TITLE_TEMPLATE = '%s'

export function renderTitle(raw: string): string {
  return TITLE_TEMPLATE.replace('%s', raw)
}

export { DESCRIPTION_MAX, DESCRIPTION_MIN, TITLE_MAX, TITLE_MIN } from '@/scripts/verify-limits'

export type PageKind = 'home' | 'service' | 'area' | 'services' | 'about' | 'contact' | 'privacy' | 'other'

export interface BuildMetadataArgs {
  kind: PageKind
  path: string
  service?: Service
  area?: ServiceArea
  /** Overrides the derived title for kind 'other'. Ignored for home/service/area. */
  title?: string
  /** Page description, 140 to 160 characters. Falls back to a config-derived default. */
  description?: string
  /** Manifest filename for the og:image. Falls back to the hero. */
  image?: string | null
}

export function canonicalUrl(path: string): string {
  return new URL(path, config.domain).toString()
}

export function buildTitle(args: Pick<BuildMetadataArgs, 'kind' | 'service' | 'area' | 'title'>): string {
  const { displayName, primaryCity, primaryState, tradeLabel } = config
  switch (args.kind) {
    case 'home':
      return `${displayName} | ${tradeLabel} in ${primaryCity}, ${primaryState}`
    case 'service':
      if (!args.service) throw new Error('buildTitle: kind "service" needs a service')
      return `${args.service.name} in ${primaryCity} | ${displayName}`
    case 'area':
      if (!args.area) throw new Error('buildTitle: kind "area" needs an area')
      return `${tradeLabel} in ${args.area.name}, ${primaryState} | ${displayName}`
    case 'services':
      return `All Services in ${primaryCity} | ${displayName}`
    case 'about':
      return `About ${displayName} | ${primaryCity}, ${primaryState}`
    case 'contact':
      return `Contact ${displayName} | ${primaryCity}, ${primaryState}`
    case 'privacy':
      return `Privacy Policy and Data Use | ${displayName}`
    case 'other':
      if (!args.title) throw new Error('buildTitle: kind "other" needs a title')
      return `${args.title} | ${displayName}`
  }
}

/**
 * Default descriptions built from config. Content files can override these in
 * frontmatter; verify.ts checks the rendered length either way.
 */
export function defaultDescription(args: Pick<BuildMetadataArgs, 'kind' | 'service' | 'area'>): string {
  const { displayName, primaryCity, primaryState, tradeLabel, phoneDisplay } = config
  const services = config.services.map((s) => s.name.toLowerCase())
  const list = services.length > 1 ? `${services.slice(0, -1).join(', ')} and ${services.at(-1)}` : services[0]
  switch (args.kind) {
    case 'home':
      return `${displayName} provides ${list} for homes in ${primaryCity}, ${primaryState} and nearby towns. Call ${phoneDisplay} or request a free quote online.`
    case 'service':
      return `${args.service?.shortDescription ?? ''} Serving ${primaryCity}, ${primaryState}. Call ${displayName} at ${phoneDisplay} for a free quote.`
    case 'area':
      return `${displayName} offers ${list} in ${args.area?.name ?? primaryCity}, ${primaryState}. Local crew, clear quotes, and reliable scheduling. Call ${phoneDisplay} to get started.`
    case 'services':
      return `See every service ${displayName} offers in ${primaryCity}, ${primaryState}: ${list}. Each page explains what is included and answers common questions.`
    case 'about':
      return `Meet ${displayName}, the local crew behind ${tradeLabel.toLowerCase()} in ${primaryCity}, ${primaryState}. Learn how we work and why neighbors keep calling us back.`
    case 'contact':
      return `Contact ${displayName} for ${tradeLabel.toLowerCase()} and more in ${primaryCity}, ${primaryState}. Call ${phoneDisplay} or send a message to request a free quote.`
    case 'privacy':
      return `How ${displayName} handles information you share through this website, including contact form details, text message consent, and how to reach us.`
    case 'other':
      return `${displayName} serves ${primaryCity}, ${primaryState} and the surrounding area. Call ${phoneDisplay} or send a message through the contact form to request a free quote.`
  }
}

export interface BuiltMetadata {
  metadata: Metadata
  renderedTitle: string
  /** Length of the title exactly as the browser will render it, template included. */
  renderedTitleLength: number
  description: string
}

export function buildMetadata(args: BuildMetadataArgs): BuiltMetadata {
  const rawTitle = buildTitle(args)
  const renderedTitle = renderTitle(rawTitle)
  const description = args.description ?? defaultDescription(args)
  const url = canonicalUrl(args.path)

  const imageName = args.image ?? config.images.hero
  const ogImage = imageName && hasImage(imageName) ? getImage(imageName) : null

  const metadata: Metadata = {
    title: { absolute: renderedTitle },
    description,
    alternates: { canonical: url },
    openGraph: {
      type: 'website',
      locale: 'en_US',
      siteName: config.displayName,
      title: renderedTitle,
      description,
      url,
      ...(ogImage
        ? { images: [{ url: canonicalUrl(ogImage.src), width: ogImage.width, height: ogImage.height, alt: ogImage.alt }] }
        : {}),
    },
    twitter: {
      card: ogImage ? 'summary_large_image' : 'summary',
      title: renderedTitle,
      description,
      ...(ogImage ? { images: [canonicalUrl(ogImage.src)] } : {}),
    },
  }

  return { metadata, renderedTitle, renderedTitleLength: renderedTitle.length, description }
}
