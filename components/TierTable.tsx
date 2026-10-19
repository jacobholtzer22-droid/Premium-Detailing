import { config, formatPrice } from '@/lib/config'
import type { Service } from '@/lib/config'
import Reveal from './Reveal'

/**
 * The package comparison for a service that is sold as a price ladder.
 *
 * Every figure comes from service.tiers[].priceFrom; nothing here is typed.
 * Each tier keeps its own booking calendar, and a tier without one falls back
 * to the quote page rather than linking to somebody else's calendar.
 *
 * Each column is a section with the tier's own anchor, so /book and the area
 * pages can deep link straight to the package they are talking about.
 */
export default function TierTable({ service }: { service: Service }) {
  if (service.tiers.length === 0) return null

  return (
    <section id="packages" className="border-t border-line bg-bg">
      <div className="mx-auto max-w-page px-4 py-16 sm:px-6 md:py-24">
        <Reveal>
          <h2 className="font-heading text-3xl font-bold text-primary-dark md:text-4xl">
            The three packages
          </h2>
        </Reveal>
        <ul className="mt-10 grid gap-5 md:grid-cols-3">
          {service.tiers.map((t, i) => (
            <li key={t.slug} id={t.anchor} className="flex scroll-mt-32">
              <Reveal delay={Math.min(i * 60, 360)} className="w-full">
                <div className="lift flex h-full flex-col rounded-site border border-line bg-surface p-6 shadow-site">
                  <h3 className="font-heading text-xl font-bold text-primary-dark">{t.name}</h3>
                  {t.priceFrom !== null && (
                    <p className="mt-4 font-heading text-3xl font-extrabold tabular-nums text-primary-dark">
                      From ${formatPrice(t.priceFrom)}
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
                    {t.bookingUrl ? (
                      <a
                        href={t.bookingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn inline-block rounded-site bg-accent px-5 py-3 text-sm font-semibold text-on-accent hover:bg-accent-dark"
                      >
                        Book this package
                      </a>
                    ) : (
                      <a
                        href="/contact"
                        className="btn inline-block rounded-site border-2 border-primary-dark px-5 py-3 text-sm font-semibold text-primary-dark hover:bg-primary-dark hover:text-on-primary"
                      >
                        Get a quote
                      </a>
                    )}
                  </div>
                </div>
              </Reveal>
            </li>
          ))}
        </ul>
        <Reveal>
          <p className="mt-10 border-t border-line pt-6 text-base text-muted">
            Add-ons available on any package: clay bar treatment, engine detail and seat shampoo. Ask for what you want
            when you book and it is quoted with the rest of the job. Every package comes to you anywhere{' '}
            {config.displayName} covers.
          </p>
        </Reveal>
      </div>
    </section>
  )
}
