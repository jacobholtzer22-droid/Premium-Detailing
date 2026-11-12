'use client'

import Link from 'next/link'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { BookingResponse, SlotDay, SlotWindow, SlotsResponse } from '@/lib/booking-types'

/**
 * The one lead hook, defined by the inline script in lib/track.ts. Optional
 * because it only exists when at least one ad platform id is configured, so
 * calling it must never be the thing that breaks a confirmed booking.
 */
declare global {
  interface Window {
    aaTrackLead?: (source: 'form' | 'booking') => void
  }
}

/**
 * The booking page: the package cards, and the inline flow that opens under
 * them.
 *
 * A CLIENT COMPONENT THAT IS GIVEN ITS FACTS. Every price, name, duration and
 * phone number arrives as a prop from the server page, so site.config.ts, the
 * Zod schema and lib/flyra.ts are not in this bundle and the Flyra key has no
 * path to a browser. The only things it fetches are its own two API routes.
 *
 * The flow is three steps on one page, no navigation: pick a time, fill in the
 * details, read the confirmation. A visitor who has decided to buy should not
 * be made to load another page to do it.
 *
 * NOTE ON LIVE REGIONS. Nothing in here uses role="status", and that is
 * deliberate: lib/track.ts watches `main [role="status"]` to detect the sealed
 * contact form's thank-you and fire the lead conversion, and that form is the
 * only thing on the site allowed to own that role. A loading message in here
 * wearing it would have counted "Loading open times..." as a lead. These
 * regions use aria-live="polite", which is what role="status" means anyway.
 * A confirmed booking fires its conversion explicitly, through aaTrackLead.
 *
 * Every failure here ends with the phone number. The one outcome worth
 * engineering against is a visitor who wanted to book, could not, and left
 * without knowing there was another way to reach the business.
 */

export interface BookableCardData {
  slug: string
  name: string
  priceFrom: number | null
  /** Pre-rendered, e.g. "$150" or "$1.50 per sq ft". */
  priceLabel: string | null
  priceNote: string | null
  /** "about 45 minutes". */
  durationLabel: string
  includes: readonly string[]
  /** The service page this package lives on. */
  href: string
}

export interface QuoteCardData {
  slug: string
  name: string
  priceLabel: string | null
  priceNote: string | null
  blurb: string
  href: string
  /** "Done at the shop", "We come to you", or null. */
  whereLabel: string | null
}

interface Props {
  bookable: BookableCardData[]
  quote: QuoteCardData[]
  phoneDisplay: string
  phoneHref: string
  defaultState: string
  /** The booking notes from config: deposit, text confirmation, card fee. */
  notes: readonly string[]
  /** False when online booking is switched off. Cards fall back to a quote CTA. */
  enabled: boolean
  honeypotField: string
}

type Step = 'time' | 'details' | 'done'

const EMPTY_FORM = {
  firstName: '',
  lastName: '',
  phone: '',
  email: '',
  address: '',
  unit: '',
  city: '',
  zip: '',
  vehicleYear: '',
  vehicleMake: '',
  vehicleModel: '',
  notes: '',
}

