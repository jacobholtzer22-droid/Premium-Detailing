import { config } from '@/lib/config'
import Reveal from './Reveal'

/**
 * The full list of towns covered, grouped by county. Plain text on purpose:
 * the five service-area pages are the links, and turning every town into a
 * link would build a doorway-page grid out of towns that have no page.
 *
 * Renders nothing when config.coverage is empty.
 */
export default function CoverageList() {
  if (config.coverage.length === 0) return null
  return (
    <section className="border-t border-line bg-bg">
      <div className="mx-auto max-w-page px-4 py-16 sm:px-6 md:py-24">
        <Reveal>
          <h2 className="font-heading text-3xl font-bold text-primary-dark md:text-4xl">Where We Come To You</h2>
        </Reveal>
        <div className="mt-10 grid gap-8 md:grid-cols-3">
          {config.coverage.map((c, i) => (
            <Reveal key={c.county} delay={Math.min(i * 60, 360)}>
              <h3 className="font-heading text-lg font-bold text-primary-dark">{c.county}</h3>
              <p className="mt-3 text-base leading-relaxed text-muted">{c.towns.join(', ')}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
