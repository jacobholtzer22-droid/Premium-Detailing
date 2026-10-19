'use client'

import { useEffect, useRef, useState } from 'react'
import { config } from '@/lib/config'

/**
 * The Instagram section.
 *
 * Nothing is requested from instagram.com until the section is near the
 * viewport: the IntersectionObserver arms the section, and only then are the
 * blockquotes written and embed.js appended. Before that every tile is a
 * styled placeholder with the caption opening and a link, which is also what
 * stays on screen for any tile the embed never replaces within five seconds.
 * That matters because this is third-party script on a page whose whole job is
 * converting a visitor; it must never be what makes the page slow or blank.
 *
 * There is no live feed and no live follower count. Both need the owner to
 * connect the account through Behold or the Instagram Graph API, which is on
 * the client follow-up list. Until then the permalinks in config are pasted by
 * hand and the follower figure carries the date it was read.
 */
const EMBED_SRC = 'https://www.instagram.com/embed.js'
const FALLBACK_AFTER_MS = 5000

declare global {
  interface Window {
    instgrm?: { Embeds: { process: () => void } }
  }
}

export default function InstagramFeed() {
  const ig = config.social.instagram
  const posts = ig?.posts ?? []
  const [armed, setArmed] = useState(false)
  const [ready, setReady] = useState<boolean[]>(() => posts.map(() => false))
  const sectionRef = useRef<HTMLElement>(null)
  const hosts = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    const node = sectionRef.current
    if (!node || posts.length === 0) return
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
  }, [posts.length])

  useEffect(() => {
    if (!armed) return

    // Blockquotes first, script second: embed.js processes whatever is already
    // in the document when it loads, so appending it before they exist means
    // nothing gets replaced.
    posts.forEach((post, i) => {
      const host = hosts.current[i]
      if (!host || host.querySelector('blockquote')) return
      const bq = document.createElement('blockquote')
      bq.className = 'instagram-media'
      bq.setAttribute('data-instgrm-permalink', post.url)
      bq.setAttribute('data-instgrm-version', '14')
      bq.setAttribute('style', 'margin:0;width:100%;min-width:0;max-width:100%;border:0;')
      host.appendChild(bq)
    })

    if (document.querySelector(`script[src="${EMBED_SRC}"]`)) {
      window.instgrm?.Embeds.process()
    } else {
      const s = document.createElement('script')
      s.async = true
      s.src = EMBED_SRC
      document.body.appendChild(s)
    }

    // Poll for the iframe rather than trusting a load event: embed.js replaces
    // each blockquote independently and tells us nothing when it does.
    const started = Date.now()
    const timer = window.setInterval(() => {
      setReady(hosts.current.map((h) => Boolean(h?.querySelector('iframe'))))
      if (Date.now() - started >= FALLBACK_AFTER_MS) window.clearInterval(timer)
    }, 400)
    return () => window.clearInterval(timer)
  }, [armed, posts])

  if (!ig || posts.length === 0) return null

  return (
    <section ref={sectionRef} className="border-t border-line bg-bg">
      <div className="mx-auto max-w-page px-4 py-16 sm:px-6 md:py-24">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="font-heading text-3xl font-bold text-primary-dark md:text-4xl">Follow the work</h2>
            <p className="mt-2 text-base text-muted" title={`Read ${ig.followersAsOf}`}>
              {ig.followers} followers on Instagram
            </p>
          </div>
          <a
            href={ig.url}
            rel="noopener noreferrer"
            target="_blank"
            className="btn inline-block rounded-site bg-accent px-6 py-3 text-sm font-semibold text-on-accent hover:bg-accent-dark"
          >
            Follow @{ig.handle}
          </a>
        </div>

        <ul className="no-scrollbar mt-10 flex snap-x snap-mandatory gap-5 overflow-x-auto pb-2 md:grid md:grid-cols-2 md:overflow-visible lg:grid-cols-3">
          {posts.map((post, i) => (
            <li key={post.url} className="w-[85%] flex-shrink-0 snap-start md:w-auto">
              <div className="relative mx-auto aspect-[9/16] w-full max-w-[304px] overflow-hidden rounded-site border border-line bg-primary-soft">
                <div
                  ref={(el) => {
                    hosts.current[i] = el
                  }}
                  className="absolute inset-0 overflow-hidden" />
                {!ready[i] && (
                  <div className="absolute inset-0 flex flex-col justify-end gap-3 bg-primary-soft p-5">
                    <p className="text-base leading-relaxed text-ink">{post.excerpt}</p>
                    <a
                      href={post.url}
                      rel="noopener noreferrer"
                      target="_blank"
                      className="text-sm font-semibold text-accent underline-offset-4 hover:underline"
                    >
                      Watch on Instagram
                    </a>
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
