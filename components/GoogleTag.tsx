import { config } from '@/lib/config'
import { gtagScript, gtagSrc, leadTrackingScript, metaPixelScript } from '@/lib/track'

/**
 * Every analytics and ad tag on the site, and the one lead hook they all share.
 *
 * Rendered by the root layout. Each platform loads ONLY when its id is set in
 * config.tracking, so a site with just a Google Ads id ships exactly what it
 * shipped before Meta and GA4 were wired up, and a site with none of them
 * ships nothing at all, not even an empty script tag.
 *
 * Plain script tags from a server component on purpose: next/script and client
 * components are bundled into every page's JavaScript even when they render
 * nothing. This file imports nothing client-side.
 *
 * What fires, and from where, is all in lib/track.ts. The short version: the
 * sealed contact form is watched from outside (it is checksum-verified and must
 * not be edited), a confirmed booking calls the hook directly, and a tel: click
 * is caught by one listener on the document.
 *
 * The <noscript> pixel image Meta's own snippet includes is deliberately left
 * out: it cannot fire a Lead event, it only logs a PageView for a visitor with
 * JavaScript off, and it puts a tracking request on the page for someone who
 * cannot consent to it through any UI this site has.
 */
export default function GoogleTag() {
  const src = gtagSrc(config)
  const gtag = gtagScript(config)
  const meta = metaPixelScript(config)
  const lead = leadTrackingScript(config)

  if (!src && !meta && !lead) return null

  return (
    <>
      {src && <script async src={src} />}
      {gtag && <script id="google-tag" dangerouslySetInnerHTML={{ __html: gtag }} />}
      {meta && <script id="meta-pixel" dangerouslySetInnerHTML={{ __html: meta }} />}
      {lead && <script id="lead-tracking" dangerouslySetInnerHTML={{ __html: lead }} />}
    </>
  )
}
