import Link from 'next/link'
import { config } from '@/lib/config'
import Phone from './Phone'

/** The full-dark closing band. Two CTAs: book a time, or ask for a quote. */
export default function CtaBand({ heading }: { heading?: string }) {
  return (
    <section className="bg-primary text-on-primary">
      <div className="mx-auto flex max-w-page flex-col items-start justify-between gap-8 px-4 py-16 sm:px-6 md:flex-row md:items-center md:py-24">
        <div>
          <h2 className="font-heading text-3xl font-bold md:text-4xl">
            {heading ?? `Ready to get started in ${config.primaryCity}?`}
          </h2>
          <p className="mt-3 text-base text-on-primary/80 md:text-lg">
            Call <Phone className="font-semibold text-on-primary" /> or send a message and we will get back to you with a quote.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/book"
            className="btn rounded-site bg-accent px-6 py-3.5 text-base font-semibold text-on-accent hover:bg-accent-dark"
          >
            Book a Detail
          </Link>
          <Link
            href="/contact"
            className="btn rounded-site border-2 border-on-primary/40 px-6 py-3.5 text-base font-semibold text-on-primary hover:border-on-primary"
          >
            Get a Quote
          </Link>
        </div>
      </div>
    </section>
  )
}
