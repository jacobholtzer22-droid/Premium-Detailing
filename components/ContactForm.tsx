'use client'

/**
 * SEALED COMPONENT. CHECKSUM-VERIFIED. DO NOT MODIFY PER CLIENT.
 *
 * scripts/verify.ts hashes this file and compares it to
 * scripts/contact-form.sha256. Any edit fails the build gate. If the platform
 * contract genuinely changes, update the form, run `npm run seal-contact-form`
 * to re-baseline, and commit both files together in the template repo.
 *
 * What is fixed here and why:
 * - The endpoint is the frozen CONTACT_ENDPOINT constant, never an env var and
 *   never a literal typed here. The www host is load-bearing (308 on the apex).
 * - The payload shape { name, phone, email, message, smsConsent, businessSlug }
 *   plus the honeypot is what the platform parses. businessSlug comes from
 *   config, so a wrong slug is caught by verify, not discovered as lost leads.
 * - smsConsent is bound to a real checkbox. It is never hardcoded true.
 * - The honeypot uses a nonsense field name inside a `hidden` wrapper. Chrome
 *   autofills off-screen inputs and anything named "company", which silently
 *   killed real leads before, so neither technique is used.
 * - Success messaging is a generic thank-you, and it is shown ONLY for a 2xx.
 *   The endpoint returns 200 even when a downstream write fails, so no claim
 *   beyond "we received it" is honest even then; but a non-2xx means the lead
 *   did not land at all and the visitor is told to call instead.
 *
 * OPTIONAL EXTRA FIELDS, added without changing any of the above.
 *
 * config.contactForm is optional. With the block absent this renders the same
 * four fields and posts the same bytes it always did: `DEFAULTS` below is the
 * baseline, and every option in it is off.
 *
 * The platform parses `name` and `message`, and nothing else, so extra answers
 * go into those two: the split name is rejoined as "First Last", and everything
 * else is written as labelled lines at the top of `message`, then a blank line,
 * then whatever the visitor typed. No new payload key is ever introduced,
 * because the endpoint would ignore it and the lead would silently lose that
 * information.
 *
 * THE LABELLED LINES ALWAYS APPEAR IN THIS ORDER, whichever options are on:
 *
 *     Service:
 *     Address:
 *     ZIP:
 *     Timeframe:
 *
 * Fixed on purpose. These land in an owner's email and in the platform's lead
 * list, and a human skimming them should find the same fact in the same place
 * on every lead from every site. A line is omitted entirely when its option is
 * off or its answer is blank; the surviving lines keep this relative order.
 *
 * ZIP has two homes. With `address` on it belongs to the address and is written
 * into the Address line, because that is how an address is written. With
 * `address` off it stands alone as its own ZIP line.
 *
 * COPY OPTIONS. `messageLabel`, `messagePlaceholder` and `submitLabel` change
 * wording only. They add no field, no payload key and no validation rule, and
 * each defaults to the exact text this form has always rendered. The message
 * placeholder is where a site asks for several facts without adding several
 * inputs, which is the whole point: a short form converts better than a long
 * one. "Sending" is not configurable, because an in-flight button is state,
 * not copy.
 */

import { useState, type FormEvent } from 'react'
import { config, CONTACT_ENDPOINT, HONEYPOT_FIELD } from '@/lib/config'

type Status = 'idle' | 'sending' | 'done' | 'error'

/** Every option off: the shape this form had before config.contactForm existed. */
const DEFAULTS = {
  splitName: false,
  address: 'off' as const,
  zip: 'off' as const,
  serviceDropdown: false,
  emailRequired: false,
  timeframe: undefined as { label: string; options: string[]; required?: boolean } | undefined,
  // Copy only. These three are the exact strings this form has always
  // rendered, so a site that sets none of them is byte-identical to before
  // they existed. messagePlaceholder has no default: the attribute was never
  // present, and `placeholder=""` is not the same HTML as no placeholder.
  messageLabel: 'What do you need done?',
  messagePlaceholder: undefined as string | undefined,
  submitLabel: 'Send Message',
}

/** US ZIP, five digits, optionally +4. */
const ZIP_PATTERN = /^\d{5}(-\d{4})?$/

const NOT_SURE = 'Not sure yet'

