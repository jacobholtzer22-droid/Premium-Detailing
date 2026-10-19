import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import BeforeAfter from '@/components/BeforeAfter'
import CoverageList from '@/components/CoverageList'
import CtaBand from '@/components/CtaBand'
import FaqAccordion from '@/components/FaqAccordion'
import Img from '@/components/Img'
import JsonLd from '@/components/JsonLd'
import PageHeader from '@/components/PageHeader'
import Link from 'next/link'
import ServiceGrid from '@/components/ServiceGrid'
import TierTable from '@/components/TierTable'
import { config, formatPrice, getService } from '@/lib/config'
import { loadContent, readFrontmatter } from '@/lib/content'
import { breadcrumbList, faqPage, service as serviceSchema } from '@/lib/schema'
import { buildMetadata } from '@/lib/seo'

// No `dynamicParams = false` here: with output: 'export' the static build only
// ever serves these params anyway, and the flag makes `next dev` refuse the route.
export function generateStaticParams() {
  return config.services.map((s) => ({ slug: s.slug }))
}

function crumbsFor(name: string, slug: string) {
  return [
    { name: 'Home', path: '/' },
    { name: 'Services', path: '/services' },
    { name, path: `/services/${slug}` },
  ]
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const service = getService(params.slug)
  if (!service) return {}
  const fm = readFrontmatter(`services/${service.slug}.mdx`)
  return buildMetadata({
    kind: 'service',
    service,
    path: `/services/${service.slug}`,
    description: fm.description,
    image: fm.image ?? service.image,
  }).metadata
}

export default async function ServicePage({ params }: { params: { slug: string } }) {
  const service = getService(params.slug)
  if (!service) notFound()
  const { content } = await loadContent(`services/${service.slug}.mdx`, { service })
  const crumbs = crumbsFor(service.name, service.slug)

  return (
    <>
      <JsonLd data={serviceSchema(service)} />
      <JsonLd data={faqPage(service.faqs)} />
      <JsonLd data={breadcrumbList(crumbs)} />

      <PageHeader title={`${service.name} in ${config.primaryCity}`} intro={service.shortDescription} crumbs={crumbs} />

      <div className="mx-auto grid max-w-page gap-10 px-4 pt-10 sm:px-6 lg:grid-cols-3">
        <article className="lg:col-span-2">{content}</article>
        <aside className="space-y-6">
          {service.image && (
            <div className="overflow-hidden rounded-site">
              <Img name={service.image} sizes="(min-width: 1024px) 33vw, 100vw" className="h-auto w-full" />
            </div>
          )}
          {service.priceFrom !== null && (
            <div className="rounded-site border border-line bg-surface p-6">
              <p className="text-sm font-semibold uppercase tracking-wide text-muted">Pricing</p>
              <p className="mt-2 font-heading text-3xl font-bold text-primary-dark">From ${formatPrice(service.priceFrom)}</p>
              {service.priceNote && <p className="mt-1 text-sm text-muted">{service.priceNote}</p>}
              {/*
                Three CTAs, in order of how directly they lead to money:
                a service with tiers sends you down to the comparison (the
                calendars live on the tiers, not here), a service with its own
                calendar links to it, and anything quoted per vehicle goes to
                the form.
              */}
              {service.tiers.length > 0 ? (
                <a
                  href="#packages"
                  className="btn mt-5 inline-block rounded-site bg-accent px-5 py-3 text-sm font-semibold text-on-accent hover:bg-accent-dark"
                >
                  See the packages
                </a>
              ) : service.bookingUrl ? (
                <a
                  href={service.bookingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn mt-5 inline-block rounded-site bg-accent px-5 py-3 text-sm font-semibold text-on-accent hover:bg-accent-dark"
                >
                  Book this service
                </a>
              ) : (
                <Link
                  href="/contact"
                  className="btn mt-5 inline-block rounded-site bg-accent px-5 py-3 text-sm font-semibold text-on-accent hover:bg-accent-dark"
                >
                  Get a quote
                </Link>
              )}
            </div>
          )}
          {service.priceFrom === null && service.priceNote && (
            <div className="rounded-site border border-line bg-surface p-6">
              <p className="text-sm font-semibold uppercase tracking-wide text-muted">Pricing</p>
              <p className="mt-2 text-base text-ink">{service.priceNote}</p>
              <Link
                href="/contact"
                className="btn mt-5 inline-block rounded-site bg-accent px-5 py-3 text-sm font-semibold text-on-accent hover:bg-accent-dark"
              >
                Get a quote
              </Link>
            </div>
          )}
        </aside>
      </div>

      {/* Same component and same data as the homepage; renders nothing until
          the client sends true pairs. `service` filters to pairs tagged for
          this page, plus any untagged ones. */}
      {/* Renders nothing for a service with no tiers. */}
      <TierTable service={service} />

      <BeforeAfter service={service.slug} />

      <FaqAccordion faqs={service.faqs} heading={`${service.name} Questions`} />
      <ServiceGrid heading="Other Services" exclude={service.slug} />
      <CtaBand heading={`Need ${service.name.toLowerCase()} in ${config.primaryCity}?`} />
    </>
  )
}
