import Image from 'next/image'
import Link from 'next/link'
import { config } from '@/lib/config'
import theme from '@/theme'
import Phone from './Phone'
import Wordmark from './Wordmark'

const NAV = [
  { href: '/', label: 'Home' },
  { href: '/services', label: 'Services' },
  { href: '/book', label: 'Book' },
  { href: '/gallery', label: 'Work' },
  { href: '/reviews', label: 'Reviews' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
]

/**
 * Light header. The dark utility strip stays on top with the hours line and
 * the email; the main bar is surface with a single hairline under it.
 *
 * The bar is light because the logo is drawn for white: its counters (the van
 * windows, the boat deck lines) are background, so on a dark bar they read as
 * holes. On white it reads as the client's actual printed logo.
 *
 * The hours line comes from config.hoursDisplay, the same single source the
 * footer and the contact page read. config.hours is NOT printed anywhere: it
 * mirrors the Google Business Profile for structured data only.
 */
export default function Header() {
  const logo = theme.logo
  return (
    <header className="sticky top-0 z-40">
      <div className="bg-primary-dark text-on-primary">
        <div className="mx-auto hidden max-w-page items-center justify-between gap-4 px-4 py-2 text-xs text-on-primary/70 sm:px-6 md:flex">
          {config.hoursDisplay && <span>{config.hoursDisplay}</span>}
          {config.email && (
            <a href={`mailto:${config.email}`} className="hover:text-on-primary">
              {config.email}
            </a>
          )}
        </div>
      </div>

      <div className="border-b border-line bg-surface">
        <div className="mx-auto flex max-w-page items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Link href="/" className="flex items-center" aria-label={`${config.displayName} home`}>
            {logo ? (
              // Height driven, width auto, so the aspect ratio is the file's
              // and the bar never shifts while it loads.
              <Image
                src={logo.src}
                alt={logo.alt}
                width={882}
                height={465}
                priority
                className="h-11 w-auto lg:h-14"
              />
            ) : (
              <Wordmark />
            )}
          </Link>

          <nav aria-label="Main" className="hidden items-center gap-7 md:flex">
            {NAV.map((item) => (
              <Link key={item.href} href={item.href} className="text-sm font-semibold text-ink hover:text-accent">
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <Phone className="hidden text-sm font-semibold text-ink lg:inline" />
            {/* Desktop only. On a phone the bar is already carrying a logo, a
                nav row and a booking button; a fourth element turns it into a
                list of things to ignore. */}
            {config.reviewRating !== null && config.combinedReviewLabel !== null && (
              <Link
                href="/reviews"
                className="hidden items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-xs font-semibold text-ink hover:border-accent lg:inline-flex"
              >
                <svg viewBox="0 0 24 24" width="13" height="13" fill="var(--c-star)" aria-hidden="true">
                  <path d="M12 2.6l2.94 5.96 6.58.96-4.76 4.64 1.12 6.55L12 17.62l-5.88 3.09 1.12-6.55L2.48 9.52l6.58-.96z" />
                </svg>
                {config.reviewRating.toFixed(1)}
                <span className="font-medium text-muted">{config.combinedReviewLabel} reviews</span>
              </Link>
            )}
            <Link
              href="/book"
              className="btn rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-on-accent hover:bg-accent-dark"
            >
              Book a Detail
            </Link>
          </div>
        </div>

        <nav
          aria-label="Main mobile"
          className="flex justify-center gap-5 overflow-x-auto border-t border-line px-4 py-2 md:hidden [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex-shrink-0 whitespace-nowrap text-sm font-semibold text-ink hover:text-accent"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  )
}
