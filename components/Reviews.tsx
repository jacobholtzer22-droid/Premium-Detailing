import { config } from '@/lib/config'

/**
 * Visible reviews. Renders only when config.reviews is non-empty, which is the
 * same condition under which lib/schema.ts emits Review and aggregateRating,
 * so schema never claims a review the visitor cannot see.
 */
export default function Reviews() {
  if (config.reviews.length === 0) return null
  return (
    <section className="mx-auto max-w-page px-4 py-16 md:py-24 sm:px-6">
      <h2 className="font-heading text-3xl font-bold text-primary-dark">What Customers Say</h2>
      <div className="mt-8 grid gap-6 md:grid-cols-2">
        {config.reviews.map((r) => (
          <blockquote key={`${r.author}-${r.url}`} className="rounded-site border border-line bg-surface p-6">
            <p className="text-sm font-semibold text-accent-dark" aria-label={`${r.rating} out of 5 stars`}>
              {'★'.repeat(Math.round(r.rating))}
            </p>
            <p className="mt-3 text-base leading-relaxed text-ink">{r.text}</p>
            <footer className="mt-4 text-sm text-muted">
              {r.author},{' '}
              <a href={r.url} rel="noopener nofollow" target="_blank" className="underline-offset-2 hover:underline">
                via {r.source}
              </a>
            </footer>
          </blockquote>
        ))}
      </div>
    </section>
  )
}
