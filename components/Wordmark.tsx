import { config } from '@/lib/config'

/**
 * The header wordmark, set as type. FALLBACK ONLY: it renders when
 * theme.logo is null. The header bar is light, so the two lines are ink and
 * accent, both of which clear 4.5:1 on surface.
 *
 * The name is split on its first space so the two halves stack, which is what
 * gives a plain text name the weight to sit beside a photograph. Nothing is
 * typed here: both lines come from config.displayName, so a rename reaches the
 * header automatically. A one-word name renders as a single line.
 */
export default function Wordmark() {
  const name = config.displayName.trim()
  const space = name.indexOf(' ')
  const top = space === -1 ? name : name.slice(0, space)
  const bottom = space === -1 ? '' : name.slice(space + 1)

  return (
    <span className="flex flex-col leading-none">
      <span
        className="font-heading font-extrabold uppercase text-ink"
        style={{ fontSize: '1.25rem', letterSpacing: '0.18em' }}
      >
        {top}
      </span>
      {bottom && (
        <span
          className="mt-1 font-heading font-semibold uppercase text-accent"
          style={{ fontSize: '0.65rem', letterSpacing: '0.32em' }}
        >
          {bottom}
        </span>
      )}
    </span>
  )
}
