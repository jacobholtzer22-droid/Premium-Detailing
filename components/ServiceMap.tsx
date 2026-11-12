import { addressLine, config } from '@/lib/config'

/**
 * The shop on a map, plus a directions link.
 *
 * Keyless: the embed uses Google's `/maps?output=embed` form, which needs no
 * API key, no billing account and no key rotation when somebody leaves. A
 * keyed Maps JavaScript embed would put a billable, rate-limited credential in
 * the page source of a static site.
 *
 * `loading="lazy"` on purpose. This renders on the contact page and on every
 * shop service page, which are pages a visitor reaches with intent; the map is
 * below the fold on all of them, and an iframe to a third party is not
 * something to put in front of the first paint.
 *
 * The directions link is the part that actually gets used, so it is a real
 * button rather than a line of text under the map. `dir/?api=1` is Google's
 * documented, stable form and opens the native app on a phone.
 */
export default function ServiceMap({ className = '' }: { className?: string }) {
  const line = addressLine()
  if (!line || !config.address) return null

  const query = encodeURIComponent(line)
  const embed = `https://www.google.com/maps?q=${query}&output=embed`
  const directions = `https://www.google.com/maps/dir/?api=1&destination=${query}`

  return (
    <div className={className}>
      <div className="overflow-hidden rounded-site border border-line">
        <iframe
          title={`Map showing ${config.displayName} at ${line}`}
          src={embed}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="block h-64 w-full border-0 sm:h-72"
        />
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2">
        <a
          href={directions}
          target="_blank"
          rel="noopener noreferrer"
          className="btn inline-flex min-h-[44px] items-center rounded-site border-2 border-primary-dark px-5 py-3 text-sm font-semibold text-primary-dark hover:bg-primary-dark hover:text-on-primary"
        >
          Get directions
        </a>
        <address className="not-italic text-sm text-muted">
          {config.address.street}, {config.address.city}, {config.address.state} {config.address.zip}
        </address>
      </div>
    </div>
  )
}
