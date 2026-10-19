import { config } from '@/lib/config'

/**
 * The only way a phone number appears on the site. Renders the derived display
 * form inside a tel: link built from the E.164 value, so no number is ever
 * typed into prose or markup.
 */
export default function Phone({ className = '', label }: { className?: string; label?: string }) {
  return (
    <a href={`tel:${config.phone}`} className={`whitespace-nowrap font-semibold underline-offset-2 hover:underline ${className}`}>
      {label ?? config.phoneDisplay}
    </a>
  )
}
