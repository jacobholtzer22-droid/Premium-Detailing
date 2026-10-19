'use client'

import { useEffect, useRef, useState } from 'react'
import type { CSSProperties, ElementType, ReactNode } from 'react'

interface Props {
  children: ReactNode
  /** Stagger within a group, in milliseconds. Cap a group at about 360ms. */
  delay?: number
  as?: ElementType
  className?: string
}

/**
 * Fades content up once, the first time it enters the viewport, then stops
 * observing. Nothing else on the site animates on scroll.
 *
 * The visible and hidden states both live in CSS (app/globals.css, the
 * [data-reveal] rules), which is what makes the reduced-motion branch work
 * without JavaScript: under `prefers-reduced-motion: reduce` the stylesheet
 * forces the final state, so content is never left invisible if the observer
 * does not run.
 */
export default function Reveal({ children, delay = 0, as: Tag = 'div', className = '' }: Props) {
  const ref = useRef<HTMLElement | null>(null)
  const [shown, setShown] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el || shown) return
    if (typeof IntersectionObserver === 'undefined') {
      setShown(true)
      return
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setShown(true)
            io.disconnect()
          }
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -8% 0px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [shown])

  return (
    <Tag
      ref={ref as never}
      data-reveal={shown ? 'in' : ''}
      style={{ '--reveal-delay': `${delay}ms` } as CSSProperties}
      className={className}
    >
      {children}
    </Tag>
  )
}
