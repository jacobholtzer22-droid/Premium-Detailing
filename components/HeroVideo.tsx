'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { observePlayback, playExclusively, releasePlayback } from '@/lib/video-playback'

interface Props {
  desktop: string
  mobile: string
}

/**
 * Optional full-bleed footage for the full-bleed hero. OPT IN: it renders
 * only when config.images.heroVideo is set, and it never replaces the poster.
 *
 * THE POSTER IS NOT IN THIS COMPONENT. Hero already renders config.images.hero
 * through <Img priority>, which is the LCP element and is preloaded, and this
 * sits on top of it at the same z-index. So a declined autoplay, reduced
 * motion, data saver, a decode failure or a slow network all land on the
 * photograph that was going to be there anyway, with no layout shift and
 * nothing to swap. It also keeps verify check 19 honest: the contrast gate
 * measures the hero photograph, and the photograph is still what a visitor
 * reads the H1 over whenever the video has not started.
 *
 * ARMED ON IDLE, NOT ON MOUNT. Requesting the clip during initial render puts
 * it in first load, where it competes for bandwidth with the image that
 * decides LCP. Measured in the first client repo to carry this: mobile first
 * load 822 KB to 350 KB, desktop 1459 KB to 350 KB, LCP poster unchanged,
 * CLS 0. requestIdleCallback with a setTimeout fallback, because Safari has
 * no requestIdleCallback and the fallback is the only path there.
 *
 * WHY THE `muted` ATTRIBUTE IS SET BY HAND, and why `src` is not a JSX prop.
 * React sets `muted` as a DOM PROPERTY and never reflects it to the content
 * attribute, and the autoplay policy reads the attribute. With src already
 * set at append time the autoplay decision is made against an element that
 * does not look muted, and it is declined: measured on a real build at 375px,
 * readyState 4, no error, and paused true. Worse, calling play() in that
 * state RESOLVES its promise without playing, so a .catch() fallback reports
 * success while the video sits on frame 0.
 *
 * Appending with no source means there is no autoplay decision to lose. The
 * ref sets the attribute first and assigns src second, so resource selection
 * runs once and runs correct. Setting the attribute and calling load()
 * instead also works, and re-runs the fetch: that downloaded the clip twice.
 */
export default function HeroVideo({ desktop, mobile }: Props) {
  const [src, setSrc] = useState<string | null>(null)
  const hostRef = useRef<HTMLDivElement | null>(null)
  const videoRef = useRef<HTMLVideoElement | null>(null)

  useEffect(() => {
    // Reduced motion and data saver: the poster is the whole experience and
    // nothing is fetched at all.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const conn = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection
    if (conn?.saveData === true) return

    const pick = () => setSrc(window.matchMedia('(max-width: 767px)').matches ? mobile : desktop)
    const ric = (window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number }).requestIdleCallback
    if (typeof ric === 'function') {
      const handle = ric(pick, { timeout: 2500 })
      const cancel = (window as Window & { cancelIdleCallback?: (h: number) => void }).cancelIdleCallback
      return () => cancel?.(handle)
    }
    const timer = window.setTimeout(pick, 1200)
    return () => window.clearTimeout(timer)
  }, [desktop, mobile])

  const mountVideo = useCallback(
    (el: HTMLVideoElement | null) => {
      videoRef.current = el
      if (!el || !src) return
      el.setAttribute('muted', '')
      el.defaultMuted = true
      el.muted = true
      el.src = src
      // Shared one-at-a-time registry, so the hero yields to a section band
      // and vice versa. Never surfaced: the poster underneath is correct.
      playExclusively(el)
    },
    [src],
  )

  /**
   * Pause once the hero scrolls away, resume when it comes back. Without
   * this the hero kept decoding the whole way down the page while a section
   * band was also playing. See lib/video-playback.ts.
   */
  useEffect(() => {
    const host = hostRef.current
    if (!host || !src) return
    return observePlayback(host, () => videoRef.current)
  }, [src])

  useEffect(() => () => { if (videoRef.current) releasePlayback(videoRef.current) }, [])

  if (!src) return null
  return (
    <div ref={hostRef} className="absolute inset-0 z-0">
      <video
        ref={mountVideo}
        muted
        autoPlay
        loop
        playsInline
        preload="metadata"
        aria-hidden="true"
        tabIndex={-1}
        disablePictureInPicture
        className="absolute inset-0 h-full w-full object-cover"
      />
    </div>
  )
}
