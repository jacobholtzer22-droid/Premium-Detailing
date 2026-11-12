import Link from 'next/link'
import { bookingEnabled, config, formatDuration, priceLabel } from '@/lib/config'
import type { Service } from '@/lib/config'
import Reveal from './Reveal'

/**
 * The price ladder for a service that is sold at several levels.
 *
 * Every figure comes from service.tiers[], and the price line goes through
 * priceLabel so a per-unit rate ("$1.50 per sq ft") reads as money in the same
 * place a flat price does.
 *
 * A tier with `booking` set links into the booking flow on /book with the
 * package preselected. A tier without one goes to the quote form, which is the
 * right answer for a coating or a film: those are priced against what the
 * paint actually needs, so a calendar would be booking work nobody has costed.
 *
 * Each column is a section with the tier's own anchor, so /book and the area
 * pages can deep link straight to the package they are talking about.
 */
export default function TierTable({ service, heading }: { service: Service; heading?: string }) {
  if (service.tiers.length === 0) return null

  const canBook = bookingEnabled()
  const title = heading ?? `${service.name} packages`

  return (
    <section id="packages" className="border-t border-line bg-bg">
      <div className="mx-auto max-w-page px-4 py-16 sm:px-6 md:py-24">
        <Reveal>
          <h2 className="font-heading text-3xl font-bold text-primary-dark md:text-4xl">{title}</h2>
        </Reveal>
        <ul className="mt-10 grid gap-5 md:grid-cols-3">
          {service.tiers.map((t, i) => (
            <li key={t.slug} id={t.anchor} className="flex scroll-mt-32">
              <Reveal delay={Math.min(i * 60, 360)} className="w-full">
                <div className="lift flex h-full flex-col rounded-site border border-line bg-surface p-6 shadow-site">
                  <h3 className="font-heading text-xl font-bold text-primary-dark">{t.name}</h3>
                  {t.priceFrom !== null && (
                    <p className="mt-4 font-heading text-3xl font-extrabold tabular-nums text-primary-dark">
                      From {priceLabel(t.priceFrom, t.priceUnit)}
                    </p>
                  )}
                  {t.booking && (
                    <p className="mt-1 text-sm font-medium text-blue-text">
                      Takes {formatDuration(t.booking.durationMinutes)}
                    </p>
                  )}
                  {t.priceNote && <p className="mt-1 text-sm text-muted">{t.priceNote}</p>}
                  <ul className="mt-5 flex-1 space-y-2.5 border-t border-line pt-5 text-base text-ink">
                    {t.includes.map((line) => (
                      <li key={line} className="flex items-start gap-2.5">
                        <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-text" />
                        {line}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-6">
                    {t.booking && canBook ? (
                      <Link
                        href={`/book?package=${service.slug}-${t.slug}#book-now`}
                        className="btn inline-flex min-h-[44px] items-center rounded-site bg-accent px-5 py-3 text-sm font-semibold text-on-accent hover:bg-accent-dark"
                      >
                        Book this package
                      </Link>
                    ) : (
                      <Link
                        href={`/contact?service=${service.slug}`}
                        className="btn inline-flex min-h-[44px] items-center rounded-site border-2 border-primary-dark px-5 py-3 text-sm font-semibold text-primary-dark hover:bg-primary-dark hover:text-on-primary"
                      >
                        {t.booking ? 'Get a quote' : 'Request a quote'}
                      </Link>
                    )}
                  </div>
                </div>
              </Reveal>
            </li>
          ))}
        </ul>
        <Reveal>
          <p className="mt-10 border-t border-line pt-6 text-base text-muted">
            {service.addOns.length > 0 ? (
              <>
                <Link href="#add-ons" className="font-semibold text-accent underline-offset-4 hover:underline">
                  Add-ons
                </Link>{' '}
                are priced individually and can go on any of these.{' '}
              </>
            ) : null}
            {service.where === 'mobile'
              ? `Every package comes to you anywhere ${config.displayName} covers.`
              : service.where === 'shop'
                ? `This work is done at the shop in ${config.primaryCity}.`
                : service.where === 'property'
                  ? 'This work is done at your property.'
                  : ''}
          </p>
        </Reveal>
      </div>
    </section>
  )
}
