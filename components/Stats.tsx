'use client'

import { useEffect, useRef, useState } from 'react'
import { config } from '@/lib/config'

/**
 * The three figures, counted up once when they first come into view.
 *
 * Integers count. Anything that is not a plain integer (a rating like "5.0")
 * is printed as written, because counting a decimal up looks like a bug.
 *
 * `variant` only changes the arrangement, never the behavior: 'card' is the
 * dark panel beside the homepage lead, 'strip' is the full width row. Both
 * use the same observer and the same count.
 */
function useCountUp(target: number | null, run: boolean, ms = 1200): number | null {
  // Seeded with the FINAL value, not zero, so the server-rendered HTML carries
  // the real number. A visitor whose JavaScript never runs reads "440", not
  // "0". The count only starts once the figures are actually in view.
  const [v, setV] = useState<number | null>(target)
  useEffect(() => {
    if (target === null || !run) return
    const reduce = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    if (reduce) {
      setV(target)
      return
    }
    let raf = 0
    const t0 = performance.now()
    const tick = (now: number) => {
      const p = Math.min((now - t0) / ms, 1)
      // easeOutCubic
      setV(Math.round(target * (1 - Math.pow(1 - p, 3))))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target, run, ms])
  return v
}

function Stat({
  value,
  suffix,
  label,
  run,
  big,
}: {
  value: string
  suffix: string
  label: string
  run: boolean
  big: boolean
}) {
  const isInt = /^\d+$/.test(value)
  const n = useCountUp(isInt ? Number(value) : null, run)
  const shown = isInt ? String(n ?? value) : value
  return (
    <div>
      <p
        className={`font-heading font-extrabold tabular-nums text-on-primary ${
          big ? 'text-5xl md:text-6xl' : 'text-4xl'
        }`}
      >
        {shown}
        {suffix}
      </p>
      <p className="mt-2 text-sm font-medium uppercase tracking-[0.14em] text-on-primary/70">{label}</p>
    </div>
  )
}

export default function Stats({ variant = 'strip' }: { variant?: 'strip' | 'card' }) {
  const ref = useRef<HTMLDivElement | null>(null)
  const [run, setRun] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el || run) return
    if (typeof IntersectionObserver === 'undefined') {
      setRun(true)
      return
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setRun(true)
            io.disconnect()
          }
        }
      },
      { threshold: 0.3 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [run])

  if (config.stats.length === 0) return null

  const items = config.stats.map((s) => (
    <Stat key={s.label} value={s.value} suffix={s.suffix ?? ''} label={s.label} run={run} big={variant === 'strip'} />
  ))

  if (variant === 'card') {
    return (
      <div ref={ref} className="rounded-site bg-primary p-8 text-on-primary md:p-10">
        <div className="flex flex-col gap-8">{items}</div>
      </div>
    )
  }

  return (
    <section className="bg-primary text-on-primary">
      <div ref={ref} className="mx-auto grid max-w-page gap-10 px-4 py-16 sm:grid-cols-3 sm:px-6 md:py-20">
        {items}
      </div>
    </section>
  )
}
