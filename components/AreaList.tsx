import Link from 'next/link'
import { config } from '@/lib/config'

export default function AreaList({ heading = 'Areas We Serve', exclude }: { heading?: string; exclude?: string }) {
  const areas = config.serviceAreas.filter((a) => a.slug !== exclude)
  if (areas.length === 0) return null
  return (
    <section id="areas" className="mx-auto max-w-page px-4 py-16 md:py-24 sm:px-6">
      <h2 className="font-heading text-3xl font-bold text-primary-dark">{heading}</h2>
      <ul className="mt-6 flex flex-wrap gap-3">
        {areas.map((a) => (
          <li key={a.slug}>
            <Link
              href={`/areas/${a.slug}`}
              className="inline-block rounded-full border border-line bg-surface px-4 py-2 text-sm font-medium text-ink hover:border-primary hover:text-primary"
            >
              {a.name}, {config.primaryState}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
