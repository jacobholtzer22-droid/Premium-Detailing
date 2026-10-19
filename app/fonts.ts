import { Archivo, Manrope } from 'next/font/google'

/**
 * The two typefaces for this site, loaded through next/font so they are
 * self-hosted and subset at build time. This is the ONE file to edit to change
 * fonts: swap the imports and the two exports, keep the `variable` names, and
 * list only weights the family actually ships.
 *
 * Archivo at 700/800 is the display face: a grotesque with enough width and
 * weight to hold a headline over a dark photograph. Manrope stays on the body.
 */
export const headingFont = Archivo({
  subsets: ['latin'],
  weight: ['700', '800'],
  variable: '--font-heading',
  display: 'swap',
})

export const bodyFont = Manrope({
  subsets: ['latin'],
  weight: ['400', '600'],
  variable: '--font-body',
  display: 'swap',
})
