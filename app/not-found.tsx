import type { Metadata } from 'next'
import Link from 'next/link'
import { config } from '@/lib/config'

export const metadata: Metadata = {
  title: { absolute: `Page Not Found | ${config.displayName}` },
  robots: { index: false, follow: false },
}

export default function NotFound() {
  return (
    <section className="mx-auto max-w-page px-4 py-24 text-center sm:px-6">
      <h1 className="font-heading text-4xl font-bold text-primary-dark">Page not found</h1>
      <p className="mt-4 text-muted">That page does not exist. Head back to the homepage or get in touch.</p>
      <div className="mt-8 flex justify-center gap-4">
        <Link href="/" className="rounded-site bg-primary px-5 py-2.5 font-semibold text-on-primary">
          Home
        </Link>
        <Link href="/contact" className="rounded-site border border-line px-5 py-2.5 font-semibold text-ink">
          Contact
        </Link>
      </div>
    </section>
  )
}
