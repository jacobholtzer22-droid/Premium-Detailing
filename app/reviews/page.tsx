import type { Metadata } from 'next'
import CtaBand from '@/components/CtaBand'
import JsonLd from '@/components/JsonLd'
import PageHeader from '@/components/PageHeader'
import ReviewCard from '@/components/ReviewCard'
import Stars from '@/components/Stars'
import { config, formatPrice } from '@/lib/config'
import { breadcrumbList } from '@/lib/schema'
import { buildMetadata } from '@/lib/seo'

// Built from the same counts the page prints, so the meta description cannot
// drift from the figures in config the way a typed one would.
const DESCRIPTION = `Read what Treasure Coast drivers say about ${config.displayName}, with ${formatPrice(
  config.reviewCountExact ?? 0,
)} five-star reviews on Google and ${formatPrice(config.facebookReviewCount ?? 0)} more on Facebook, quoted here in full.`

const CRUMBS = [
  { name: 'Home', path: '/' },
  { name: 'Reviews', path: '/reviews' },
]

export const metadata: Metadata = buildMetadata({
  kind: 'other',
  path: '/reviews',
  title: 'Reviews from Treasure Coast Drivers',
  description: DESCRIPTION,
}).metadata

/**
 * Every quote the client has sent, in full.
 *
 * There is still NO Review or AggregateRating JSON-LD on this page, and there
 * must not be. These are the business's own Google reviews; a business that
 * marks up its own Google reviews is self-serving by Google's own definition,
 * and the penalty for that lands on the whole site rather than this page.
 * config.reviews stays empty, which is the condition lib/schema.ts keys on,
 * and verify check 10 holds the line.
 *
 * The counts are the exact ones, each read on a date recorded in config. The
 * rounded combined figure that appears elsewhere is derived from them, so the
 * page a visitor lands on to check the claim shows the arithmetic.
 */
export default function ReviewsPage() {
  const { reviewRating, reviewCountExact, facebookReviewCount, reviewLink, profiles } = config
  const facebookReviews = profiles.facebook ? `${profiles.facebook}/reviews` : null

  // The owner's claim, then the part of it this site can show receipts for.
  // Assembled here rather than inline so the sentence is one string that can
  // be read, and so a missing count drops its clause instead of leaving a
  // dangling "and" or a stray full stop.
  const verified = [
    reviewCountExact !== null ? `${formatPrice(reviewCountExact)} on Google` : null,
    facebookReviewCount !== null ? `${formatPrice(facebookReviewCount)} on Facebook` : null,
  ].filter((x): x is string => x !== null)
  const subline = [
    config.reviewClaimLine ? `${config.reviewClaimLine}.` : null,
    verified.length > 0 ? `${verified.join(' and ')} ${verified.length > 1 ? 'are' : 'is'} verified below.` : null,
  ]
    .filter((x): x is string => x !== null)
    .join(' ')

  return (
    <>
      <JsonLd data={breadcrumbList(CRUMBS)} />
      <PageHeader title={`Google Reviews for ${config.displayName}`} crumbs={CRUMBS} />

      <section className="mx-auto max-w-page px-4 pt-10 sm:px-6">
        <div className="rounded-site border border-line bg-surface p-6 shadow-site md:p-8">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <Stars size={22} />
            {reviewRating !== null && (
              <p className="font-heading text-2xl font-bold text-primary-dark">{reviewRating.toFixed(1)} on Google</p>
            )}
          </div>
          {subline && <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted">{subline}</p>}
          <p className="mt-2 max-w-2xl text-sm text-muted">
            The quotes below are copied word for word, with first names and last initials as they were left.
          </p>
          <p className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm font-semibold">
            {profiles.gbp && (
              <a
                href={profiles.gbp}
                rel="noopener noreferrer"
                target="_blank"
                className="text-accent underline-offset-4 hover:underline"
              >
                Read them on Google
              </a>
            )}
            {facebookReviews && (
              <a
                href={facebookReviews}
                rel="noopener noreferrer"
                target="_blank"
                className="text-accent underline-offset-4 hover:underline"
              >
                Read them on Facebook
              </a>
            )}
            {reviewLink && (
              <a
                href={reviewLink}
                rel="noopener noreferrer"
                target="_blank"
                className="text-blue-text underline-offset-4 hover:underline"
              >
                Leave a review
              </a>
            )}
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-page px-4 py-12 sm:px-6 md:py-16">
        <ul className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {config.testimonials.map((t, i) => (
            <li key={`${t.name}-${i}`}>
              <ReviewCard quote={t.quote} name={t.name} source={t.source} />
            </li>
          ))}
        </ul>
      </section>

      <CtaBand />
    </>
  )
}
