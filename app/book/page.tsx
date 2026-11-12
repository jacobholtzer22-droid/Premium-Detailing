import type { Metadata } from 'next'
import Link from 'next/link'
import AddOnTable from '@/components/AddOnTable'
import BookingCards from '@/components/BookingCards'
import type { BookableCardData, QuoteCardData } from '@/components/BookingCards'
import BrandMark from '@/components/BrandMark'
import CtaBand from '@/components/CtaBand'
import Phone from '@/components/Phone'
import Specials from '@/components/Specials'
import { HONEYPOT_FIELD, bookablePackages, bookingEnabled, config, formatDuration, getService, priceLabel } from '@/lib/config'
import { buildMetadata } from '@/lib/seo'

const DESCRIPTION =
  'Book a mobile detailing package in Port St. Lucie and pick your own time, or request a quote for ceramic coating, paint protection film, correction or tint.'

export const metadata: Metadata = buildMetadata({
  kind: 'other',
  path: '/book',
  title: `Book a Detail in ${config.primaryCity}`,
  description: DESCRIPTION,
}).metadata

/**
 * The booking page.
 *
 * This is the ONE place on the site that renders a dollar sign for every
 * service at once, and every figure comes from config: either a service's
 * priceFrom or a tier's. No price is ever typed into content.
 *
 * The cards split two ways rather than being flattened into one list:
 *
 *   bookable  one card per package that can actually be booked online, each
 *             opening the inline flow. Today that is Bronze, Silver and Gold.
 *   quote     one card per service that is priced per vehicle, including the
 *             ones that have their own price ladder. Ceramic coating has three
 *             packages and shows as ONE card here reading "From $900", because
 *             which of the three a car needs is decided at the paint
 *             evaluation and three cards would ask a visitor to make that call
 *             themselves on the strength of a price.
 *
 * Everything below the cards is server-rendered. Only the cards and the flow
 * are a client component, and it is handed its facts as props so site.config.ts
 * and lib/flyra.ts stay out of the browser bundle.
 */
function bookableCards(): BookableCardData[] {
  return bookablePackages().map((p) => ({
    slug: p.slug,
    name: p.name,
    priceFrom: p.priceFrom,
    priceLabel: p.priceFrom === null ? null : priceLabel(p.priceFrom),
    priceNote: p.priceNote,
    durationLabel: `Takes ${formatDuration(p.durationMinutes)}`,
    includes: p.includes,
    href: p.anchor ? `/services/${p.serviceSlug}#${p.anchor}` : `/services/${p.serviceSlug}`,
  }))
}

const WHERE_LABEL = {
  mobile: 'We come to you',
  shop: 'Done at the shop',
  property: 'Done at your property',
} as const

function quoteCards(): QuoteCardData[] {
  const bookableServiceSlugs = new Set(bookablePackages().map((p) => p.serviceSlug))
  return config.services
    .filter((s) => !bookableServiceSlugs.has(s.slug))
    .map((s) => ({
      slug: s.slug,
      name: s.name,
      priceLabel: s.priceFrom === null ? null : priceLabel(s.priceFrom, s.priceUnit),
      priceNote: s.priceNote,
      blurb: s.shortDescription,
      href: `/services/${s.slug}`,
      whereLabel: s.where ? WHERE_LABEL[s.where] : null,
    }))
}

export default function BookPage() {
  const detailing = getService('mobile-detailing')
  const notes = config.booking?.notes ?? []
  const canBook = bookingEnabled()

  return (
    <>
      <section className="bg-primary-dark text-on-primary">
        <div className="mx-auto max-w-page px-4 py-16 sm:px-6 md:py-20">
          <p className="mb-4 flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.2em] text-blue">
            <BrandMark size={40} />
            {config.displayName}
          </p>
          <h1 className="font-heading text-hero font-extrabold">Book a Detail</h1>
          <p className="mt-5 max-w-2xl text-lg text-on-primary/85">
            The detailing packages come to you and can be booked straight from here, with the time you pick held for
            you. Coating, film, correction and tint are done at the shop and priced per vehicle, so those take a quote
            request instead.
          </p>
          {/*
            The three things a visitor wants to know before they put their
            details into a form, straight from config.booking.notes. This
            replaced "Nothing to pay when you book" and a promise of an email
            confirmation: the first was ambiguous about the card fee and the
            second was not true, because Flyra sends a text.
          */}
          {notes.length > 0 && (
            <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-base text-on-primary/85">
              {notes.map((note) => (
                <li key={note} className="flex items-start gap-2.5">
                  <span aria-hidden="true" className="mt-2.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue" />
                  {note}
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-page px-4 py-16 sm:px-6 md:py-24">
        <BookingCards
          bookable={bookableCards()}
          quote={quoteCards()}
          phoneDisplay={config.phoneDisplay}
          phoneHref={`tel:${config.phone}`}
          defaultState={config.primaryState}
          notes={notes}
          enabled={canBook}
          honeypotField={HONEYPOT_FIELD}
        />

        {detailing && detailing.addOns.length > 0 && (
          <div className="mt-14 border-t border-line pt-10">
            <AddOnTable
              compact
              addOns={detailing.addOns}
              heading="Add-ons for any package"
              intro="Tell us what you want in the notes when you book and it goes on the job."
            />
          </div>
        )}

        <div className="mt-14 border-t border-line pt-10">
          <h2 className="font-heading text-2xl font-bold text-primary-dark">Not sure which package?</h2>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted">
            Tell us the year, make and model and what is bothering you about the vehicle, and we will point you at the
            right one. Or call and we will work it out on the phone.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
            <Link
              href="/contact"
              className="btn inline-flex min-h-[44px] items-center rounded-site bg-accent px-6 py-3.5 text-base font-semibold text-on-accent hover:bg-accent-dark"
            >
              Get a Quote
            </Link>
            <span className="text-base text-ink">
              or call <Phone className="font-semibold text-primary-dark" />
            </span>
          </div>
        </div>
      </section>

      <Specials />

      <CtaBand />
    </>
  )
}
