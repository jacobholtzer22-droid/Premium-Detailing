/**
 * Visual theme. This is the one file (with app/fonts.ts) where the agent has
 * real freedom: pick a direction, a palette, and a hero layout so two client
 * sites do not look like the same site with different words. No business facts
 * belong here.
 *
 * Rules the palette must satisfy (AGENT.md Phase 2c): one dark neutral, one
 * warm or cool off-white, exactly one accent used on under 5% of any page. No
 * pure #000000 or #FFFFFF. `onPrimary` sits on `primary`, `onAccent` on
 * `accent`, `ink` on `bg` and `surface`. One radius and one shadow for the
 * whole site; components read them as CSS variables and nothing else.
 */
export type HeroVariant = 'full-bleed' | 'split'

export interface Theme {
  palette: {
    /** The dark neutral. Also the full-dark section background. */
    primary: string
    primaryDark: string
    primarySoft: string
    /** The single accent. Buttons, the call bar, small marks. Under 5% of any page. */
    accent: string
    accentDark: string
    /** The off-white page ground. */
    bg: string
    surface: string
    /** Body text. Never pure black. */
    ink: string
    muted: string
    line: string
    onPrimary: string
    onAccent: string
  }
  /**
   * 'full-bleed': client photo behind a dark scrim, headline and phone CTA
   * left-aligned in the lower third. Needs a photo that can carry it.
   * 'split': large photo one side, oversized type the other. For weaker photos.
   */
  heroVariant: HeroVariant
  /**
   * Wordmark image for the header, or null to set the name as type.
   *
   * null here for a reason: the only logo file that exists is 375x194, which
   * is soft at header height even at 2x. The header sets the name instead and
   * the real logo runs full size in the footer, where it has the width to
   * hold up.
   */
  logo: { src: string; alt: string } | null
  /** The ONE corner radius for the site, in rem. 0 for hard edges. */
  radius: number
  /** The ONE shadow for the site, as a CSS box-shadow value. 'none' is valid. */
  shadow: string
}

/**
 * Direction: "Showroom". Near-black navy carries the header, footer and CTA
 * band; content alternates off-white and white so the photography is the only
 * thing that is ever loud. The accent is sampled from the client's own logo
 * wordmark (#E81820) and darkened to #D1232A so white sits on it at 5.27:1.
 * The logo's cyan stays inside the logo and appears nowhere else on the site.
 */
const theme: Theme = {
  palette: {
    primary: '#0C1220',
    primaryDark: '#070B14',
    primarySoft: '#EDF0F5',
    accent: '#D1232A',
    accentDark: '#A41B21',
    bg: '#F5F6F8',
    surface: '#FFFFFF',
    ink: '#121720',
    muted: '#5D6676',
    line: '#E2E5EA',
    onPrimary: '#F6F7F9',
    onAccent: '#FFFFFF',
  },
  heroVariant: 'full-bleed',
  logo: null,
  radius: 0.75,
  shadow: '0 1px 2px rgb(12 18 32 / 0.08), 0 8px 24px rgb(12 18 32 / 0.06)',
}

export default theme
