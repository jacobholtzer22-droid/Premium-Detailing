import { priceLabel } from '@/lib/config'
import type { AddOn } from '@/lib/config'
import Reveal from './Reveal'

/**
 * The add-on price list for one service.
 *
 * This replaced a single sentence that named three add-ons and no prices
 * ("clay bar treatment, engine detail and seat shampoo"), which meant the only
 * way to find out what any of them cost was to ask. Somebody comparing a $350
 * Gold plus a $125 seat shampoo against a competitor's package cannot do that
 * arithmetic unless both numbers are on the page.
 *
 * Two columns at every width rather than a real table: a two-column `<table>`
 * of eleven rows is wider than a phone and scrolls sideways, and a definition
 * list carries the same meaning. Prices are `tabular-nums` so the column reads
 * as a column.
 */
export default function AddOnTable({
  addOns,
  heading = 'Add-ons',
  intro,
  compact = false,
}: {
  addOns: readonly AddOn[]
  heading?: string
  intro?: string
  compact?: boolean
}) {
  if (addOns.length === 0) return null

  if (compact) {
    return (
      <div>
        <h3 className="font-heading text-lg font-bold text-primary-dark">{heading}</h3>
        {intro && <p className="mt-2 text-sm text-muted">{intro}</p>}
        <ul className="mt-4 grid gap-x-8 gap-y-2 sm:grid-cols-2">
          {addOns.map((a) => (
            <li key={a.name} className="flex items-baseline justify-between gap-4 border-b border-line py-1.5">
              <span className="text-base text-ink">{a.name}</span>
              <span className="font-heading text-base font-bold tabular-nums text-primary-dark">
                {priceLabel(a.price)}
              </span>
            </li>
          ))}
        </ul>
      </div>
    )
  }

  return (
    <section id="add-ons" className="border-t border-line bg-surface">
      <div className="mx-auto max-w-page px-4 py-16 sm:px-6 md:py-24">
        <Reveal>
          <h2 className="font-heading text-3xl font-bold text-primary-dark md:text-4xl">{heading}</h2>
          {intro && <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted">{intro}</p>}
        </Reveal>
        <dl className="mt-10 grid gap-x-12 sm:grid-cols-2">
          {addOns.map((a, i) => (
            <Reveal key={a.name} delay={Math.min((i % 2) * 60, 360)}>
              <div className="flex items-baseline justify-between gap-6 border-b border-line py-4">
                <div>
                  <dt className="font-heading text-base font-bold text-primary-dark">{a.name}</dt>
                  {a.note && <p className="mt-1 text-sm text-muted">{a.note}</p>}
                </div>
                <dd className="font-heading text-xl font-extrabold tabular-nums text-primary-dark">
                  {priceLabel(a.price)}
                </dd>
              </div>
            </Reveal>
          ))}
        </dl>
      </div>
    </section>
  )
}
