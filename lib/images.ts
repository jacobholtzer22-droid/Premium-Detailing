import manifest from '@/public/images/manifest.json'

/**
 * Read side of the image pipeline. scripts/process-images.ts writes
 * public/images/manifest.json keyed by ORIGINAL FILENAME, never by position,
 * so alt text can never shift onto the wrong photo.
 */

export interface ManifestEntry {
  width: number
  height: number
  alt: string | null
  /** Slugified basename used for the processed WebP files. */
  base: string
  /** Widths that were generated (never wider than the original). */
  sizes: number[]
}

export type Manifest = Record<string, ManifestEntry>

const entries = manifest as Manifest

export const PROCESSED_DIR = '/images/processed'

export interface ResolvedImage {
  /** Default src: the largest rendition at or below 1024px. */
  src: string
  srcSet: string
  width: number
  height: number
  alt: string
  sizes: number[]
}

export function hasImage(filename: string): boolean {
  return Object.prototype.hasOwnProperty.call(entries, filename)
}

export function listImages(): string[] {
  return Object.keys(entries)
}

/**
 * Throws at build for an unknown file or a missing alt. Both are defects that
 * must stop the build rather than ship an unlabeled or broken image.
 */
export function getImage(filename: string): ResolvedImage {
  const entry = entries[filename]
  if (!entry) {
    throw new Error(
      `Image "${filename}" is not in public/images/manifest.json. ` +
        `Drop the file in public/images/originals/ and run \`npm run images\`. Known images: ${listImages().join(', ') || '(none)'}`,
    )
  }
  if (!entry.alt || entry.alt.trim().length === 0) {
    throw new Error(
      `Image "${filename}" has no alt text in public/images/manifest.json. ` +
        `View the file and write a descriptive alt (10 to 20 words) before building.`,
    )
  }
  const sizes = [...entry.sizes].sort((a, b) => a - b)
  const largestDefault = sizes.filter((w) => w <= 1024).at(-1) ?? sizes[0]
  if (largestDefault === undefined) {
    throw new Error(`Image "${filename}" has no generated sizes. Re-run \`npm run images\`.`)
  }
  const file = (w: number) => `${PROCESSED_DIR}/${entry.base}-${w}.webp`
  const maxW = sizes.at(-1) ?? largestDefault
  return {
    src: file(largestDefault),
    srcSet: sizes.map((w) => `${file(w)} ${w}w`).join(', '),
    width: entry.width,
    height: entry.height,
    alt: entry.alt.trim(),
    sizes: sizes.length ? sizes : [maxW],
  }
}
