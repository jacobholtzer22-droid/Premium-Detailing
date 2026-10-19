import Link from 'next/link'
import { config } from '@/lib/config'

/**
 * The first thing on /services: the question a visitor is already asking, then
 * five large targets.
 *
 * The cards below still carry the photography and the descriptions. These are
 * for the visitor who arrived knowing the words "window tinting" and wants to
 * be one tap away from that page rather than reading five cards first.
 *
 * Order is the owner's, by slug, so adding a service to config does not
 * silently reshuffle the row.
 */
const ORDER = ['mobile-detailing', 'ceramic-coating', 'paint-protection-film', 'paint-correction', 'window-tint']

export default function ServicePills() {
  const services = ORDER.flatMap((slug) => {
    const s = config.services.find((x) => x.slug === slug)
    return s ? [s] : []
  })
  if (services.length === 0) return null

  return (
    <section className="mx-auto max-w-page px-4 pt-10 sm:px-6">
      <h2 className="font-heading text-3xl font-bold text-primary-dark md:text-4xl">
        Which service are you looking for?
      </h2>
      <ul className="mt-8 grid grid-cols-2 gap-3 md:flex md:flex-wrap lg:justify-center">
        {services.map((s) => (
          <li key={s.slug} className="flex">
            <Link
              href={`/services/${s.slug}`}
              className="btn flex w-full items-center justify-center rounded-full border border-line bg-surface px-7 py-4 text-center font-body text-[1.125rem] font-semibold text-primary-dark hover:border-accent hover:text-accent"
            >
              {s.displayLabel ?? s.name}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
