import fs from 'node:fs'
import path from 'node:path'
import sharp from 'sharp'
import rawConfig from '../site.config'
import { siteConfigSchema, type SiteConfigParsed } from '../lib/config-schema'
import {
  HERO_COPY_BOX,
  HERO_EYEBROW_OPACITY,
  HERO_SCRIM_RGB,
  HERO_TAGLINE_OPACITY,
  heroScrimAlpha,
} from '../lib/hero-scrim'
import theme from '../theme'

/**
 * WCAG contrast for text set over the hero photograph.
 *
 * Rebuilds the real background: the processed hero image, cover-fitted to the
 * hero box, with the SAME scrim the CSS applies (both read lib/hero-scrim.ts),
 * then takes the BRIGHTEST pixels under the copy (99.5th percentile luminance)
 * and checks each text treatment against them. AA for normal text is 4.5:1,
 * applied to everything including the H1, because the eyebrow and tagline are
 * normal-size text and the H1 sits in the same box.
 *
 * This caught a gold eyebrow at 3.61:1 over a hero video on a client site that
 * no other check could see, so it is part of `npm run verify` (check 19), not
 * a manual script. Run alone with `npm run contrast`.
 *
 * Only placements where text actually sits on a photo are measured: the
 * full-bleed hero. The split hero and every other section put text on flat
 * color, which theme.ts is responsible for.
 */

export const AA_RATIO = 4.5

export interface ContrastRow {
  placement: string
  view: 'desktop' | 'mobile'
  text: string
  ratio: number
  pass: boolean
}

export interface ContrastReport {
  rows: ContrastRow[]
  placements: number
  failures: ContrastRow[]
  /** Set when nothing was measured, with the reason. */
  skipped?: string
}

const lin = (v: number) => (v / 255 <= 0.03928 ? v / 255 / 12.92 : ((v / 255 + 0.055) / 1.055) ** 2.4)
const lum = (r: number, g: number, b: number) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b)
const hexLum = (h: string) => lum(parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16))
const ratioOf = (a: number, b: number) => (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05)

interface ManifestEntry {
  base: string
  sizes: number[]
}

function processedPath(filename: string): string {
  const manifest = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'public/images/manifest.json'), 'utf8')) as Record<string, ManifestEntry>
  const entry = manifest[filename]
  if (!entry) throw new Error(`"${filename}" is not in public/images/manifest.json`)
  const sizes = [...entry.sizes].sort((a, b) => a - b)
  const w = sizes.filter((s) => s <= 1024).at(-1) ?? sizes[0]
  return path.join(process.cwd(), 'public/images/processed', `${entry.base}-${w}.webp`)
}

/** 99.5th percentile luminance of the scrimmed photo inside the copy box. */
async function brightestUnderCopy(file: string, view: 'desktop' | 'mobile'): Promise<number> {
  // Desktop is 1440x702 (78vh of 900) at half scale; mobile is 390x658.
  const [W, H] = view === 'desktop' ? [720, 351] : [390, 658]
  const [x0, y0, x1, y1] = HERO_COPY_BOX[view]
  const { data } = await sharp(file).resize(W, H, { fit: 'cover', position: 'centre' }).removeAlpha().raw().toBuffer({ resolveWithObject: true })
  const [sr, sg, sb] = HERO_SCRIM_RGB
  const lums: number[] = []
  for (let y = Math.floor(y0 * H); y < Math.floor(y1 * H); y++) {
    const a = heroScrimAlpha(y / H)
    for (let x = Math.floor(x0 * W); x < Math.floor(x1 * W); x++) {
      const i = (y * W + x) * 3
      const mix = (c: number, s: number) => c * (1 - a) + s * a
      lums.push(lum(mix(data[i] ?? 0, sr), mix(data[i + 1] ?? 0, sg), mix(data[i + 2] ?? 0, sb)))
    }
  }
  lums.sort((a, b) => a - b)
  return lums[Math.floor(lums.length * 0.995)] ?? 0
}

export async function runContrastCheck(cfg: SiteConfigParsed): Promise<ContrastReport> {
  if (theme.heroVariant !== 'full-bleed') {
    return { rows: [], placements: 0, failures: [], skipped: `heroVariant is "${theme.heroVariant}": no text sits on a photograph` }
  }
  if (!cfg.images.hero) {
    return { rows: [], placements: 0, failures: [], skipped: 'images.hero is null: the hero renders type on flat color' }
  }

  const file = processedPath(cfg.images.hero)
  const textLum = hexLum(theme.palette.onPrimary)
  // Text at reduced opacity is composited over the background, so its
  // effective luminance moves toward the background's. Linear-light blend;
  // the background used is the brightest pixel, which is the worst case.
  const treatments: { text: string; opacity: number }[] = [
    { text: 'H1 and CTA (onPrimary)', opacity: 1 },
    { text: `tagline (onPrimary @ ${HERO_TAGLINE_OPACITY})`, opacity: HERO_TAGLINE_OPACITY },
    { text: `eyebrow (onPrimary @ ${HERO_EYEBROW_OPACITY})`, opacity: HERO_EYEBROW_OPACITY },
  ]

  const rows: ContrastRow[] = []
  for (const view of ['desktop', 'mobile'] as const) {
    const bg = await brightestUnderCopy(file, view)
    for (const t of treatments) {
      const effective = t.opacity * textLum + (1 - t.opacity) * bg
      const ratio = ratioOf(effective, bg)
      rows.push({ placement: `Homepage hero (${cfg.images.hero})`, view, text: t.text, ratio, pass: ratio >= AA_RATIO })
    }
  }
  return { rows, placements: 1, failures: rows.filter((r) => !r.pass) }
}

async function main() {
  const parsed = siteConfigSchema.safeParse(rawConfig)
  if (!parsed.success) {
    console.error('site.config.ts does not parse; fix that first.')
    process.exit(1)
  }
  const report = await runContrastCheck(parsed.data)
  if (report.skipped) {
    console.log(`No photo placements measured: ${report.skipped}`)
    return
  }
  console.log(`${'placement'.padEnd(36)} ${'view'.padEnd(8)} ${'text'.padEnd(34)} ${'ratio'.padStart(6)}  result`)
  for (const r of report.rows) {
    console.log(`${r.placement.padEnd(36)} ${r.view.padEnd(8)} ${r.text.padEnd(34)} ${r.ratio.toFixed(2).padStart(6)}  ${r.pass ? 'AA pass' : 'FAIL'}`)
  }
  console.log(`\n${report.placements} photo placement(s), ${report.failures.length} failing. Threshold ${AA_RATIO}:1 at the brightest pixels under the copy.`)
  if (report.failures.length) process.exit(1)
}

if (process.argv[1] && /contrast-check/.test(process.argv[1])) {
  main().catch((err) => {
    console.error(err instanceof Error ? err.message : err)
    process.exit(1)
  })
}
