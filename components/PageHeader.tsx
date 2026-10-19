import Link from 'next/link'
import type { Crumb } from '@/lib/schema'

/**
 * Interior page band. Owns the page's single <h1>, which is always derived from
 * config by the page template. Content files start at <h2>.
 */
export default function PageHeader({ title, intro, crumbs }: { title: string; intro?: string; crumbs?: readonly Crumb[] }) {
  return (
    <section className="bg-primary-soft">
      <div className="mx-auto max-w-page px-4 py-12 sm:px-6 md:py-16">
        {crumbs && crumbs.length > 1 && (
          <nav aria-label="Breadcrumb" className="mb-4 text-sm text-muted">
            <ol className="flex flex-wrap gap-2">
              {crumbs.map((c, i) => (
                <li key={c.path} className="flex gap-2">
                  {i < crumbs.length - 1 ? (
                    <Link href={c.path} className="hover:text-primary">
                      {c.name}
                    </Link>
                  ) : (
                    <span aria-current="page">{c.name}</span>
                  )}
                  {i < crumbs.length - 1 && <span aria-hidden="true">/</span>}
                </li>
              ))}
            </ol>
          </nav>
        )}
        <h1 className="font-heading text-4xl font-bold leading-tight text-primary-dark md:text-5xl">{title}</h1>
        {intro && <p className="mt-4 max-w-2xl text-lg text-muted">{intro}</p>}
      </div>
    </section>
  )
}
