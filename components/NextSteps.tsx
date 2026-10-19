import Link from 'next/link'
import BrandMark from './BrandMark'
import { config } from '@/lib/config'

/**
 * Sits under the contact details so the right rail does not die halfway down
 * the page beside a tall form. Every line is a fact from the brief: what the
 * visitor should expect, and the one alternative route (booking) for somebody
 * who already knows what they want.
 */
const STEPS = [
  'Send the year, make and model and what you want done.',
  'We come back with a quote for your vehicle, not a generic price.',
  'Pick a time and we come to you.',
]

export default function NextSteps() {
  return (
    <div className="mt-6 rounded-site border border-line bg-surface p-6 shadow-site">
      <h2 className="flex items-center gap-3 font-heading text-lg font-bold text-primary-dark">
        <BrandMark size={40} />
        What happens next
      </h2>
      <ol className="mt-4 space-y-3">
        {STEPS.map((s, i) => (
          <li key={s} className="flex gap-3 text-sm leading-relaxed text-muted">
            <span className="font-heading text-sm font-bold tabular-nums text-blue-text">{String(i + 1).padStart(2, '0')}</span>
            {s}
          </li>
        ))}
      </ol>
      <div className="mt-6 border-t border-line pt-5">
        <p className="text-sm text-muted">Already know which package you want?</p>
        <Link
          href="/book"
          className="btn mt-3 inline-block rounded-site bg-accent px-5 py-3 text-sm font-semibold text-on-accent hover:bg-accent-dark"
        >
          Book a Detail
        </Link>
      </div>
      {config.combinedReviewLabel !== null && (
        <p className="mt-6 border-t border-line pt-5 text-sm text-muted">
          {config.combinedReviewLabel} five-star reviews across Google and Facebook.
          {config.profiles.gbp && (
            <>
              {' '}
              <a
                href={config.profiles.gbp}
                rel="noopener noreferrer"
                target="_blank"
                className="font-semibold text-primary underline-offset-4 hover:underline"
              >
                Read them
              </a>
              .
            </>
          )}
        </p>
      )}
    </div>
  )
}
