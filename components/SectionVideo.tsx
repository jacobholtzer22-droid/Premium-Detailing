'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { observePlayback, releasePlayback } from '@/lib/video-playback'

interface Props {
  desktop: string
  mobile: string
  poster: string
  alt: string
}

/**
 * Background footage for a mid-page band. Not the hero: see HeroVideo for
 * that one, which is above the fold and must load eagerly.
 *
 * THREE PLAYBACK RULES, all load-bearing:
 *
 * 1. NOTHING BELOW THE FOLD PRELOADS. No src is set until the band is close
 *    to the viewport. A `preload="none"` attribute would not be enough: with
 *    src present the browser may still fetch, and on a static export every
 *    byte here is a byte the hero is competing with.
 * 2. PLAY ON ENTER, PAUSE ON LEAVE, via IntersectionObserver. A band playing
 *    three screens away is decode work and battery for something nobody can
 *    see.
 * 3. ONLY ONE VIDEO PLAYS AT A TIME, enforced across components by the
 *    module-level registry below. Two background clips decoding at once is
 *    where a mid-range phone starts dropping frames in the scroll itself.
 *
 * The registry in lib/video-playback.ts is shared with the hero, so the
 * one-at-a-time rule holds across components rather than only within this
 * one.
 *
 * Failure is always safe, exactly as in the hero: the poster is a real <img>
 * that is always rendered and never removed, so a declined autoplay, reduced
 * motion, data saver, or a decode failure all land on a complete still with
 * no layout shift.
 *
 * STACKING. This component paints at z-0 and expects its section to position
 * the copy above it, which is how components/Hero.tsx is already built in
 * this template. Do not give it a negative z-index: against a STATIC copy
 * block a positioned element at z-0 paints on top whatever the DOM order, and
 * in the client repo this was ported from that rendered a hero with no text
 * at all until the media was pushed to -z-20 and the scrim to -z-10. Either
 * convention works; mixing them does not.
 */

export default function SectionVideo({ desktop, mobile, poster, alt }: Props) {
  const [src, setSrc] = useState<string | null>(null)
  const hostRef = useRef<HTMLDivElement | null>(null)
  const videoRef = useRef<HTMLVideoElement | null>(null)

  // Decide whether this band is allowed motion at all, and at what size.
  // Runs once; it does not fetch anything.
  const wanted = useRef<string | null>(null)
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const conn = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection
    if (conn?.saveData === true) return
    wanted.current = window.matchMedia('(max-width: 767px)').matches ? mobile : desktop
  }, [desktop, mobile])

  /**
   * TWO observers, deliberately, because arming and playing want different
   * trigger points.
   *
   * With one observer at a 200px margin, both bands on the homepage came
   * into range at the same scroll position and the LAST one to fire claimed
   * playback, which meant the band actually on screen sat paused while the
   * one below it played. Measured, not theoretical.
   *
   * So: arm early and wide, so the first frame is decoded before anyone sees
   * it; play only once the band is genuinely on screen.
   */
  useEffect(() => {
    const host = hostRef.current
    if (!host) return
    // 1. ARM. Wide margin, any sliver counts. Sets the source, nothing else.
    const arm = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting && !src && wanted.current) setSrc(wanted.current)
        }
      },
      { rootMargin: '200px 0px', threshold: 0.01 },
    )
    arm.observe(host)
    return () => arm.disconnect()
  }, [src])

  useEffect(() => {
    const host = hostRef.current
    if (!host) return
    // 2. PLAY. Real viewport, a third of the band visible, so the clip
    //    playing is always the one being looked at. Shared registry, so it
    //    also pauses the hero if the hero somehow still holds the slot.
    return observePlayback(host, () => videoRef.current)
  }, [src])

  useEffect(() => {
    return () => {
      if (videoRef.current) releasePlayback(videoRef.current)
    }
  }, [])

  /**
   * Same muted-attribute problem as the hero: React sets `muted` as a DOM
   * property and never reflects it to the content attribute, which is the one
   * the autoplay policy reads. Attribute first, source second, so resource
   * selection runs once and runs correct. See components/HeroVideo.tsx for
   * the measurements behind this.
   */
  const mountVideo = useCallback(
    (el: HTMLVideoElement | null) => {
      videoRef.current = el
      if (!el || !src) return
      el.setAttribute('muted', '')
      el.defaultMuted = true
      el.muted = true
      el.src = src
      // DELIBERATELY NO playExclusively HERE. Arming is not a reason to play.
      //
      // This line used to be `playExclusively(el)`, and it is the third bug in
      // this component, found by measuring the ported version rather than
      // trusting it. Arming happens inside the 200px margin, which is OFF
      // SCREEN. So a band that came into range claimed the single playback
      // slot, paused the band the visitor was actually looking at, and then
      // its own play observer immediately paused IT for not being 34% visible.
      // Net effect at 390x820 with two stacked bands: a band 100% in view sat
      // frozen with nothing playing anywhere on the page, and it never
      // recovered, because its play observer only fires on an intersection
      // CHANGE and it was already intersecting.
      //
      // The play observer below is keyed on `src`, so setting the source
      // re-creates it, and a fresh IntersectionObserver always delivers the
      // current state on its first callback. That is what starts playback, and
      // it only does so when the band is genuinely on screen.
    },
    [src],
  )

  return (
    <div ref={hostRef} aria-hidden="true" className="absolute inset-0 z-0">
      <img src={poster} alt={alt} decoding="async" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
      {src && (
        <video
          ref={mountVideo}
          poster={poster}
          muted
          loop
          playsInline
          preload="none"
          tabIndex={-1}
          disablePictureInPicture
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}
    </div>
  )
}
