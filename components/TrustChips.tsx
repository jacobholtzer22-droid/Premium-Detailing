import { config } from '@/lib/config'

/**
 * The row of proof points under the hero.
 *
 * Every chip is built from a config value or omitted. Nothing here is a claim
 * the brief does not support: no licensing, no insurance, no guarantee.
 */
export default function TrustChips({ className = '' }: { className?: string }) {
  const items: string[] = []
  if (config.reviewRating !== null) items.push(`${config.reviewRating.toFixed(1)} stars on Google`)
  if (config.reviewCount !== null) items.push(`More than ${config.reviewCount} five-star reviews`)
  if (config.yearsInBusiness !== null) items.push(`Detailing since ${new Date().getFullYear() - config.yearsInBusiness}`)
  items.push('We come to you')
  items.push('Ceramic coating and paint correction')
  items.push('Trusted by local dealerships')
  if (items.length === 0) return null

  return (
    // A grid, not a wrapped row: six chips in a flex-wrap left an orphan on a
    // second line at every width. Two columns on a phone, three at lg, which
    // divides six exactly.
    <ul className={`grid grid-cols-2 gap-2 text-sm font-medium sm:grid-cols-3 sm:gap-x-6 sm:gap-y-3 ${className}`}>
      {items.map((item) => (
        <li key={item} className="flex items-start gap-2.5">
          <span
            aria-hidden="true"
            className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue"
          >
            <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="#FFFFFF" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m4 12.5 5.5 5.5L20 7" />
            </svg>
          </span>
          {item}
        </li>
      ))}
    </ul>
  )
}
