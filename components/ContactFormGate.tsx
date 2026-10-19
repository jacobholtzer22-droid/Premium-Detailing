import { config } from '@/lib/config'
import ContactForm from './ContactForm'
import Phone from './Phone'

/**
 * Lead safety while the platform slug is still the placeholder.
 *
 * The form posts config.businessSlug to the platform. With the placeholder
 * value that request is accepted and answered 200, and the lead is then
 * dropped on the floor because no Business row matches. A visitor gets a
 * success message, the owner gets nothing, and nobody finds out until the
 * client asks why the website never produces work. An HTTP 200 is not
 * evidence a lead landed.
 *
 * So until the real slug is in place the form is disabled and the page offers
 * the two routes that DO work right now: the phone, and the booking page.
 *
 * ContactForm itself is untouched and unwrapped in its own markup: this puts
 * a <fieldset disabled> AROUND it, which the browser applies to every control
 * inside without the component knowing. That matters because the component is
 * checksum verified (check 4) and its endpoint and honeypot are checked in the
 * built HTML (checks 5 and 6), all of which still pass with the gate in place.
 *
 * Deleting this wrapper is not how the gate comes off. Run
 * `npm run set-slug -- <slug>`: once businessSlug is real, the condition below
 * is false and the form renders exactly as it always did.
 */
const PLACEHOLDER = 'replace-before-launch'

export default function ContactFormGate() {
  if (config.businessSlug !== PLACEHOLDER) return <ContactForm />

  return (
    <div>
      <div className="mb-6 rounded-site border-2 border-blue-text bg-surface p-5">
        <p className="font-heading text-base font-bold text-primary-dark">Online quotes open shortly</p>
        <p className="mt-2 text-base leading-relaxed text-ink">
          Call <Phone className="text-primary-dark" /> or{' '}
          <a href="/book" className="font-semibold text-primary underline-offset-2 hover:underline">
            book a package now
          </a>
          .
        </p>
      </div>
      <fieldset disabled className="opacity-60">
        <ContactForm />
      </fieldset>
    </div>
  )
}