export default function BookingCards({
  bookable,
  quote,
  phoneDisplay,
  phoneHref,
  defaultState,
  notes,
  enabled,
  honeypotField,
}: Props) {
  const [selected, setSelected] = useState<string | null>(null)
  const [step, setStep] = useState<Step>('time')
  const [slots, setSlots] = useState<SlotsResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [loadError, setLoadError] = useState(false)
  const [activeDay, setActiveDay] = useState<string | null>(null)
  const [chosen, setChosen] = useState<SlotWindow | null>(null)
  const [form, setForm] = useState({ ...EMPTY_FORM })
  const [honeypot, setHoneypot] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [confirmed, setConfirmed] = useState<{ when: string; name: string } | null>(null)

  const startedAt = useRef(0)
  const panelRef = useRef<HTMLDivElement>(null)

  const selectedPackage = useMemo(() => bookable.find((p) => p.slug === selected) ?? null, [bookable, selected])

  // Preselect from ?package=, so a Book button on a service page or in the
  // package table lands here with the right package already open.
  //
  // Read off window.location rather than useSearchParams on purpose:
  // useSearchParams opts the whole route out of static rendering, and /book is
  // a prerendered page that the build gate reads as finished HTML.
  useEffect(() => {
    if (typeof window === 'undefined') return
    const wanted = new URLSearchParams(window.location.search).get('package')
    if (wanted && bookable.some((p) => p.slug === wanted)) setSelected(wanted)
  }, [bookable])

  const openPackage = useCallback((slug: string) => {
    setSelected(slug)
    setStep('time')
    setChosen(null)
    setSubmitError(null)
    // Let the panel render before scrolling to it.
    requestAnimationFrame(() => panelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
  }, [])

  // Load the open windows whenever the package changes.
  useEffect(() => {
    if (!selected) return
    let cancelled = false
    setLoading(true)
    setLoadError(false)
    setSlots(null)
    fetch(`/api/booking/slots?package=${encodeURIComponent(selected)}`, { headers: { accept: 'application/json' } })
      .then((res) => (res.ok ? (res.json() as Promise<SlotsResponse>) : Promise.reject(new Error(String(res.status)))))
      .then((data) => {
        if (cancelled) return
        setSlots(data)
        const firstWithSlots = data.days.find((d) => d.slots.length > 0)
        setActiveDay(firstWithSlots?.date ?? data.days[0]?.date ?? null)
      })
      .catch(() => {
        if (!cancelled) setLoadError(true)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [selected])

  const day: SlotDay | null = useMemo(
    () => slots?.days.find((d) => d.date === activeDay) ?? null,
    [slots, activeDay],
  )

  const anySlots = useMemo(() => Boolean(slots?.days.some((d) => d.slots.length > 0)), [slots])

  function chooseSlot(slot: SlotWindow) {
    setChosen(slot)
    setStep('details')
    startedAt.current = Date.now()
    setSubmitError(null)
    requestAnimationFrame(() => panelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!selectedPackage || !chosen || submitting) return
    setSubmitting(true)
    setSubmitError(null)
    try {
      const res = await fetch('/api/booking', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          packageSlug: selectedPackage.slug,
          slotStart: chosen.start,
          firstName: form.firstName,
          lastName: form.lastName,
          phone: form.phone,
          email: form.email,
          address: form.address,
          unit: form.unit,
          city: form.city,
          state: defaultState,
          zip: form.zip,
          vehicleYear: form.vehicleYear,
          vehicleMake: form.vehicleMake,
          vehicleModel: form.vehicleModel,
          notes: form.notes,
          [honeypotField]: honeypot,
          startedAt: startedAt.current,
        }),
      })
      const data = (await res.json()) as BookingResponse
      if (data.ok) {
        setConfirmed({ when: data.when, name: selectedPackage.name })
        setStep('done')
        // The same lead signal the contact form fires, through the one hook in
        // lib/track.ts. Only fires on a confirmed booking, never on a failure.
        window.aaTrackLead?.('booking')
        requestAnimationFrame(() => panelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
        return
      }
      setSubmitError(data.error)
      // The slot went while they were typing: send them back to pick again
      // with a fresh list rather than leaving them on a dead form.
      if (data.code === 'taken') {
        setStep('time')
        setChosen(null)
        setSelected((current) => current)
        const slug = selectedPackage.slug
        setSelected(null)
        requestAnimationFrame(() => setSelected(slug))
      }
    } catch {
      setSubmitError('That did not go through. Please call us and we will get you on the schedule.')
    } finally {
      setSubmitting(false)
    }
  }

  function field(key: keyof typeof EMPTY_FORM) {
    return {
      value: form[key],
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
        setForm((f) => ({ ...f, [key]: e.target.value })),
    }
  }

  return (
    <>
      <ul className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {bookable.map((c) => (
          <li key={c.slug} className="flex">
            <div className="lift flex h-full w-full flex-col rounded-site border border-line bg-surface p-6 shadow-site">
              <h3 className="font-heading text-xl font-bold text-primary-dark">
                <Link href={c.href} className="hover:text-accent">
                  {c.name}
                </Link>
              </h3>
              {c.priceLabel && (
                <p className="mt-4 font-heading text-3xl font-extrabold tabular-nums text-primary-dark">
                  From {c.priceLabel}
                </p>
              )}
              <p className="mt-1 text-sm text-muted">
                {c.durationLabel}
                {c.priceNote ? `. ${c.priceNote}` : ''}
              </p>
              <ul className="mt-5 flex-1 space-y-2 border-t border-line pt-5 text-base text-ink">
                {c.includes.map((line) => (
                  <li key={line} className="flex items-start gap-2.5">
                    <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-text" />
                    {line}
                  </li>
                ))}
              </ul>
              <div className="mt-6">
                {enabled ? (
                  <button
                    type="button"
                    onClick={() => openPackage(c.slug)}
                    aria-expanded={selected === c.slug}
                    className="btn inline-flex min-h-[44px] items-center rounded-site bg-accent px-5 py-3 text-sm font-semibold text-on-accent hover:bg-accent-dark"
                  >
                    {selected === c.slug ? 'Picking a time' : 'Book this package'}
                  </button>
                ) : (
                  <Link
                    href="/contact"
                    className="btn inline-flex min-h-[44px] items-center rounded-site border-2 border-primary-dark px-5 py-3 text-sm font-semibold text-primary-dark hover:bg-primary-dark hover:text-on-primary"
                  >
                    Get a quote
                  </Link>
                )}
              </div>
            </div>
          </li>
        ))}

        {quote.map((c) => (
          <li key={c.slug} className="flex">
            <div className="lift flex h-full w-full flex-col rounded-site border border-line bg-surface p-6 shadow-site">
              <h3 className="font-heading text-xl font-bold text-primary-dark">
                <Link href={c.href} className="hover:text-accent">
                  {c.name}
                </Link>
              </h3>
              {c.priceLabel && (
                <p className="mt-4 font-heading text-3xl font-extrabold tabular-nums text-primary-dark">
                  From {c.priceLabel}
                </p>
              )}
              {c.priceNote && <p className="mt-1 text-sm text-muted">{c.priceNote}</p>}
              <p className="mt-4 flex-1 text-base leading-relaxed text-ink">{c.blurb}</p>
              {c.whereLabel && <p className="mt-3 text-sm font-medium text-blue-text">{c.whereLabel}</p>}
              <div className="mt-6">
                <Link
                  href={`/contact?service=${encodeURIComponent(c.slug)}`}
                  className="btn inline-flex min-h-[44px] items-center rounded-site border-2 border-primary-dark px-5 py-3 text-sm font-semibold text-primary-dark hover:bg-primary-dark hover:text-on-primary"
                >
                  Request a quote
                </Link>
              </div>
            </div>
          </li>
        ))}
      </ul>

      {/* The inline flow. Nothing renders here until a package is chosen. */}
      <div ref={panelRef} id="book-now" className="scroll-mt-28">
        {selectedPackage && (
          <section
            aria-label={`Book the ${selectedPackage.name}`}
            className="mt-12 rounded-site border-2 border-primary-dark bg-surface p-5 sm:p-8"
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-text">
                  {step === 'done' ? 'Booked' : `Booking the ${selectedPackage.name}`}
                </p>
                <h3 className="mt-2 font-heading text-2xl font-bold text-primary-dark">
                  {step === 'time' && 'Pick a time'}
                  {step === 'details' && 'Where are we going, and what are we detailing?'}
                  {step === 'done' && 'You are on the schedule'}
                </h3>
              </div>
              {step !== 'done' && (
                <button
                  type="button"
                  onClick={() => setSelected(null)}
                  className="min-h-[44px] rounded-site px-3 text-sm font-semibold text-muted underline-offset-4 hover:text-primary-dark hover:underline"
                >
                  Cancel
                </button>
              )}
            </div>

            {step === 'time' && (
              <div className="mt-6">
                {loading && (
                  <p aria-live="polite" className="text-base text-muted">
                    Loading open times...
                  </p>
                )}

                {!loading && (loadError || slots?.available === false) && (
                  <CallUs phoneDisplay={phoneDisplay} phoneHref={phoneHref}>
                    We cannot load the calendar right now.
                  </CallUs>
                )}

                {!loading && !loadError && slots?.available && !anySlots && (
                  <CallUs phoneDisplay={phoneDisplay} phoneHref={phoneHref}>
                    No open times this week.
                  </CallUs>
                )}

                {!loading && !loadError && slots?.available && anySlots && (
                  <>
                    <p className="text-sm text-muted">
                      All times are {slots.timezoneLabel}. The {selectedPackage.name} takes{' '}
                      {slots.durationLabel}.
                    </p>

                    <div
                      role="tablist"
                      aria-label="Choose a day"
                      className="no-scrollbar mt-5 flex gap-2.5 overflow-x-auto pb-1"
                    >
                      {slots.days.map((d) => {
                        const isActive = d.date === activeDay
                        const open = d.slots.length > 0
                        return (
                          <button
                            key={d.date}
                            type="button"
                            role="tab"
                            aria-selected={isActive}
                            disabled={!open}
                            onClick={() => setActiveDay(d.date)}
                            className={[
                              // 'relative' contains the sr-only span below: Tailwind's sr-only is
                              // absolutely positioned, and with no positioned ancestor it anchored to
                              // the page and pushed the document 3px wider than the phone viewport.
                              'relative min-h-[44px] flex-shrink-0 whitespace-nowrap rounded-site border px-4 py-2.5 text-sm font-semibold',
                              isActive
                                ? 'border-accent bg-accent text-on-accent'
                                : open
                                  ? 'border-line bg-bg text-primary-dark hover:border-primary-dark'
                                  : 'cursor-not-allowed border-line bg-bg text-muted opacity-50',
                            ].join(' ')}
                          >
                            {d.label}
                            {!open && <span className="sr-only"> (nothing open)</span>}
                          </button>
                        )
                      })}
                    </div>

                    <div className="mt-6">
                      {day && day.slots.length > 0 ? (
                        <ul aria-label={`Open times on ${day.label}`} className="flex flex-wrap gap-2.5">
                          {day.slots.map((slot) => (
                            <li key={slot.start}>
                              <button
                                type="button"
                                onClick={() => chooseSlot(slot)}
                                className="btn min-h-[44px] rounded-site border-2 border-primary-dark bg-bg px-5 py-2.5 text-base font-semibold tabular-nums text-primary-dark hover:bg-primary-dark hover:text-on-primary"
                              >
                                {slot.label}
                              </button>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-base text-muted">
                          Nothing open on that day. Try another, or call{' '}
                          <a href={phoneHref} className="font-semibold text-accent underline-offset-4 hover:underline">
                            {phoneDisplay}
                          </a>
                          .
                        </p>
                      )}
                    </div>
                  </>
                )}
              </div>
            )}

            {step === 'details' && chosen && (
              <form onSubmit={submit} className="mt-6">
                <p className="rounded-site bg-primary-soft px-4 py-3 text-base font-semibold text-primary-dark">
                  {selectedPackage.name}, {chosen.label}
                  {slots ? ` ${slots.timezoneLabel}` : ''}
                  {day ? ` on ${day.label}` : ''}
                  <button
                    type="button"
                    onClick={() => {
                      setStep('time')
                      setChosen(null)
                    }}
                    className="ml-3 text-sm font-semibold text-accent underline-offset-4 hover:underline"
                  >
                    Change
                  </button>
                </p>

                <fieldset className="mt-6">
                  <legend className="font-heading text-lg font-bold text-primary-dark">Your details</legend>
                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <Field id="bk-first" label="First name" required {...field('firstName')} autoComplete="given-name" />
                    <Field id="bk-last" label="Last name" required {...field('lastName')} autoComplete="family-name" />
                    <Field
                      id="bk-phone"
                      label="Mobile number"
                      required
                      type="tel"
                      inputMode="tel"
                      hint="We text your confirmation here."
                      autoComplete="tel"
                      {...field('phone')}
                    />
                    <Field
                      id="bk-email"
                      label="Email"
                      type="email"
                      autoComplete="email"
                      {...field('email')}
                    />
                  </div>
                </fieldset>

                <fieldset className="mt-8">
                  <legend className="font-heading text-lg font-bold text-primary-dark">Where we are coming</legend>
                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <Field
                      id="bk-address"
                      label="Street address"
                      required
                      className="sm:col-span-2"
                      autoComplete="address-line1"
                      {...field('address')}
                    />
                    <Field
                      id="bk-unit"
                      label="Unit or apartment"
                      autoComplete="address-line2"
                      {...field('unit')}
                    />
                    <Field id="bk-city" label="City" required autoComplete="address-level2" {...field('city')} />
                    <Field
                      id="bk-zip"
                      label="ZIP code"
                      required
                      inputMode="numeric"
                      autoComplete="postal-code"
                      {...field('zip')}
                    />
                  </div>
                </fieldset>

                <fieldset className="mt-8">
                  <legend className="font-heading text-lg font-bold text-primary-dark">The vehicle</legend>
                  <div className="mt-4 grid gap-4 sm:grid-cols-3">
                    <Field
                      id="bk-year"
                      label="Year"
                      required
                      inputMode="numeric"
                      placeholder="2021"
                      {...field('vehicleYear')}
                    />
                    <Field id="bk-make" label="Make" required placeholder="Toyota" {...field('vehicleMake')} />
                    <Field id="bk-model" label="Model" required placeholder="Tacoma" {...field('vehicleModel')} />
                  </div>
                  <div className="mt-4">
                    <label htmlFor="bk-notes" className="block text-sm font-semibold text-ink">
                      Anything we should know <span className="font-normal text-muted">(optional)</span>
                    </label>
                    <p id="bk-notes-hint" className="mt-1 text-sm text-muted">
                      Pet hair, a spill, where to park, a gate code.
                    </p>
                    <textarea
                      id="bk-notes"
                      aria-describedby="bk-notes-hint"
                      rows={3}
                      className="mt-2 w-full rounded-site border border-line bg-bg px-3 py-2.5 text-base text-ink focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent"
                      {...field('notes')}
                    />
                  </div>
                </fieldset>

                {/* Honeypot. Hidden from everyone who is not a bot. */}
                <div hidden aria-hidden="true">
                  <label htmlFor="bk-hp">Do not fill this in</label>
                  <input
                    id="bk-hp"
                    name={honeypotField}
                    tabIndex={-1}
                    autoComplete="off"
                    value={honeypot}
                    onChange={(e) => setHoneypot(e.target.value)}
                  />
                </div>

                {submitError && (
                  <p role="alert" className="mt-6 rounded-site border border-accent bg-primary-soft px-4 py-3 text-base text-primary-dark">
                    {submitError} You can always call{' '}
                    <a href={phoneHref} className="font-semibold text-accent underline-offset-4 hover:underline">
                      {phoneDisplay}
                    </a>
                    .
                  </p>
                )}

                <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn min-h-[44px] rounded-site bg-accent px-7 py-3.5 text-base font-semibold text-on-accent hover:bg-accent-dark disabled:opacity-60"
                  >
                    {submitting ? 'Booking...' : 'Confirm this booking'}
                  </button>
                  <span className="text-sm text-muted">{notes.join(' ')}</span>
                </div>
              </form>
            )}

            {step === 'done' && confirmed && (
              <div aria-live="polite" className="mt-6">
                <p className="font-heading text-xl font-bold text-primary-dark">
                  {confirmed.name}, {confirmed.when}.
                </p>
                <p className="mt-3 max-w-2xl text-base leading-relaxed text-ink">
                  You will get a text confirming the appointment. If anything changes, call{' '}
                  <a href={phoneHref} className="font-semibold text-accent underline-offset-4 hover:underline">
                    {phoneDisplay}
                  </a>{' '}
                  and we will move it.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSelected(null)
                    setStep('time')
                    setChosen(null)
                    setConfirmed(null)
                    setForm({ ...EMPTY_FORM })
                  }}
                  className="btn mt-6 min-h-[44px] rounded-site border-2 border-primary-dark px-5 py-3 text-sm font-semibold text-primary-dark hover:bg-primary-dark hover:text-on-primary"
                >
                  Book another vehicle
                </button>
              </div>
            )}
          </section>
        )}
      </div>
    </>
  )
}

function CallUs({
  children,
  phoneDisplay,
  phoneHref,
}: {
  children: React.ReactNode
  phoneDisplay: string
  phoneHref: string
}) {
  return (
    <div aria-live="polite" className="rounded-site border border-line bg-bg px-5 py-6">
      <p className="text-base text-ink">{children} Call us and we will find you a time.</p>
      <a
        href={phoneHref}
        className="btn mt-4 inline-flex min-h-[44px] items-center rounded-site bg-accent px-6 py-3 text-base font-semibold text-on-accent hover:bg-accent-dark"
      >
        Call {phoneDisplay}
      </a>
    </div>
  )
}

interface FieldProps {
  id: string
  label: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
  required?: boolean
  type?: string
  inputMode?: 'tel' | 'numeric' | 'text' | 'email'
  hint?: string
  placeholder?: string
  autoComplete?: string
  className?: string
}

function Field({
  id,
  label,
  value,
  onChange,
  required = false,
  type = 'text',
  inputMode,
  hint,
  placeholder,
  autoComplete,
  className = '',
}: FieldProps) {
  const hintId = hint ? `${id}-hint` : undefined
  return (
    <div className={className}>
      <label htmlFor={id} className="block text-sm font-semibold text-ink">
        {label}
        {!required && <span className="font-normal text-muted"> (optional)</span>}
      </label>
      {hint && (
        <p id={hintId} className="mt-1 text-sm text-muted">
          {hint}
        </p>
      )}
      <input
        id={id}
        type={type}
        required={required}
        value={value}
        onChange={onChange}
        {...(inputMode ? { inputMode } : {})}
        {...(placeholder ? { placeholder } : {})}
        {...(autoComplete ? { autoComplete } : {})}
        {...(hintId ? { 'aria-describedby': hintId } : {})}
        className="mt-2 min-h-[44px] w-full rounded-site border border-line bg-bg px-3 py-2.5 text-base text-ink focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent"
      />
    </div>
  )
}
