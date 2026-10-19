import { config } from '@/lib/config'
import Reveal from './Reveal'

/**
 * Visible customer quotes with NO structured data attached.
 *
 * These are the business's own Google reviews. Google treats a business that
 * marks up its own Google reviews as self-serving, so config.reviews (which is
 * what lib/schema.ts reads) stays empty and these render as plain text. No
 * star icons generated from data, no platform logos, no aggregate rating.
 */
export default function Testimonials({ heading = 'What Treasure Coast Drivers Say' }: { heading?: string }) {
  if (config.testimonials.length === 0) return null
  return (
    <section className="border-t border-line bg-bg">
      <div className="mx-auto max-w-page px-4 py-16 sm:px-6 md:py-24">
        <Reveal>
          <h2 className="font-heading text-3xl font-bold text-primary-dark md:text-4xl">{heading}</h2>
        </Reveal>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {config.testimonials.map((t, i) => (
            <Reveal key={t.name + i} delay={Math.min((i % 3) * 60, 360)}>
              <figure className="lift h-full rounded-site border border-line bg-surface p-6 shadow-site">
                <blockquote className="text-base leading-relaxed text-ink">{t.quote}</blockquote>
                <figcaption className="mt-5 border-t border-line pt-4 text-sm font-semibold text-primary-dark">
                  {t.name}
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
        {config.profiles.gbp && (
          <p className="mt-10">
            <a
              href={config.profiles.gbp}
              rel="noopener noreferrer"
              target="_blank"
              className="btn inline-block rounded-site border-2 border-primary-dark px-6 py-3 text-sm font-semibold text-primary-dark hover:bg-primary-dark hover:text-on-primary"
            >
              Read all reviews on Google
            </a>
          </p>
        )}
      </div>
    </section>
  )
}
