'use client'

import { useEffect, useRef, useState } from 'react'

/**
 * The TikTok profile embed.
 *
 * Same discipline as components/InstagramFeed.tsx, and for the same reason:
 * nothing is requested from tiktok.com until the section is near the viewport,
 * and until the embed replaces it there is a styled card with a link to the
 * profile. A third-party script on a page whose whole job is converting a
 * visitor must never be what makes it slow or blank.
 *
 * Unlike the Instagram tiles this needs nothing kept up to date by hand. It is
 * the creator embed, so it renders whatever he posted most recently; the only
 * configuration is the handle.
 *
 * The box carries a reserved height so the page does not jump when the iframe
 * arrives, and the fallback sits inside the same box so there is no second
 * layout to shift between.
 */

const EMBED_SRC = 'https://www.tiktok.com/embed.js'
const FALLBACK_AFTER_MS = 5000

export default function TikTokEmbed({ handle, url }: { handle: string; url: string }) {
  const [armed, setArmed] = useState(false)
  const [ready, setReady] = useState(false)
  const sectionRef = useRef<HTMLDivElement>(null)
  const hostRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const node = sectionRef.current
    if (!node) return
    if (typeof IntersectionObserver === 'undefined') {
      setArmed(true)
      return
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          io.disconnect()
          setArmed(true)
        }
      },
      { rootMargin: '200px' },
    )
    io.observe(node)
    return () => io.disconnect()
  }, [])

  useEffect(() => {
    if (!armed) return
    const host = hostRef.current
    if (!host) return

    // Blockquote first, script second: embed.js processes whatever is already
    // in the document when it loads.
    if (!host.querySelector('blockquote')) {
      const bq = document.createElement('blockquote')
      bq.className = 'tiktok-embed'
      bq.setAttribute('cite', url)
      bq.setAttribute('data-unique-id', handle)
      bq.setAttribute('data-embed-type', 'creator')
      bq.setAttribute('style', 'margin:0;max-width:780px;min-width:288px;')
      const section = document.createElement('section')
      const link = document.createElement('a')
      link.href = `${url}?refer=creator_embed`
      link.target = '_blank'
      link.rel = 'noopener noreferrer'
      link.textContent = `@${handle}`
      section.appendChild(link)
      bq.appendChild(section)
      host.appendChild(bq)
    }

    if (!document.querySelector(`script[src="${EMBED_SRC}"]`)) {
      const s = document.createElement('script')
      s.async = true
      s.src = EMBED_SRC
      document.body.appendChild(s)
    }

    // Poll for the iframe: embed.js tells us nothing when it swaps the node.
    const started = Date.now()
    const timer = window.setInterval(() => {
      setReady(Boolean(hostRef.current?.querySelector('iframe')))
      if (Date.now() - started >= FALLBACK_AFTER_MS) window.clearInterval(timer)
    }, 400)
    return () => window.clearInterval(timer)
  }, [armed, handle, url])

  return (
    <div ref={sectionRef}>
      <div className="relative min-h-[560px] overflow-hidden rounded-site border border-line bg-primary-soft">
        <div ref={hostRef} className="w-full" />
        {!ready && (
          <div className="absolute inset-0 flex flex-col justify-end gap-3 p-6">
            <p className="font-heading text-lg font-bold text-primary-dark">@{handle} on TikTok</p>
            <p className="text-base leading-relaxed text-ink">
              Finished cars, work in progress and the odd disaster brought back from the dead.
            </p>
            <a
              href={url}
              rel="noopener noreferrer"
              target="_blank"
              className="text-sm font-semibold text-accent underline-offset-4 hover:underline"
            >
              Watch on TikTok
            </a>
          </div>
        )}
      </div>
    </div>
  )
}
