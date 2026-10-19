import type { Metadata } from 'next'
import Link from 'next/link'
import CtaBand from '@/components/CtaBand'
import Phone from '@/components/Phone'
import Reveal from '@/components/Reveal'
import { config, formatPrice } from '@/lib/config'
import { buildMetadata } from '@/lib/seo'

const DESCRIPTION =
  'Pick a detailing package and book a time, or request a quote for ceramic coating, paint protection film and window tint on the Treasure Coast.'

export const metadata: Metadata = buildMetadata({
  kind: 'other',
  path: '/book',
  title: `Book a Detail in ${config.primaryCity}`,
  description: DESCRIPTION,
}).metadata

/**
 * The booking page.
 *
 * This is the ONE place on the site that renders a dollar sign, and the figure
 * comes from config.services[].priceFrom. No price is ever typed into content.
 *
 * A service with a bookingUrl gets a real booking button. A service marked
 * comingSoon gets a muted pill and a quote CTA instead, because sending
 * somebody to a calendar for something that cannot be booked yet is worse
 * than telling them it is coming.
 */
export default function BookPage() {
  return (
    <>
      <section className="bg-primary-dark text-on-primary">
        <div className="mx-auto max-w-page px-4 py-16 sm:px-6 md:py-20">
          <h1 className="font-heading text-hero font-extrabold">Book a Detail</h1>
          <p className="mt-5 max-w-2xl text-lg text-on-primary/85">
            Pick the package that fits your vehicle and grab a time. The detailing packages come to you, and every
            starting price below is confirmed once we see the size and condition of the vehicle.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-page px-4 py-16 sm:px-6 md:py-24">
        <ul className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {config.services.map((s, i) => (
            <li key={s.slug}>
              <Reveal delay={Math.min((i % 3) * 60, 360)}>
                <div className="lift flex h-full flex-col rounded-site border border-line bg-surface p-6 shadow-site">
                  <div className="flex items-start justify-between gap-3">
                    <h2 className="font-heading text-xl font-bold text-primary-dark">
                      <Link href={`/services/${s.slug}`} className="hover:text-accent">
                        {s.name}
                      </Link>
                    </h2>
                    {s.comingSoon && (
                      <span className="flex-shrink-0 rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-muted">
                        Coming soon
                      </span>
                    )}
                  </div>

                  {s.priceFrom !== null && (
                    <p className="mt-4 font-heading text-3xl font-extrabold tabular-nums text-primary-dark">
                      From ${formatPrice(s.priceFrom)}
                    </p>
                  )}
                  {s.priceNote && <p className="mt-1 text-sm text-muted">{s.priceNote}</p>}

                  <p className="mt-4 flex-1 text-base leading-relaxed text-ink">{s.shortDescription}</p>

                  <div className="mt-6">
                    {s.bookingUrl && !s.comingSoon ? (
                      <a
                        href={s.bookingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn inline-block rounded-site bg-accent px-5 py-3 text-sm font-semibold text-on-accent hover:bg-accent-dark"
                      >
                        Book this package
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
