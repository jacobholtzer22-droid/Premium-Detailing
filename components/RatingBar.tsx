import Link from 'next/link'
import { config, formatPrice } from '@/lib/config'
import Stars from './Stars'

/**
 * The rating bar directly under the hero.
 *
 * It prints the two counts it can actually stand behind, each read on a date
 * recorded in config, rather than the rounded "1,000+" the owner uses. The
 * combined figure elsewhere on the site is the floor of these two, derived in
 * lib/config-schema.ts, so the bar and the rest of the page can never disagree
 * about the same number.
 *
 * Renders nothing when there is no rating and no count.
 */
export default function RatingBar() {
  const { reviewRating, reviewCountExact, facebookReviewCount, reviewLink } = config

  const counts: string[] = []
  if (reviewCountExact !== null) counts.push(`${formatPrice(reviewCountExact)} on Google`)
  if (facebookReviewCount !== null) counts.push(`${formatPrice(facebookReviewCount)} on Facebook`)
  const countLine = counts.length > 0 ? `${counts.join(', ')}, all five stars` : null

  if (reviewRating === null && countLine === null) return null

  return (
    <section aria-label="Reviews summary" className="border-b border-line bg-surface">
      <div className="mx-auto grid max-w-page grid-cols-2 items-center gap-x-4 gap-y-3 px-4 py-4 sm:px-6 md:grid-cols-3">
        {reviewRating !== null && (
          <p className="order-1 flex items-center gap-2.5">
            <Stars size={18} />
            <span className="font-heading text-base font-bold text-primary-dark">
              {reviewRating.toFixed(1)} on Google
            </span>
          </p>
        )}

        {countLine && (
          <p className="order-3 col-span-2 text-sm text-muted md:order-2 md:col-span-1 md:text-center">{countLine}</p>
        )}

        <p className="order-2 flex flex-wrap items-center justify-end gap-x-5 gap-y-2 text-sm font-semibold md:order-3">
          <Link href="/reviews" className="text-accent underline-offset-4 hover:underline">
            Read reviews
          </Link>
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
  )
}
