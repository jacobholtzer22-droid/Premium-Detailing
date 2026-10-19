/**
 * ONE background video plays at a time, across every component on the page.
 *
 * Module scope is the point: HeroVideo and SectionVideo both import this, so
 * the rule holds between them and not just within each. Two clips decoding at
 * once is where a mid-range phone starts dropping frames in the scroll
 * itself, which is the opposite of what the motion is for.
 *
 * THE HERO JOINS THIS REGISTRY TOO, and that is the first of two fixes
 * carried from the client repo this was proven in rather than re-derived.
 *
 * The hero was originally excluded, on the reasoning that it is above the
 * fold and a section band could never be visible at the same time. A
 * screenshot pass that stretches the viewport to the full page height showed
 * the hero and a band playing together, which exposed the real cost: with no
 * observer of its own the hero kept decoding the entire way down the page,
 * spending battery on frames nobody could see. Both now pause when they leave
 * the viewport and resume when they come back.
 */
let current: HTMLVideoElement | null = null

/** Pause whoever is playing and hand playback to `el`. */
export function claimPlayback(el: HTMLVideoElement): void {
  if (current && current !== el) current.pause()
  current = el
}

/** Give up the slot, if this element holds it. */
export function releasePlayback(el: HTMLVideoElement): void {
  if (current === el) current = null
}

/**
 * Claim the slot and start playing. Never throws and never reports failure:
 * every caller renders a poster underneath that is already correct, so a
 * declined autoplay is a non-event.
 *
 * Note play() can RESOLVE without actually playing when the policy declines,
 * so the resolved promise is not evidence of playback.
 */
export function playExclusively(el: HTMLVideoElement): void {
  claimPlayback(el)
  const attempt = el.play()
  if (attempt && typeof attempt.catch === 'function') attempt.catch(() => {})
}

/**
 * Pause when the element leaves the viewport, play when it returns.
 * Returns a disconnect function for effect cleanup.
 */
export function observePlayback(host: Element, getVideo: () => HTMLVideoElement | null, threshold = 0.34): () => void {
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        const el = getVideo()
        if (!el) continue
        if (e.isIntersecting) {
          if (el.paused) playExclusively(el)
        } else {
          el.pause()
          releasePlayback(el)
        }
      }
    },
    { threshold },
  )
  io.observe(host)
  return () => io.disconnect()
}
