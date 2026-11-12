import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import AddOnTable from '@/components/AddOnTable'
import BeforeAfter from '@/components/BeforeAfter'
import ContactFormGate from '@/components/ContactFormGate'
import CtaBand from '@/components/CtaBand'
import FaqAccordion from '@/components/FaqAccordion'
import Img from '@/components/Img'
import JsonLd from '@/components/JsonLd'
import PageHeader from '@/components/PageHeader'
import Link from 'next/link'
import ServiceGrid from '@/components/ServiceGrid'
import ServiceMap from '@/components/ServiceMap'
import TierTable from '@/components/TierTable'
import { bookingEnabled, config, priceLabel, getService } from '@/lib/config'
import { loadContent, readFrontmatter } from '@/lib/content'
import { breadcrumbList, faqPage, service as serviceSchema } from '@/lib/schema'
import { buildMetadata } from '@/lib/seo'

// No `dynamicParams = false` here: the build only ever prerenders these params
// anyway, and the flag makes `next dev` refuse the route.
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

/** One line telling a visitor whether they are driving to us. */
const WHERE_LABEL = {
  mobile: 'We come to you',
  shop: 'Done at the shop',
  property: 'Done at your property',
} as const

export default async function ServicePage({ params }: { params: { slug: string } }) {
  const service = getService(params.slug)
  if (!service) notFound()
  const { content } = await loadContent(`services/${service.slug}.mdx`, { service })
  const crumbs = crumbsFor(service.name, service.slug)
  const canBook = bookingEnabled()

  /**
   * The booking CTA, in order of how directly it leads to money.
   *
   * A service with tiers sends you down to the comparison, because the booking
   * lives on each tier and which one you want is the decision you have not
   * made yet. A service bookable in its own right goes straight to the flow
   * with itself preselected. Anything priced per vehicle goes to the form,
   * because sending somebody to a calendar for work nobody can price until
   * they see it wastes their time and ours.
   */
  const cta =
    service.tiers.length > 0
      ? { href: '#packages', label: 'See the packages', external: false }
      : service.booking && canBook
        ? { href: `/book?package=${service.slug}#book-now`, label: 'Book this service', external: false }
        : { href: `/contact?service=${service.slug}`, label: 'Get a quote', external: false }

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

          <div className="rounded-site border border-line bg-surface p-6">
            <p className="text-sm font-semibold uppercase tracking-wide text-muted">Pricing</p>
            {service.priceFrom !== null ? (
              <p className="mt-2 font-heading text-3xl font-bold text-primary-dark">
                From {priceLabel(service.priceFrom, service.priceUnit)}
              </p>
            ) : (
              <p className="mt-2 text-base text-ink">{service.priceNote}</p>
            )}
            {service.priceFrom !== null && service.priceNote && (
              <p className="mt-1 text-sm text-muted">{service.priceNote}</p>
            )}
            {service.where && (
              <p className="mt-3 text-sm font-medium text-blue-text">{WHERE_LABEL[service.where]}</p>
            )}
            <Link
              href={cta.href}
              className="btn mt-5 inline-flex min-h-[44px] items-center rounded-site bg-accent px-5 py-3 text-sm font-semibold text-on-accent hover:bg-accent-dark"
            >
              {cta.label}
            </Link>
          </div>

          {/* The shop, on a map, for the work that happens there. A visitor
              about to drop a car off needs to know where they are driving
              before they commit to the day. */}
          {service.where === 'shop' && (
            <div className="rounded-site border border-line bg-surface p-6">
              <p className="text-sm font-semibold uppercase tracking-wide text-muted">The shop</p>
              <ServiceMap className="mt-4" />
            </div>
          )}
        </aside>
      </div>

      {/* Renders nothing for a service with no tiers. */}
      <TierTable service={service} />

      <AddOnTable
        addOns={service.addOns}
        heading={service.slug === 'ceramic-coating' ? 'Coating add-ons' : 'Add-ons'}
        intro={
          service.slug === 'ceramic-coating'
            ? 'Priced per area and applied alongside the paint coating.'
            : 'Each priced on its own and available with any of the packages above. Ask for what you want when you book.'
        }
      />

      {/* Same component and same data as the homepage; renders nothing until
          the client sends true pairs. `service` filters to pairs tagged for
          this page, plus any untagged ones. */}
      <BeforeAfter service={service.slug} />

      {/* Fleet work is a conversation, not a package, so this one page carries
          the quote form itself rather than sending a dealer to /contact and
          hoping they arrive. The form is the sealed platform component, reused
          as it is. */}
      {service.slug === 'dealerships-fleet' && (
        <section className="border-t border-line bg-surface">
          <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 md:py-24">
            <h2 className="font-heading text-3xl font-bold text-primary-dark md:text-4xl">Tell us about the fleet</h2>
            <p className="mt-4 text-base leading-relaxed text-muted">
              How many vehicles, what sort of state they are usually in and how often you need them done. We will come
              back with a figure and a schedule.
            </p>
            <div className="mt-8">
              <ContactFormGate />
            </div>
          </div>
        </section>
      )}

      <FaqAccordion faqs={service.faqs} heading={`${service.name} Questions`} />
      <ServiceGrid heading="Other Services" exclude={service.slug} />
      <CtaBand heading={`Need ${service.name.toLowerCase()} in ${config.primaryCity}?`} />
    </>
  )
}
