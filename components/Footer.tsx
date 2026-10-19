import Image from 'next/image'
import Link from 'next/link'
import { config, formatTime } from '@/lib/config'
import Phone from './Phone'

const PROFILE_LABELS: Record<string, string> = {
  gbp: 'Google',
  facebook: 'Facebook',
  instagram: 'Instagram',
  yelp: 'Yelp',
  tiktok: 'TikTok',
}

export default function Footer() {
  const year = new Date().getFullYear()
  const profiles = Object.entries(config.profiles).filter((e): e is [string, string] => typeof e[1] === 'string')

  return (
    <footer className="mt-16 border-t border-line bg-primary-dark text-on-primary">
      <div className="mx-auto grid max-w-page gap-10 px-4 py-12 sm:px-6 md:grid-cols-4">
        <div>
          {/* The full logo runs here rather than in the header: it is a small
              file, and the footer is the one place it has the width to read.
              On a white chip because the artwork is drawn for light ground. */}
          <span className="mb-5 inline-block rounded-site bg-white p-3">
            <Image
              src="/brand/logo.png"
              alt={`${config.displayName} logo`}
              width={882}
              height={465}
              className="block h-auto w-[220px]"
            />
          </span>
          <p className="font-heading text-lg font-bold">{config.displayName}</p>
          <p className="mt-2 text-sm opacity-80">{config.tagline}</p>
          <p className="mt-4 text-sm">
            <Phone className="text-on-primary" />
          </p>
          {config.email && (
            <p className="mt-1 text-sm">
              <a href={`mailto:${config.email}`} className="underline-offset-2 hover:underline">
                {config.email}
              </a>
            </p>
          )}
          {config.address && (
            <address className="mt-3 text-sm not-italic opacity-80">
              {config.address.street}
              <br />
              {config.address.city}, {config.address.state} {config.address.zip}
            </address>
          )}
        </div>

        <div>
          <p className="text-sm font-semibold uppercase tracking-wide opacity-70">Services</p>
          <ul className="mt-3 space-y-2 text-sm">
            {config.services.map((s) => (
              <li key={s.slug}>
                <Link href={`/services/${s.slug}`} className="hover:underline">
                  {s.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-sm font-semibold uppercase tracking-wide opacity-70">Service Areas</p>
          <ul className="mt-3 space-y-2 text-sm">
            {config.serviceAreas.map((a) => (
              <li key={a.slug}>
                <Link href={`/areas/${a.slug}`} className="hover:underline">
                  {a.name}, {config.primaryState}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          {(config.hoursDisplay || config.hours) && (
            <>
              <p className="text-sm font-semibold uppercase tracking-wide opacity-70">Hours</p>
              {/* hoursDisplay wins when set; config.hours still feeds schema. */}
              {config.hoursDisplay ? (
                <p className="mt-3 text-sm">{config.hoursDisplay}</p>
              ) : (
                <ul className="mt-3 space-y-1 text-sm">
                  {config.hours?.map((h) => (
                    <li key={h.day} className="flex justify-between gap-4">
                      <span>{h.day}</span>
                      <span>
                        {formatTime(h.open)} to {formatTime(h.close)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
          {profiles.length > 0 && (
            <ul className="mt-6 flex flex-wrap gap-4 text-sm">
              {profiles.map(([key, url]) => (
                <li key={key}>
                  <a href={url} rel="noopener" target="_blank" className="underline-offset-2 hover:underline">
                    {PROFILE_LABELS[key] ?? key}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-page flex-wrap items-center justify-between gap-2 px-4 py-4 text-xs opacity-70 sm:px-6">
          <p>
            &copy; {year} {config.legalName}. All rights reserved.
          </p>
          <p className="flex gap-4">
            <Link href="/privacy-policy" className="hover:underline">
              Privacy Policy
            </Link>
            <a href="https://www.alignandacquire.com" rel="noopener" target="_blank" className="hover:underline">
              Site by Align and Acquire
            </a>
          </p>
        </div>
      </div>
    </footer>
  )
}
