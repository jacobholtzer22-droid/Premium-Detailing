'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import { config } from '@/lib/config'
import { getImage } from '@/lib/images'

/**
 * Drag-to-compare before/after slider.
 *
 * The control is a real <input type="range"> stretched invisibly over the
 * stage. That single decision is what makes pointer drag, touch drag and
 * keyboard arrows all work with no custom pointer maths and no gesture
 * library, and it is what gives the component its accessibility for free.
 *
 * Renders NOTHING when config.beforeAfter is empty, which is the state this
 * site ships in: no true before/after pair exists in the client's photos yet.
 * A pair is only ever the same vehicle from roughly the same angle, one dirty
 * and one finished. Never two different cars, and never a foam shot paired
 * with a finished shot.
 */

interface Props {
  /** Show only pairs tagged with this service slug, plus untagged pairs. */
  service?: string
}

export default function BeforeAfter({ service }: Props) {
  const pairs = config.beforeAfter.filter((p) => !p.service || !service || p.service === service)

  const [idx, setIdx] = useState(0)
  const [pos, setPos] = useState(50)
  const [fading, setFading] = useState(false)
  const sectionRef = useRef<HTMLElement | null>(null)
  const hinted = useRef(false)
  const touchX = useRef<number | null>(null)

  // One-time nudge the first time the section is seen, so the handle reads as
  // draggable without a tooltip. Skipped entirely under reduced motion.
  useEffect(() => {
    const el = sectionRef.current
    if (!el || hinted.current || pairs.length === 0) return
    if (typeof IntersectionObserver === 'undefined') return
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    if (reduce) return
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting || hinted.current) continue
          hinted.current = true
          io.disconnect()
          const t0 = performance.now()
          const step = (now: number) => {
            const p = Math.min((now - t0) / 900, 1)
            // 50 -> 38 -> 50
            setPos(50 - 12 * Math.sin(p * Math.PI))
            if (p < 1) requestAnimationFrame(step)
          }
          requestAnimationFrame(step)
        }
      },
      { threshold: 0.4 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [pairs.length])

  if (pairs.length === 0) return null

  const pair = pairs[Math.min(idx, pairs.length - 1)]
  if (!pair) return null
  const before = getImage(pair.before.src)
  const after = getImage(pair.after.src)

  const go = (next: number) => {
    const n = (next + pairs.length) % pairs.length
    if (n === idx) return
    setFading(true)
    window.setTimeout(() => {
      setIdx(n)
      setPos(50)
      setFading(false)
    }, 200)
  }

  const stageVars = { '--pos': `${pos}%` } as CSSProperties

  return (
    <section ref={sectionRef} className="bg-primary text-on-primary">
      <div className="mx-auto max-w-page px-4 py-16 sm:px-6 md:py-24">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent">See the difference</p>
        <h2 className="mt-3 font-heading text-3xl font-bold md:text-4xl">Drag to reveal the transformation.</h2>
        <p className="mt-3 max-w-2xl text-base text-on-primary/80">
          Same vehicle, same day. Pull the handle from dirty to detailed.
        </p>

        <div
          style={stageVars}
          className="relative mt-10 aspect-[4/5] w-full overflow-hidden rounded-site md:aspect-[16/10]"
        >
          <img
            src={after.src}
            srcSet={after.srcSet}
            sizes="(min-width:1024px) 960px, 100vw"
            width={after.width}
            height={after.height}
            alt={pair.after.alt}
            decoding="async"
            className={`ba-fade absolute inset-0 h-full w-full object-cover ${fading ? 'opacity-0' : 'opacity-100'}`}
          />
          <img
            src={before.src}
            srcSet={before.srcSet}
            sizes="(min-width:1024px) 960px, 100vw"
            width={before.width}
            height={before.height}
            alt={pair.before.alt}
            decoding="async"
            className={`ba-fade absolute inset-0 h-full w-full object-cover ${fading ? 'opacity-0' : 'opacity-100'}`}
            style={{ clipPath: 'inset(0 calc(100% - var(--pos)) 0 0)' }}
          />

          <span
            aria-hidden="true"
            className={`pointer-events-none absolute left-3 top-3 rounded-full bg-primary-dark/70 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] ${
              pos < 12 ? 'opacity-0' : 'opacity-100'
            } ba-fade`}
          >
            Before
          </span>
          <span
            aria-hidden="true"
            className={`pointer-events-none absolute right-3 top-3 rounded-full bg-primary-dark/70 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] ${
              pos > 88 ? 'opacity-0' : 'opacity-100'
            } ba-fade`}
          >
            After
          </span>

          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 w-[2px] bg-accent"
            style={{ left: 'var(--pos)' }}
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-accent bg-white shadow-site"
            style={{ left: 'var(--pos)' }}
          >
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#0C1220" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 6 4 12l5 6" />
              <path d="m15 6 5 6-5 6" />
            </svg>
          </span>

          <input
            type="range"
            min={0}
            max={100}
            step={0.5}
            value={pos}
            onChange={(e) => setPos(Number(e.target.value))}
            onKeyDown={(e) => {
              // step is 0.5 so dragging is smooth; that makes the native
              // arrow-key increment uselessly small, so arrows are handled
              // here instead: 2 per press, 10 with shift.
              const dir = e.key === 'ArrowLeft' || e.key === 'ArrowDown' ? -1 : e.key === 'ArrowRight' || e.key === 'ArrowUp' ? 1 : 0
              if (dir === 0) return
              e.preventDefault()
              setPos((v) => Math.min(100, Math.max(0, v + dir * (e.shiftKey ? 10 : 2))))
            }}
            aria-label="Drag to compare before (left) and after (right)"
            aria-valuetext={`${Math.round(pos)} percent before`}
            className="absolute inset-0 h-full w-full cursor-ew-resize opacity-0 [touch-action:none]"
          />
        </div>

        {pairs.length > 1 && (
          <div
            className="mt-6 flex items-center gap-2"
            onTouchStart={(e) => {
              touchX.current = e.touches[0]?.clientX ?? null
            }}
            onTouchEnd={(e) => {
              const start = touchX.current
              const end = e.changedTouches[0]?.clientX
              touchX.current = null
              if (start === null || end === undefined) return
              if (Math.abs(end - start) < 40) return
              go(end < start ? idx + 1 : idx - 1)
            }}
          >
            <button
              type="button"
              onClick={() => go(idx - 1)}
              aria-label="Previous comparison"
              className="btn flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full border border-on-primary/25 text-on-primary hover:border-accent"
            >
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m15 6-6 6 6 6" />
              </svg>
            </button>
            <div role="tablist" aria-label="Comparisons" className="flex flex-1 flex-wrap gap-2">
              {pairs.map((p, i) => (
                <button
                  key={p.label}
                  role="tab"
                  type="button"
                  aria-selected={i === idx}
                  onClick={() => go(i)}
                  className={`btn rounded-full px-4 py-2 text-sm font-semibold ${
                    i === idx ? 'bg-accent text-on-accent' : 'border border-on-primary/25 text-on-primary hover:border-accent'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => go(idx + 1)}
              aria-label="Next comparison"
              className="btn flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full border border-on-primary/25 text-on-primary hover:border-accent"
            >
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m9 6 6 6-6 6" />
              </svg>
            </button>
          </div>
        )}

        {pair.caption && <p className="mt-4 text-base text-on-primary/80">{pair.caption}</p>}
        <p className="mt-2 text-sm text-on-primary/60">Drag the handle, or focus it and use the arrow keys.</p>

        <div className="mt-10 flex flex-wrap items-center gap-5">
          <p className="font-heading text-xl font-bold">Want results like this on your car?</p>
          <Link href="/book" className="btn rounded-site bg-accent px-6 py-3.5 text-base font-semibold text-on-accent hover:bg-accent-dark">
            Book a Detail
          </Link>
        </div>
      </div>
    </section>
  )
}
