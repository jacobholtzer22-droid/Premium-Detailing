'use client'

import Link from 'next/link'
import { useCallback, useEffect, useRef, useState } from 'react'
import { config } from '@/lib/config'
import ReviewCard from './ReviewCard'

/**
 * Visible customer quotes with NO structured data attached.
 *
 * These are the business's own Google reviews. Google treats a business that
 * marks up its own Google reviews as self-serving, so config.reviews (which is
 * what lib/schema.ts reads) stays empty and these render as plain text.
 *
 * A scroll-snap row rather than a three-card grid, because nineteen quotes do
 * not fit on a homepage and a grid of three makes the other sixteen invisible.
 * It never moves on its own: the arrows and the arrow keys are the only things
 * that scroll it, so nothing on the page animates while somebody is reading.
 */
const HOME_LIMIT = 9

export default function Testimonials({
  heading = 'What Treasure Coast Drivers Say',
  limit = HOME_LIMIT,
}: {
  heading?: string
  limit?: number
}) {
  const items = config.testimonials.slice(0, limit)
  const trackRef = useRef<HTMLUListElement>(null)
  const [atStart, setAtStart] = useState(true)
  const [atEnd, setAtEnd] = useState(false)

  const sync = useCallback(() => {
    const el = trackRef.current
    if (!el) return
    setAtStart(el.scrollLeft <= 2)
    setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 2)
  }, [])

  useEffect(() => {
    sync()
    const el = trackRef.current
    if (!el) return
    el.addEventListener('scroll', sync, { passive: true })
    window.addEventListener('resize', sync)
    return () => {
      el.removeEventListener('scroll', sync)
      window.removeEventListener('resize', sync)
    }
  }, [sync])

  const page = (dir: 1 | -1) => {
    const el = trackRef.current
    if (!el) return
    const card = el.querySelector('li')
    const step = card ? card.getBoundingClientRect().width + 20 : el.clientWidth
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    el.scrollBy({ left: dir * step, behavior: reduced ? 'auto' : 'smooth' })
  }

  if (items.length === 0) return null

  const arrow = (dir: 1 | -1, disabled: boolean) => (
    <button
      type="button"
      onClick={() => page(dir)}
      disabled={disabled}
      aria-label={dir === 1 ? 'Next reviews' : 'Previous reviews'}
      className="flex h-11 w-11 items-center justify-center rounded-full border border-line bg-surface text-primary-dark disabled:opacity-40 hover:border-accent hover:text-accent"
    >
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d={dir === 1 ? 'm9 5 7 7-7 7' : 'm15 5-7 7 7 7'} />
      </svg>
    </button>
  )

  return (
    <section className="border-t border-line bg-bg">
      <div className="mx-auto max-w-page px-4 py-16 sm:px-6 md:py-24">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="font-heading text-3xl font-bold text-primary-dark md:text-4xl">{heading}</h2>
            {config.combinedReviewLabel && (
              <p className="mt-2 text-base text-muted">
                {config.combinedReviewLabel} five-star reviews across Google and Facebook
              </p>
            )}
          </div>
          <div className="flex gap-2">
            {arrow(-1, atStart)}
            {arrow(1, atEnd)}
          </div>
        </div>

        <ul
          ref={trackRef}
          tabIndex={0}
          role="region"
          aria-label="Customer reviews"
          onKeyDown={(e) => {
            if (e.key === 'ArrowRight') {
              e.preventDefault()
              page(1)
            }
            if (e.key === 'ArrowLeft') {
              e.preventDefault()
              page(-1)
            }
          }}
          className="no-scrollbar mt-10 flex snap-x snap-mandatory gap-5 overflow-x-auto pb-2"
        >
          {items.map((t, i) => (
            // 85% under md leaves the next card visibly peeking, which is what
            // tells a thumb there is more to the right.
            <li key={`${t.name}-${i}`} className="w-[85%] flex-shrink-0 snap-start sm:w-[47%] lg:w-[32%]">
              <ReviewCard quote={t.quote} name={t.name} source={t.source} />
            </li>
          ))}
        </ul>

        <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3">
          <Link
            href="/reviews"
            className="btn inline-block rounded-site border-2 border-primary-dark px-6 py-3 text-sm font-semibold text-primary-dark hover:bg-primary-dark hover:text-on-primary"
          >
            Read all reviews
          </Link>
          {config.profiles.gbp && (
            <a
              href={config.profiles.gbp}
              rel="noopener noreferrer"
              target="_blank"
              className="text-sm font-semibold text-accent underline-offset-4 hover:underline"
            >
              Read on Google
            </a>
          )}
        </div>
      </div>
    </section>
  )
}
