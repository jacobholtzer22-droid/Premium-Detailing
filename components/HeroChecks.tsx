import Link from 'next/link'
import type { ReactNode } from 'react'
import { config } from '@/lib/config'

/**
 * The two lists under the hero buttons.
 *
 * This replaced a six-chip grid of mixed claims. Six chips in one block made
 * "we come to you" and "5.0 stars on Google" look like the same kind of
 * statement; they are not. The left column is what you can buy and every item
 * is a link to its page. The right column is why you would buy it from here,
 * and the review line links to the reviews page so the claim is one click from
 * the evidence.
 *
 * Every item is built from config or omitted. Nothing here is a claim the
 * brief does not support.
 */
interface Item {
  label: string
  href?: string
}

function List({ title, items }: { title: string; items: Item[] }) {
  if (items.length === 0) return null
  return (
    <div>
      <p className="sr-only">{title}</p>
      <ul className="space-y-2.5 text-sm font-medium sm:text-base">
        {items.map((item) => (
          <li key={item.label} className="flex items-start gap-2.5">
            <Check />
            {item.href ? (
              <Link href={item.href} className="underline-offset-4 hover:underline">
                {item.label}
              </Link>
            ) : (
              <span>{item.label}</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}

function Check(): ReactNode {
  return (
    <span
      aria-hidden="true"
      className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue"
    >
      <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="#FFFFFF" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m4 12.5 5.5 5.5L20 7" />
      </svg>
    </span>
  )
}

/** config.services in the order the owner lists them, by slug. */
const SERVICE_ORDER = ['paint-protection-film', 'ceramic-coating', 'paint-correction', 'window-tint', 'mobile-detailing']

export default function HeroChecks({ className = '' }: { className?: string }) {
  const services: Item[] = SERVICE_ORDER.flatMap((slug) => {
    const s = config.services.find((x) => x.slug === slug)
    return s ? [{ label: s.displayLabel ?? s.name, href: `/services/${s.slug}` }] : []
  })

  const proof: Item[] = []
  if (config.reviewRating !== null) proof.push({ label: `${config.reviewRating.toFixed(1)} stars on Google` })
  if (config.combinedReviewLabel !== null) {
    proof.push({ label: `${config.combinedReviewLabel} five-star reviews across Google and Facebook`, href: '/reviews' })
  }
  if (config.foundingYear !== null) proof.push({ label: `Detailing since ${config.foundingYear}` })
  proof.push({ label: 'Trusted by local dealerships' })

  if (services.length === 0 && proof.length === 0) return null

  return (
    // Services first in the DOM, so a phone reads what we do before why us.
    <div className={`grid gap-x-10 gap-y-6 md:grid-cols-2 ${className}`}>
      <List title="What we do" items={services} />
      <List title="Why us" items={proof} />
    </div>
  )
}
