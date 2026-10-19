import Link from 'next/link'
import { config } from '@/lib/config'
import theme from '@/theme'
import Phone from './Phone'
import Wordmark from './Wordmark'

const NAV = [
  { href: '/', label: 'Home' },
  { href: '/services', label: 'Services' },
  { href: '/book', label: 'Book' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
]

/**
 * Dark header. A slim utility bar carries the hours line and the email, then
 * the main bar carries the wordmark, the nav, the phone and one accent button.
 *
 * The hours line comes from config.hoursDisplay, the same single source the
 * footer and the contact page read. config.hours is NOT printed anywhere: it
 * mirrors the Google Business Profile for structured data only.
 */

export default function Header() {
  const logo = theme.logo
  return (
    <header className="sticky top-0 z-40 bg-primary-dark text-on-primary">
      <div className="hidden border-b border-white/10 md:block">
        <div className="mx-auto flex max-w-page items-center justify-between gap-4 px-4 py-2 text-xs text-on-primary/70 sm:px-6">
          {config.hoursDisplay && <span>{config.hoursDisplay}</span>}
          {config.email && (
            <a href={`mailto:${config.email}`} className="hover:text-on-primary">
              {config.email}
            </a>
          )}
        </div>
      </div>

      <div className="mx-auto flex max-w-page items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center" aria-label={`${config.displayName} home`}>
          {logo ? (
            // Not run through the image pipeline on purpose: a wordmark must
            // not be re-encoded. Fixed height, width auto, so it never shifts.
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logo.src} alt={logo.alt} className="h-10 w-auto md:h-12" width={375} height={194} />
          ) : (
            <Wordmark />
          )}
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-7 md:flex">
          {NAV.map((item) => (
            <Link key={item.href} href={item.href} className="text-sm font-semibold text-on-primary/85 hover:text-on-primary">
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Phone className="hidden text-sm font-semibold text-on-primary lg:inline" />
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
        className="flex justify-center gap-5 overflow-x-auto border-t border-white/10 px-4 py-2 md:hidden [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex-shrink-0 whitespace-nowrap text-sm font-semibold text-on-primary/85 hover:text-on-primary"
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </header>
  )
}
