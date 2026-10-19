import Link from 'next/link'
import { config, formatPrice } from '@/lib/config'
import Img from './Img'
import Reveal from './Reveal'

interface Props {
  heading?: string
  /** Hide one service (used on service pages to show "other services"). */
  exclude?: string
}

/**
 * Services as image-led cards.
 *
 * This replaced a borderless text table with a right-aligned price column.
 * On a site whose entire proposition is how the work looks, a services
 * section with no photography in it was the single most templated thing on
 * the page. Each card carries a real photo of that service, which is also
 * why the cards are not the banned "row of icon cards with one-line labels":
 * there are no icons and every card has a real description.
 */
export default function ServiceGrid({ heading = 'Our Services', exclude }: Props) {
  const services = config.services.filter((s) => s.slug !== exclude)
  if (services.length === 0) return null
  return (
    <section className="border-t border-line bg-bg">
      <div className="mx-auto max-w-page px-4 py-16 sm:px-6 md:py-24">
        <Reveal>
          <h2 className="font-heading text-3xl font-bold text-primary-dark md:text-4xl">{heading}</h2>
        </Reveal>
        <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s, i) => (
            <li key={s.slug} className="flex">
              <Reveal delay={Math.min((i % 3) * 60, 360)} className="w-full">
                <Link
                  href={`/services/${s.slug}`}
                  className="lift group flex h-full flex-col overflow-hidden rounded-site border border-line bg-surface shadow-site"
                >
                  {s.image && (
                    <div className="aspect-[16/10] overflow-hidden">
                      <Img
                        name={s.image}
                        sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                        className="h-full w-full object-cover"
                      />
                    </div>
                  )}
                  <div className="flex flex-1 flex-col p-6">
                    <h3 className="font-heading text-xl font-bold text-primary-dark group-hover:text-accent">
                      {s.name}
                    </h3>
                    <p className="mt-3 flex-1 text-base leading-relaxed text-muted">{s.shortDescription}</p>
                    <div className="mt-5 flex items-baseline justify-between gap-3 border-t border-line pt-4">
                      <span className="text-sm font-semibold tabular-nums text-ink">
                        {s.priceFrom !== null ? `From $${formatPrice(s.priceFrom)}` : 'Quoted after an evaluation'}
                      </span>
                      <span className="text-sm font-semibold text-accent">Learn more</span>
                    </div>
                  </div>
                </Link>
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
