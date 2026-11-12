import type { SiteConfig } from './config-schema'

/**
 * ONE lead-tracking hook, for every ad platform and every lead on the site.
 *
 * WHY IT IS ONE FUNCTION. Before this there was one inline script that fired a
 * Google Ads conversion when the contact form showed its thank-you. Adding
 * GA4 and Meta the same way would have meant three scripts each watching the
 * same DOM for the same event, and a booking would have had to repeat all
 * three. Instead this defines a single global, `window.aaTrackLead(source)`,
 * and everything that produces a lead calls it:
 *
 *   the sealed contact form  a MutationObserver watches for its thank-you,
 *                            because components/ContactForm.tsx is
 *                            checksum-verified and must not be edited
 *   a confirmed booking      components/BookingCards.tsx calls it directly
 *
 * Each platform fires only when its id is configured, so a site with only a
 * Google Ads id behaves exactly as it did before this file existed, and the
 * owner can hand over a GA4 or Meta id later with no code change.
 *
 * It is a string of JavaScript rather than a client component on purpose: a
 * client component is bundled into every page's payload even when it renders
 * nothing, so a site with no tracking would still ship the chunk.
 *
 * NOTHING SECRET GOES IN HERE. Ad platform ids are public by nature; they are
 * in the page source of every site that uses them. The Meta Conversions API
 * would need an access token, which is a secret, which is why it is not here.
 */

/** The global the booking flow calls. Keep in step with components/BookingCards.tsx. */
export const LEAD_HOOK = 'aaTrackLead' as const

/** Where a lead came from. Passed through to GA4 and Meta as an event parameter. */
export type LeadSource = 'form' | 'booking'

/**
 * The inline script: defines the hook, wires the contact form observer, and
 * wires the tel: click listener. Returns an empty string when there is nothing
 * to track, so the caller renders no script tag at all.
 */
export function leadTrackingScript(config: SiteConfig): string {
  const t = config.tracking
  if (!t) return ''

  const adsForm = t.conversions.form ?? ''
  const adsCall = t.conversions.call ?? ''
  const hasGtag = Boolean(t.googleAdsId || t.ga4)
  const hasMeta = Boolean(t.metaPixelId)

  if (!adsForm && !adsCall && !t.ga4 && !hasMeta) return ''

  const j = JSON.stringify

  return [
    '(function(){',
    `var hook=${j(LEAD_HOOK)};`,
    'var fired={};',
    // gtag and fbq may not have loaded yet when a fast submit happens. Both
    // queue through their own stubs, so calling them early is safe; the typeof
    // guards are for the case where the script was blocked entirely.
    `function ads(label){if(!label)return;if(typeof gtag!=='function')return;gtag('event','conversion',{send_to:label});}`,
    t.ga4
      ? `function ga4(source){if(typeof gtag!=='function')return;gtag('event','generate_lead',{lead_source:source});}`
      : 'function ga4(){}',
    hasMeta
      ? `function meta(source){if(typeof fbq!=='function')return;fbq('track','Lead',{content_name:source});}`
      : 'function meta(){}',
    // One lead per source per page view. A visitor who submits the contact
    // form and then books would fire two, which is correct: those are two
    // leads. The same source twice is a double count, which is not.
    'window[hook]=function(source){',
    "source=source||'form';",
    'if(fired[source])return;',
    'fired[source]=true;',
    `ads(${j(adsForm)});`,
    'ga4(source);',
    'meta(source);',
    '};',
    // The sealed contact form. It renders `role="status"` only after a 2xx
    // from the platform, so a failed POST cannot be counted as a lead. That
    // role is reserved sitewide for this one element; see the note in
    // components/BookingCards.tsx.
    adsForm || t.ga4 || hasMeta
      ? [
          'var o=new MutationObserver(function(){',
          'if(document.querySelector(\'main [role="status"]\')){o.disconnect();window[hook]("form");}',
          '});',
          'o.observe(document.documentElement,{childList:true,subtree:true});',
        ].join('')
      : '',
    // A call is a lead too, and it is the one the owner notices. One listener
    // on the document, so no link component has to know about tracking.
    adsCall && hasGtag
      ? `document.addEventListener('click',function(e){var a=e.target&&e.target.closest&&e.target.closest('a[href^="tel:"]');if(a)ads(${j(adsCall)});},true);`
      : '',
    '})();',
  ].join('')
}

/** The gtag bootstrap, for whichever of the Google ids are set. */
export function gtagScript(config: SiteConfig): string {
  const t = config.tracking
  if (!t) return ''
  const ids = [t.googleAdsId, t.ga4].filter((id): id is string => Boolean(id))
  if (ids.length === 0) return ''
  return [
    'window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}',
    "gtag('js',new Date());",
    ...ids.map((id) => `gtag('config',${JSON.stringify(id)});`),
  ].join('')
}

/** The Meta pixel bootstrap. Empty string when no pixel id is configured. */
export function metaPixelScript(config: SiteConfig): string {
  const id = config.tracking?.metaPixelId
  if (!id) return ''
  return [
    '!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?',
    'n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;',
    "n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;",
    't.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,',
    "document,'script','https://connect.facebook.net/en_US/fbevents.js');",
    `fbq('init',${JSON.stringify(id)});fbq('track','PageView');`,
  ].join('')
}

/** The gtag.js URL for whichever Google id loads the library. */
export function gtagSrc(config: SiteConfig): string | null {
  const t = config.tracking
  const id = t?.googleAdsId ?? t?.ga4
  return id ? `https://www.googletagmanager.com/gtag/js?id=${id}` : null
}
