import type { Faq } from '@/lib/config-schema'

/**
 * Native <details> accordion, no JavaScript. The questions rendered here are the
 * same objects lib/schema.ts turns into FAQPage markup, so visible content and
 * schema cannot drift.
 */
export default function FaqAccordion({ faqs, heading = 'Frequently Asked Questions' }: { faqs: readonly Faq[]; heading?: string }) {
  if (faqs.length === 0) return null
  return (
    <section className="mx-auto max-w-page px-4 py-16 md:py-24 sm:px-6">
      <h2 className="font-heading text-3xl font-bold text-primary-dark">{heading}</h2>
      <div className="mt-6 divide-y divide-line rounded-site border border-line bg-surface">
        {faqs.map((f) => (
          <details key={f.q} className="group px-5 py-4">
            <summary className="cursor-pointer list-none font-semibold text-ink marker:content-none">
              <span className="flex items-center justify-between gap-4">
                {f.q}
                <span aria-hidden="true" className="text-primary transition group-open:rotate-45">
                  +
                </span>
              </span>
            </summary>
            <p className="mt-3 text-sm leading-relaxed text-muted">{f.a}</p>
          </details>
        ))}
      </div>
    </section>
  )
}
