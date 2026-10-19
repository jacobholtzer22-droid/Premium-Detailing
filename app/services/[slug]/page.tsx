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

      {service.comingSoon && (
        <div className="mx-auto max-w-page px-4 pt-8 sm:px-6">
          <p className="rounded-site border-l-4 border-blue-text bg-primary-soft px-5 py-4 text-base text-ink">
            <strong className="font-semibold">Coming soon.</strong> This service is not bookable yet. Send a quote
            request and we will come back to you with options and timing as soon as it is available.
          </p>
        </div>
      )}

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
              <p className="text-sm font-semibold uppercase tracking-wide text-muted">
                {service.comingSoon ? 'Coming soon' : 'Pricing'}
              </p>
              <p className="mt-2 font-heading text-3xl font-bold text-primary-dark">From ${formatPrice(service.priceFrom)}</p>
              {service.priceNote && <p className="mt-1 text-sm text-muted">{service.priceNote}</p>}
              {/* A service that cannot be booked never links to a calendar. */}
              {service.bookingUrl && !service.comingSoon ? (
                <a
                  href={service.bookingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn mt-5 inline-block rounded-site bg-accent px-5 py-3 text-sm font-semibold text-on-accent hover:bg-accent-dark"
                >
                  Book this package
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
              <p className="mt-2 text-sm text-ink">Pricing is {service.priceNote}.</p>
            </div>
          )}
        </aside>
      </div>

      {/* Same component and same data as the homepage; renders nothing until
          the client sends true pairs. `service` filters to pairs tagged for
          this page, plus any untagged ones. */}
      <BeforeAfter service={service.slug} />

      <FaqAccordion faqs={service.faqs} heading={`${service.name} Questions`} />
      <ServiceGrid heading="Other Services" exclude={service.slug} />
      <CtaBand heading={`Need ${service.name.toLowerCase()} in ${config.primaryCity}?`} />
    </>
  )
}
