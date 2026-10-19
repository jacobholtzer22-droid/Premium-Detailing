import Link from 'next/link'
import { config } from '@/lib/config'

/**
 * The service-area chips.
 *
 * Port St. Lucie leads and points at the homepage rather than an area page:
 * it is the primary city, so its page IS the homepage, and a /areas/
 * port-st-lucie duplicating it would be two pages competing for one term.
 * Every other chip is a real page, in the order the owner lists them.
 */
export default function AreaList({
  heading = 'Serving the Treasure Coast',
  exclude,
}: {
  heading?: string
  exclude?: string
}) {
  const areas = config.serviceAreas.filter((a) => a.slug !== exclude)
  if (areas.length === 0) return null
  const chip =
    'inline-block rounded-full border border-line bg-surface px-4 py-2 text-sm font-medium text-ink hover:border-primary hover:text-primary'
  return (
    <section id="areas" className="mx-auto max-w-page px-4 py-16 md:py-24 sm:px-6">
      <h2 className="font-heading text-3xl font-bold text-primary-dark">{heading}</h2>
      <ul className="mt-6 flex flex-wrap gap-3">
        {exclude === undefined && (
          <li>
            <Link href="/" className={chip}>
              {config.primaryCity}, {config.primaryState}
            </Link>
          </li>
        )}
        {areas.map((a) => (
          <li key={a.slug}>
            <Link href={`/areas/${a.slug}`} className={chip}>
              {a.name}, {config.primaryState}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
