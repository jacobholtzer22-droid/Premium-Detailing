import type { Metadata } from 'next'
import JsonLd from '@/components/JsonLd'
import PageHeader from '@/components/PageHeader'
import Phone from '@/components/Phone'
import { config } from '@/lib/config'
import { contentExists, loadContent, readFrontmatter } from '@/lib/content'
import { breadcrumbList } from '@/lib/schema'
import { buildMetadata } from '@/lib/seo'

const CONTENT = 'privacy-policy.mdx'
const CRUMBS = [
  { name: 'Home', path: '/' },
  { name: 'Privacy Policy', path: '/privacy-policy' },
]

export function generateMetadata(): Metadata {
  const fm = readFrontmatter(CONTENT)
  return buildMetadata({ kind: 'privacy', path: '/privacy-policy', description: fm.description }).metadata
}

/**
 * Generated from config so the legal name, site, and contact details can never
 * be stale copy from another client. content/privacy-policy.mdx, if present,
 * renders above it for any client-specific additions.
 */
export default async function PrivacyPolicyPage() {
  const extra = contentExists(CONTENT) ? await loadContent(CONTENT) : null
  const host = new URL(config.domain).host
  /**
   * The form only asks for these when config.contactForm turns them on, and
   * this page has to describe what is actually collected. Listing them
   * unconditionally would be inaccurate on every site that does not ask.
   */
  const cf = config.contactForm
  const collected = [
    cf?.address && cf.address !== 'off' ? 'the property address where the work is needed' : null,
    cf?.zip && cf.zip !== 'off' ? 'your ZIP code' : null,
    cf?.timeframe ? 'how soon you need the work done' : null,
  ].filter((v): v is string => v !== null)
  // "a, b and c", or "" when nothing extra is collected.
  const extras =
    collected.length === 0
      ? ''
      : collected.length === 1
        ? ` ${collected[0]},`
        : ` ${collected.slice(0, -1).join(', ')} and ${collected.at(-1)},`
  return (
    <>
      <JsonLd data={breadcrumbList(CRUMBS)} />
      <PageHeader title="Privacy Policy" crumbs={CRUMBS} />
      <article className="prose-custom mx-auto max-w-3xl px-4 pt-6 text-base leading-relaxed text-ink sm:px-6">
        {extra?.content}

        <h2 className="mt-10 font-heading text-2xl font-bold text-primary-dark">Who we are</h2>
        <p className="mt-4">
          This website, {host}, is operated by {config.legalName} (&quot;{config.displayName}&quot;). This policy explains what
          information the site collects and how it is used.
        </p>

        <h2 className="mt-10 font-heading text-2xl font-bold text-primary-dark">Information you send us</h2>
        <p className="mt-4">
          When you submit the contact form, we receive the name, phone number, email address,{extras} and message you
          enter, along with basic technical details such as your IP address and browser type. We use this information to
          respond to your request, prepare a quote, and schedule work. We do not sell it.
        </p>

        <h2 className="mt-10 font-heading text-2xl font-bold text-primary-dark">Text messages</h2>
        <p className="mt-4">
          If you check the consent box on the contact form, {config.displayName} may send you text messages about your request.
          Consent is not a condition of purchase. Message and data rates may apply. Reply STOP to any message to opt out, or
          reply HELP for assistance. Mobile information is not shared with third parties for marketing purposes.
        </p>

        <h2 className="mt-10 font-heading text-2xl font-bold text-primary-dark">Service providers</h2>
        <p className="mt-4">
          Form submissions are delivered to us through a customer relationship platform operated on our behalf by Align and
          Acquire, which stores them so we can follow up. The site is hosted by a commercial hosting provider, which may
          log standard request data.
        </p>

        <h2 className="mt-10 font-heading text-2xl font-bold text-primary-dark">Cookies and analytics</h2>
        <p className="mt-4">
          We count visits to this site without cookies: we log the page viewed, the site that linked here, ad campaign tags and an approximate location (country, region and city), and we never store your IP address.
        </p>
        <p className="mt-4">
          If you click OK on the cookie banner, we also use PostHog to record how you use this site (clicks, scrolling and a replay of your visit, with anything you type hidden); you can change your choice at any time with the Cookie settings link at the bottom of every page, and if your browser sends a Global Privacy Control signal we leave this off.
        </p>

        <h2 className="mt-10 font-heading text-2xl font-bold text-primary-dark">Your choices</h2>
        <p className="mt-4">
          You can ask us to correct or delete the information you sent us at any time. Call <Phone /> {config.email ? (
            <>
              or email{' '}
              <a href={`mailto:${config.email}`} className="font-medium text-primary underline-offset-2 hover:underline">
                {config.email}
              </a>
            </>
          ) : null}{' '}
          and we will take care of it.
        </p>
      </article>
    </>
  )
}
