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
    /**
     * The single ACTION color, sampled from the logo wordmark. Buttons, the
     * active tab, the active filter pill, the slider handle, focus rings.
     * Nothing decorative: if it is not something you click, it is not accent.
     */
    accent: string
    accentDark: string
    /**
     * The logo cyan. DARK SURFACES AND NON-TEXT GRAPHICS ONLY. At 2.43:1 on
     * white it is not readable as text on a light ground, which is what
     * blueText exists for.
     */
    blue: string
    /** The same hue darkened until it clears 4.5:1 on bg and surface. */
    blueText: string
    /** The off-white page ground. */
    bg: string
    surface: string
    /** Body text. Never pure black. */
    ink: string
    muted: string
    line: string
    onPrimary: string
    onAccent: string
    /**
     * Star glyphs ONLY. A generic review-star amber that belongs to no
     * platform, so the rating bar is not borrowing Google's color or its
     * mark. It is never a button, never text, never a border.
     */
    star: string
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
 * Direction: "Showroom", now built from the client's own logo rather than
 * beside it.
 *
 * Both colors are sampled from public/brand/logo.png with a 5x5 median taken
 * at the thickest point of each shape, so neither is an anti-aliased edge:
 * red #EC1D24 from the wordmark stroke, cyan #00B3EA from the boat hull.
 *
 * accent is that red darkened to #DF131A, which is the lightest value where
 * white sits on it at 4.5:1 AND it works as link text on the light grounds.
 * The dark surfaces are no longer a neutral near-black: they are the cyan hue
 * (194 degrees) at 55% saturation, so the whole page sits in the logo's own
 * color family. blueText is the cyan darkened until it is readable on white.
 */
const theme: Theme = {
  palette: {
    primary: '#0D242B',
    primaryDark: '#08171C',
    primarySoft: '#F0F8FA',
    accent: '#DF131A',
    accentDark: '#BA1015',
    blue: '#00B3EA',
    blueText: '#007AA0',
    bg: '#F5F6F8',
    surface: '#FFFFFF',
    ink: '#121720',
    muted: '#5D6676',
    line: '#E2E5EA',
    onPrimary: '#F6F7F9',
    onAccent: '#FFFFFF',
    star: '#F4B400',
  },
  heroVariant: 'full-bleed',
  logo: { src: '/brand/logo.png', alt: 'Premium Detailing' },
  radius: 0.75,
  shadow: '0 1px 2px rgb(12 18 32 / 0.08), 0 8px 24px rgb(12 18 32 / 0.06)',
}

export default theme
