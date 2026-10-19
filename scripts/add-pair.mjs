/**
 * Drop in one before/after pair the owner has sent.
 *
 *   npm run add-pair -- --label "Interior" \
 *     --before ~/Downloads/x.jpg --after ~/Downloads/y.jpg \
 *     --alt-before "Dirty rear seats with sand and pet hair" \
 *     --alt-after "The same rear seats after a Gold Package" \
 *     [--service gold-package] [--caption "Gold Package, same day"]
 *
 * THE RULES THIS CANNOT CHECK FOR YOU (see BEFORE-AFTER.md): same vehicle,
 * same angle, no plates, no faces, nothing synthetic. A slider is a claim
 * about one car, and two different cars in it is a lie the visitor can see.
 *
 * What it does enforce: both files exist and are images, both end up the
 * IDENTICAL size (the wider ratio is centre-cropped to match the narrower, so
 * the two halves line up under the handle), long edge 1600, all metadata
 * stripped, and orientation set from the finished pixels rather than guessed.
 *
 * It never commits. It prints the git line for you to run.
 */
import sharp from 'sharp'
import fs from 'node:fs'
import path from 'node:path'
import { execFileSync } from 'node:child_process'

const OUT_DIR = path.join(process.cwd(), 'public/images/before-after')
const CONFIG = path.join(process.cwd(), 'site.config.ts')
const LONG_EDGE = 1600

const fail = (m) => { console.error(`\nadd-pair: ${m}\n`); process.exit(1) }

const args = {}
for (let i = 2; i < process.argv.length; i += 2) {
  const k = process.argv[i]
  if (!k.startsWith('--')) fail(`expected a --flag, got "${k}"`)
  args[k.slice(2)] = process.argv[i + 1]
}
for (const r of ['label', 'before', 'after', 'alt-before', 'alt-after']) {
  if (!args[r]) fail(`--${r} is required`)
}
const expand = (p) => (p.startsWith('~') ? path.join(process.env.HOME, p.slice(1)) : path.resolve(p))
const beforeSrc = expand(args.before), afterSrc = expand(args.after)
for (const f of [beforeSrc, afterSrc]) if (!fs.existsSync(f)) fail(`file not found: ${f}`)

const metaB = await sharp(beforeSrc).metadata().catch(() => null)
const metaA = await sharp(afterSrc).metadata().catch(() => null)
if (!metaB?.width || !metaA?.width) fail('both --before and --after must be readable images')

// Match the two framings: centre-crop whichever is wider to the narrower ratio
// so the slider wipes between two identically framed photographs.
const ratioB = metaB.width / metaB.height
const ratioA = metaA.width / metaA.height
const target = Math.min(ratioB, ratioA)
function cropBox(m) {
  const r = m.width / m.height
  if (Math.abs(r - target) < 1e-6) return { left: 0, top: 0, width: m.width, height: m.height }
  const w = Math.round(m.height * target)
  return { left: Math.round((m.width - w) / 2), top: 0, width: w, height: m.height }
}
const slug = args.label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
fs.mkdirSync(OUT_DIR, { recursive: true })
let n = 1
while (fs.existsSync(path.join(OUT_DIR, `${slug}-${n}-before.jpg`))) n++

// Both files must finish at EXACTLY the same size or the slider wipes
// between two differently scaled photographs. So the output size is computed
// once, from whichever source has less to give, and neither is upscaled.
const boxB = cropBox(metaB), boxA = cropBox(metaA)
const longEdgeOf = (box) => Math.max(box.width, box.height)
const cap = Math.min(LONG_EDGE, longEdgeOf(boxB), longEdgeOf(boxA))
const outW = target >= 1 ? cap : Math.round(cap * target)
const outH = target >= 1 ? Math.round(cap / target) : cap

const written = []
for (const [src, box, kind] of [[beforeSrc, boxB, 'before'], [afterSrc, boxA, 'after']]) {
  const out = path.join(OUT_DIR, `${slug}-${n}-${kind}.jpg`)
  // No .withMetadata(): sharp drops EXIF, GPS and IPTC unless asked to keep it
  await sharp(src).rotate().extract(box)
    .resize(outW, outH, { fit: 'fill' })
    .jpeg({ quality: 88, mozjpeg: true }).toFile(out)
  written.push(out)
}
const finalMeta = await sharp(written[0]).metadata()
const finalMeta2 = await sharp(written[1]).metadata()
if (finalMeta.width !== finalMeta2.width || finalMeta.height !== finalMeta2.height) {
  fail(`the two files came out different sizes (${finalMeta.width}x${finalMeta.height} vs ${finalMeta2.width}x${finalMeta2.height}). Refusing to write a misaligned pair.`)
}
const orientation = finalMeta.width >= finalMeta.height ? 'landscape' : 'portrait'
console.log(`\nwrote ${path.relative(process.cwd(), written[0])}  ${finalMeta.width}x${finalMeta.height}`)
console.log(`wrote ${path.relative(process.cwd(), written[1])}  ${finalMeta2.width}x${finalMeta2.height}`)
console.log(`orientation: ${orientation} (from the finished pixels)`)

const esc = (t) => String(t).replace(/\\/g, '\\\\').replace(/'/g, "\\'")
const block = `    {
      label: '${esc(args.label)}',
      before: { src: '${slug}-${n}-before.jpg', alt: '${esc(args['alt-before'])}' },
      after: { src: '${slug}-${n}-after.jpg', alt: '${esc(args['alt-after'])}' },
      caption: ${args.caption ? `'${esc(args.caption)}'` : 'null'},
      orientation: '${orientation}',
      service: ${args.service ? `'${esc(args.service)}'` : 'null'},
    },
`
let cfg = fs.readFileSync(CONFIG, 'utf8')
if (cfg.includes('beforeAfter: [],')) cfg = cfg.replace('beforeAfter: [],', `beforeAfter: [\n${block}  ],`)
else if (cfg.includes('beforeAfter: [')) cfg = cfg.replace('beforeAfter: [\n', `beforeAfter: [\n${block}`)
else fail('no beforeAfter array found in site.config.ts')
fs.writeFileSync(CONFIG, cfg)
console.log(`\ninserted into site.config.ts:\n${block}`)

const run = (c, a) => execFileSync(c, a, { stdio: 'pipe', encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 })
console.log('=== npm run typecheck ===')
try { console.log(run('npm', ['run', 'typecheck']).trim() || '  (clean)') }
catch (e) { console.log(e.stdout || '', e.stderr || ''); fail('typecheck failed. Files written, config edited: fix or revert by hand.') }

console.log('\n=== npm run verify ===')
let v = ''
try { v = run('npm', ['run', 'verify']) } catch (e) { v = `${e.stdout || ''}${e.stderr || ''}` }
console.log(v.slice(v.indexOf('#   check')) || v)

console.log(`\nNow: git add -A && git commit -m 'Add before/after pair: ${args.label}' && git push`)
