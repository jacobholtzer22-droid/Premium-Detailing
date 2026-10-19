import type { Metadata } from 'next'
import Link from 'next/link'
import BrandMark from '@/components/BrandMark'
import CtaBand from '@/components/CtaBand'
import Phone from '@/components/Phone'
import Reveal from '@/components/Reveal'
import { config, formatPrice } from '@/lib/config'
import { buildMetadata } from '@/lib/seo'

const DESCRIPTION =
  'Pick a detailing package and book a time, or request a quote for ceramic coating, paint protection film, paint correction and window tinting.'

export const metadata: Metadata = buildMetadata({
  kind: 'other',
  path: '/book',
  title: `Book a Detail in ${config.primaryCity}`,
  description: DESCRIPTION,
}).metadata

/**
 * The booking page.
 *
 * This is the ONE place on the site that renders a dollar sign for every
 * service at once, and every figure comes from config: either a service's
 * priceFrom or a tier's. No price is ever typed into content.
 *
 * The cards are FLATTENED: a service sold as a price ladder contributes one
 * card per package rather than one card for the service, because somebody on
 * this page has already decided to buy and is choosing between Bronze, Silver
 * and Gold, not between "mobile detailing" and "tint".
 *
 * A card with a calendar gets a booking button. Everything quoted per vehicle
 * gets a quote button, because sending somebody to a calendar for work that
 * cannot be priced until it is seen wastes their time and ours.
 */
interface Card {
  key: string
  name: string
  href: string
  priceFrom: number | null
  priceNote: string | null
  blurb: string
  bookingUrl: string | null
  /** A tier of a larger service, which is what makes it a "package". */
  isTier: boolean
}

function cards(): Card[] {
  return config.services.flatMap<Card>((s) => {
    if (s.tiers.length > 0) {
      return s.tiers.map((t) => ({
        key: `${s.slug}-${t.slug}`,
        name: t.name,
        href: `/services/${s.slug}#${t.anchor}`,
        priceFrom: t.priceFrom,
        priceNote: t.priceNote,
        blurb: t.includes.join('. ') + '.',
        bookingUrl: t.bookingUrl,
        isTier: true,
      }))
    }
    return [
      {
        key: s.slug,
        name: s.name,
        href: `/services/${s.slug}`,
        priceFrom: s.priceFrom,
        priceNote: s.priceNote,
        blurb: s.shortDescription,
        bookingUrl: s.bookingUrl,
        isTier: false,
      },
    ]
  })
}

export default function BookPage() {
  const items = cards()

  return (
    <>
      <section className="bg-primary-dark text-on-primary">
        <div className="mx-auto max-w-page px-4 py-16 sm:px-6 md:py-20">
          <p className="mb-4 flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.2em] text-blue">
            <BrandMark size={40} />
            {config.displayName}
          </p>
          <h1 className="font-heading text-hero font-extrabold">Book a Detail</h1>
          <p className="mt-5 max-w-2xl text-lg text-on-primary/85">
            The detailing packages come to you and can be booked straight from here. Coating, film, correction and tint
            are done at the shop and quoted per vehicle, so those take a quote request instead.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-page px-4 py-16 sm:px-6 md:py-24">
        <ul className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {items.map((c, i) => (
            <li key={c.key} className="flex">
              <Reveal delay={Math.min((i % 3) * 60, 360)} className="w-full">
                <div className="lift flex h-full flex-col rounded-site border border-line bg-surface p-6 shadow-site">
                  <h2 className="font-heading text-xl font-bold text-primary-dark">
                    <Link href={c.href} className="hover:text-accent">
                      {c.name}
                    </Link>
                  </h2>

                  {c.priceFrom !== null && (
                    <p className="mt-4 font-heading text-3xl font-extrabold tabular-nums text-primary-dark">
                      From ${formatPrice(c.priceFrom)}
                    </p>
                  )}
                  {c.priceNote && <p className="mt-1 text-sm text-muted">{c.priceNote}</p>}

                  <p className="mt-4 flex-1 text-base leading-relaxed text-ink">{c.blurb}</p>

                  <div className="mt-6">
                    {c.bookingUrl ? (
                      <a
                        href={c.bookingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn inline-block rounded-site bg-accent px-5 py-3 text-sm font-semibold text-on-accent hover:bg-accent-dark"
                      >
                        {c.isTier ? 'Book this package' : 'Book this service'}
                      </a>
                    ) : (
                      <Link
                        href="/contact"
                        className="btn inline-block rounded-site border-2 border-primary-dark px-5 py-3 text-sm font-semibold text-primary-dark hover:bg-primary-dark hover:text-on-primary"
                      >
                        Get a quote
                      </Link>
                    )}
                  </div>
                </div>
              </Reveal>
            </li>
          ))}
        </ul>

        <div className="mt-14 border-t border-line pt-10">
          <h2 className="font-heading text-2xl font-bold text-primary-dark">Not sure which package?</h2>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted">
            Tell us the year, make and model and what is bothering you about the vehicle, and we will point you at the
            right one. Or call and we will work it out on the phone.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
            <Link
              href="/contact"
              className="btn rounded-site bg-accent px-6 py-3.5 text-base font-semibold text-on-accent hover:bg-accent-dark"
            >
              Get a Quote
            </Link>
            <span className="text-base text-ink">
              or call <Phone className="font-semibold text-primary-dark" />
            </span>
          </div>
        </div>
      </section>

      <CtaBand />
    </>
  )
}
