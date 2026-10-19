'use client'

import { useEffect, useRef, useState } from 'react'
import Stars from './Stars'

/**
 * One customer quote.
 *
 * The quote is clamped to six lines so a wall of them stays scannable, and the
 * clamp is gated on the `.js` class that app/layout.tsx sets before first
 * paint: without JavaScript there is no toggle to open it again, so there is
 * no clamp either and the full quote renders. The toggle only appears when the
 * text is actually taller than the clamp, measured after mount rather than
 * guessed from a character count.
 *
 * No avatar and no platform logo: the quotes are real but the faces would not
 * be, and a Google wordmark on a card the business controls reads as an
 * endorsement by Google.
 */
export default function ReviewCard({ quote, name, source }: { quote: string; name: string; source: string }) {
  const [open, setOpen] = useState(false)
  const [overflows, setOverflows] = useState(false)
  const ref = useRef<HTMLQuoteElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    setOverflows(el.scrollHeight > el.clientHeight + 2)
  }, [])

  return (
    <figure className="flex h-full flex-col rounded-site border border-line bg-surface p-6 shadow-site">
      <Stars size={16} />
      <blockquote
        ref={ref}
        className={`mt-4 flex-1 text-base leading-relaxed text-ink ${open ? '' : 'review-clamp'}`}
      >
        {quote}
      </blockquote>
      {overflows && (
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="mt-2 self-start text-sm font-semibold text-accent underline-offset-4 hover:underline"
        >
          {open ? 'Read less' : 'Read more'}
        </button>
      )}
      <figcaption className="mt-5 border-t border-line pt-4">
        <span className="block text-sm font-semibold text-primary-dark">{name}</span>
        <span className="mt-0.5 block text-xs text-muted">{source} review</span>
      </figcaption>
    </figure>
  )
}