export default function ContactForm() {
  const [status, setStatus] = useState<Status>('idle')
  const [smsConsent, setSmsConsent] = useState(false)
  const [validation, setValidation] = useState('')
  /**
   * Which field the inline message is about. Drives aria-invalid and
   * aria-describedby on that input, so a screen reader announces the message as
   * belonging to the field rather than as loose text at the bottom of the form.
   */
  const [invalidField, setInvalidField] = useState('')

  const opts = { ...DEFAULTS, ...(config.contactForm ?? {}) }
  const wantsAddress = opts.address !== 'off'
  const addressRequired = opts.address === 'required'
  const wantsZip = opts.zip !== 'off'
  const zipRequired = opts.zip === 'required'
  const timeframe = opts.timeframe
  const timeframeRequired = timeframe?.required === true

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setValidation('')
    setInvalidField('')
    const form = event.currentTarget
    const data = new FormData(form)
    const read = (key: string) => String(data.get(key) ?? '').trim()

    const first = read('firstName')
    const last = read('lastName')
    // One string either way. "First Last" when both are asked for.
    const name = opts.splitName ? [first, last].filter(Boolean).join(' ') : read('name')
    const phone = read('phone')
    const email = read('email')
    const typed = read('message')
    const service = read('service')
    const street = read('addressStreet')
    const city = read('addressCity')
    const zip = read('addressZip')
    const timeframeAnswer = read('timeframe')
    const honeypot = String(data.get(HONEYPOT_FIELD) ?? '')

    if (opts.splitName && !first) {
      setValidation('Please enter your first name.')
      setInvalidField('firstName')
      return
    }
    if (opts.splitName && !last) {
      setValidation('Please enter your last name.')
      setInvalidField('lastName')
      return
    }
    if (!name) {
      setValidation('Please enter your name.')
      setInvalidField('name')
      return
    }
    if (!phone) {
      setValidation('Please enter a phone number so we can reach you.')
      setInvalidField('phone')
      return
    }
    if (opts.emailRequired && !email) {
      setValidation('Please enter an email address.')
      setInvalidField('email')
      return
    }
    if (addressRequired && !street) {
      setValidation('Please enter the street address where the work is needed.')
      setInvalidField('addressStreet')
      return
    }
    if (addressRequired && !city) {
      setValidation('Please enter the city where the work is needed.')
      setInvalidField('addressCity')
      return
    }
    if (zipRequired && !zip) {
      setValidation('Please enter your ZIP code.')
      setInvalidField('addressZip')
      return
    }
    // Checked whenever one was typed, required or not: a malformed ZIP is
    // worse than none, because it looks like an answer.
    if (zip && !ZIP_PATTERN.test(zip)) {
      setValidation('Please enter a 5 digit ZIP code, for example 92801.')
      setInvalidField('addressZip')
      return
    }
    if (timeframeRequired && !timeframeAnswer) {
      // No quotes or trailing period: the label is usually already a question,
      // and "installed?"." reads as a typo.
      setValidation(`Please choose an option for: ${timeframe?.label ?? 'timeframe'}`)
      setInvalidField('timeframe')
      return
    }

    // Service, Address, ZIP, Timeframe, then a blank line, then the visitor's
    // own words. The order is fixed; see the note at the top of this file. With
    // no extra fields on, `message` is exactly what they typed, byte for byte.
    const labelled: string[] = []
    if (opts.serviceDropdown && service) labelled.push(`Service: ${service}`)
    if (wantsAddress && (street || city)) {
      // With an address, the ZIP belongs on the address line.
      const line = [street, [city, zip].filter(Boolean).join(' ')].filter(Boolean).join(', ')
      labelled.push(`Address: ${line}`)
    }
    // Only stands alone when there is no address line to carry it.
    if (wantsZip && zip && !wantsAddress) labelled.push(`ZIP: ${zip}`)
    if (timeframe && timeframeAnswer) labelled.push(`Timeframe: ${timeframeAnswer}`)
    const message = labelled.length > 0 ? `${labelled.join('\n')}\n\n${typed}` : typed

    setStatus('sending')
    try {
      const res = await fetch(CONTACT_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          phone,
          email: email || undefined,
          message,
          smsConsent,
          businessSlug: config.businessSlug,
          [HONEYPOT_FIELD]: honeypot,
        }),
      })
      // A fetch that RESOLVES is not a lead that landed. Before this check,
      // any response at all showed "Thanks, we received your message": a 500,
      // a 502 from the platform being down, or the 404 the endpoint returns
      // when businessSlug matches no Business row. In every one of those the
      // lead is gone and the visitor has been told it arrived, so they do not
      // call instead. A typo'd slug in site.config.ts lost 100% of a site's
      // leads with a thank-you on screen for each one.
      //
      // Only a 2xx may show the success state. Everything else falls through
      // to the error state, which puts the phone number on screen.
      if (!res.ok) {
        setStatus('error')
        return
      }
      setStatus('done')
    } catch {
      // Network failure, DNS failure, or a CORS preflight that never
      // completed. Same outcome for the visitor: call instead.
      setStatus('error')
    }
  }

  if (status === 'done') {
    return (
      <div className="rounded-[var(--radius)] border border-line bg-surface p-8 text-center" role="status">
        <h2 className="font-heading text-2xl font-bold text-primary-dark">Thanks, we received your message.</h2>
        <p className="mt-2 text-muted">
          Someone from {config.displayName} will follow up. If it is urgent, call{' '}
          <a href={`tel:${config.phone}`} className="font-semibold text-primary">
            {config.phoneDisplay}
          </a>
          .
        </p>
      </div>
    )
  }

  const field =
    'mt-1 w-full rounded-[var(--radius)] border border-line bg-surface px-3 py-2 text-base text-ink focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary-soft'

  /** Ties the one inline message to the field it is about. */
  const invalidProps = (name: string) =>
    invalidField === name ? { 'aria-invalid': true as const, 'aria-describedby': 'contact-validation' } : {}

  return (
    <form
      onSubmit={handleSubmit}
      data-endpoint={CONTACT_ENDPOINT}
      noValidate
      className="rounded-[var(--radius)] border border-line bg-surface p-6 sm:p-8"
    >
      <div hidden>
        <label htmlFor={`${HONEYPOT_FIELD}-input`}>Leave this field empty</label>
        <input id={`${HONEYPOT_FIELD}-input`} type="text" name={HONEYPOT_FIELD} autoComplete="off" tabIndex={-1} aria-hidden="true" defaultValue="" />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        {opts.splitName ? (
          <>
            <div>
              <label htmlFor="contact-first-name" className="text-sm font-semibold text-ink">
                First name
              </label>
              <input id="contact-first-name" name="firstName" type="text" required autoComplete="given-name" className={field} {...invalidProps('firstName')} />
            </div>
            <div>
              <label htmlFor="contact-last-name" className="text-sm font-semibold text-ink">
                Last name
              </label>
              <input id="contact-last-name" name="lastName" type="text" required autoComplete="family-name" className={field} {...invalidProps('lastName')} />
            </div>
          </>
        ) : (
          <div>
            <label htmlFor="contact-name" className="text-sm font-semibold text-ink">
              Name
            </label>
            <input id="contact-name" name="name" type="text" required autoComplete="name" className={field} {...invalidProps('name')} />
          </div>
        )}
        <div>
          <label htmlFor="contact-phone" className="text-sm font-semibold text-ink">
            Phone
          </label>
          <input id="contact-phone" name="phone" type="tel" required autoComplete="tel" className={field} {...invalidProps('phone')} />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="contact-email" className="text-sm font-semibold text-ink">
            Email {!opts.emailRequired && <span className="font-normal text-muted">(optional)</span>}
          </label>
          <input
            id="contact-email"
            name="email"
            type="email"
            required={opts.emailRequired}
            autoComplete="email"
            className={field}
            {...invalidProps('email')}
          />
        </div>

        {opts.serviceDropdown && (
          <div className="sm:col-span-2">
            <label htmlFor="contact-service" className="text-sm font-semibold text-ink">
              What do you need? <span className="font-normal text-muted">(optional)</span>
            </label>
            <select id="contact-service" name="service" defaultValue="" className={field}>
              <option value="">Choose one</option>
              {config.services.map((s) => (
                <option key={s.slug} value={s.name}>
                  {s.name}
                </option>
              ))}
              <option value={NOT_SURE}>{NOT_SURE}</option>
            </select>
          </div>
        )}

        {wantsAddress && (
          <>
            <div className="sm:col-span-2">
              <label htmlFor="contact-address-street" className="text-sm font-semibold text-ink">
                Street address {!addressRequired && <span className="font-normal text-muted">(optional)</span>}
              </label>
              <input
                id="contact-address-street"
                name="addressStreet"
                type="text"
                required={addressRequired}
                autoComplete="address-line1"
                className={field}
                {...invalidProps('addressStreet')}
              />
            </div>
            <div className={wantsZip ? '' : 'sm:col-span-2'}>
              <label htmlFor="contact-address-city" className="text-sm font-semibold text-ink">
                City {!addressRequired && <span className="font-normal text-muted">(optional)</span>}
              </label>
              <input
                id="contact-address-city"
                name="addressCity"
                type="text"
                required={addressRequired}
                autoComplete="address-level2"
                className={field}
                {...invalidProps('addressCity')}
              />
            </div>
            {wantsZip && (
              <div>
                <label htmlFor="contact-address-zip" className="text-sm font-semibold text-ink">
                  ZIP {!zipRequired && <span className="font-normal text-muted">(optional)</span>}
                </label>
                <input
                  id="contact-address-zip"
                  name="addressZip"
                  type="text"
                  required={zipRequired}
                  inputMode="numeric"
                  autoComplete="postal-code"
                  maxLength={10}
                  placeholder="62701"
                  className={field}
                  {...invalidProps('addressZip')}
                />
              </div>
            )}
          </>
        )}

        {/* Standalone ZIP: only when there is no address group to sit in. */}
        {wantsZip && !wantsAddress && (
          <div className="sm:col-span-2">
            <label htmlFor="contact-address-zip" className="text-sm font-semibold text-ink">
              ZIP code {!zipRequired && <span className="font-normal text-muted">(optional)</span>}
            </label>
            <input
              id="contact-address-zip"
              name="addressZip"
              type="text"
              required={zipRequired}
              inputMode="numeric"
              autoComplete="postal-code"
              maxLength={10}
              placeholder="92801"
              className={field}
              {...invalidProps('addressZip')}
            />
          </div>
        )}

        {timeframe && (
          <div className="sm:col-span-2">
            <label htmlFor="contact-timeframe" className="text-sm font-semibold text-ink">
              {timeframe.label} {!timeframeRequired && <span className="font-normal text-muted">(optional)</span>}
            </label>
            {/* Empty first option, so a required timeframe cannot be satisfied
                by leaving the select alone. */}
            <select
              id="contact-timeframe"
              name="timeframe"
              defaultValue=""
              required={timeframeRequired}
              className={field}
              {...invalidProps('timeframe')}
            >
              <option value="">Choose one</option>
              {timeframe.options.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="sm:col-span-2">
          <label htmlFor="contact-message" className="text-sm font-semibold text-ink">
            {opts.messageLabel}
          </label>
          <textarea
            id="contact-message"
            name="message"
            rows={4}
            className={field}
            {...(opts.messagePlaceholder ? { placeholder: opts.messagePlaceholder } : {})}
          />
        </div>
      </div>

      <label className="mt-5 flex items-start gap-3 text-sm text-muted">
        <input
          type="checkbox"
          name="smsConsent"
          checked={smsConsent}
          onChange={(e) => setSmsConsent(e.target.checked)}
          className="mt-1 h-4 w-4 shrink-0"
        />
        <span>
          Yes, {config.displayName} may text me about my request. Message and data rates may apply. Reply STOP to opt out at any time.
        </span>
      </label>

      {validation && (
        <p id="contact-validation" className="mt-4 text-sm font-semibold text-accent-dark" role="alert">
          {validation}
        </p>
      )}
      {status === 'error' && (
        <p className="mt-4 text-sm font-semibold text-accent-dark" role="alert">
          We could not send your message. Please call{' '}
          <a href={`tel:${config.phone}`} className="underline">
            {config.phoneDisplay}
          </a>
          .
        </p>
      )}

      <button
        type="submit"
        disabled={status === 'sending'}
        className="mt-6 w-full rounded-[var(--radius)] bg-accent px-6 py-3 text-base font-semibold text-on-accent hover:bg-accent-dark disabled:opacity-60 sm:w-auto"
      >
        {status === 'sending' ? 'Sending' : opts.submitLabel}
      </button>
    </form>
  )
}
