/**
 * Icons and the social card, generated from the brand files.
 *
 *   node scripts/build-brand-assets.mjs
 *
 * package.json has no prebuild hook and Vercel runs `next build` directly, so
 * the output is COMMITTED rather than generated on deploy. Re-run this after
 * any change to public/brand/.
 */
import sharp from 'sharp'
import fs from 'node:fs'
import path from 'node:path'

const PUB = path.join(process.cwd(), 'public')
const MARK = path.join(PUB, 'brand/logo-mark.png')
const LOGO = path.join(PUB, 'brand/logo.png')
const PRIMARY = { r: 0x0d, g: 0x24, b: 0x2b, alpha: 1 }

// Icons sit on the brand navy: an icon has to be opaque for iOS, and the cyan
// mark on transparent would vanish against a light tab strip.
async function icon(size, out) {
  const inner = Math.round(size * 0.76)
  const buf = await sharp(MARK).resize(inner, inner, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).toBuffer()
  await sharp({ create: { width: size, height: size, channels: 4, background: PRIMARY } })
    .composite([{ input: buf, gravity: 'center' }])
    .png()
    .toFile(out)
  return out
}

const made = []
made.push(await icon(180, path.join(PUB, 'apple-touch-icon.png')))
made.push(await icon(192, path.join(PUB, 'icon-192.png')))
made.push(await icon(512, path.join(PUB, 'icon-512.png')))

// favicon.ico: a real ICO container wrapping a 32x32 PNG. sharp cannot write
// .ico, and renaming a PNG is not an ICO, so the 22-byte header is built here.
const png32 = await sharp(MARK)
  .resize(24, 24, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .extend({ top: 4, bottom: 4, left: 4, right: 4, background: PRIMARY })
  .png()
  .toBuffer()
const ico = Buffer.alloc(22 + png32.length)
ico.writeUInt16LE(0, 0)            // reserved
ico.writeUInt16LE(1, 2)            // type 1 = icon
ico.writeUInt16LE(1, 4)            // one image
ico.writeUInt8(32, 6)              // width
ico.writeUInt8(32, 7)              // height
ico.writeUInt8(0, 8)               // palette
ico.writeUInt8(0, 9)               // reserved
ico.writeUInt16LE(1, 10)           // colour planes
ico.writeUInt16LE(32, 12)          // bits per pixel
ico.writeUInt32LE(png32.length, 14)
ico.writeUInt32LE(22, 18)          // offset to the PNG payload
png32.copy(ico, 22)
fs.writeFileSync(path.join(PUB, 'favicon.ico'), ico)
made.push(path.join(PUB, 'favicon.ico'))

// Social card. White, logo centred, the tagline under it, a red rule beneath.
// No photograph: the card has to survive being shown at thumbnail size in a
// feed, and a dark car photo behind a logo does not.
// Read the tagline as text rather than importing site.config.ts: this is a
// plain node script and the config is TypeScript.
const tagline =
  (fs.readFileSync(path.join(process.cwd(), 'site.config.ts'), 'utf8').match(/tagline:\s*'([^']+)'/) || [])[1] || ''

const W = 1200, H = 630
const logoBuf = await sharp(LOGO).resize({ width: 560 }).toBuffer()
const logoMeta = await sharp(logoBuf).metadata()
const esc = (t) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
const words = tagline.split(' ')
const lines = []
let cur = ''
for (const w of words) {
  if ((cur + ' ' + w).trim().length > 52) { lines.push(cur.trim()); cur = w } else { cur += ' ' + w }
}
if (cur.trim()) lines.push(cur.trim())

const logoTop = 70
const textTop = logoTop + logoMeta.height + 56
const ruleY = textTop + lines.length * 46 + 14
if (ruleY + 12 > H) throw new Error(`social card overflows: rule at ${ruleY + 12} of ${H}. Shrink the logo or the type.`)
const svg = `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <style>
    .t { font-family: Manrope, "Helvetica Neue", Arial, sans-serif; font-weight: 600; font-size: 34px; fill: #121720; }
  </style>
  ${lines.map((l, i) => `<text x="${W / 2}" y="${textTop + i * 46}" text-anchor="middle" class="t">${esc(l)}</text>`).join('\n  ')}
  <rect x="${W / 2 - 60}" y="${ruleY}" width="120" height="12" rx="2" fill="#DF131A"/>
</svg>`

await sharp({ create: { width: W, height: H, channels: 4, background: '#FFFFFF' } })
  .composite([
    { input: logoBuf, top: logoTop, left: Math.round((W - logoMeta.width) / 2) },
    { input: Buffer.from(svg), top: 0, left: 0 },
  ])
  .png()
  .toFile(path.join(PUB, 'og.png'))
made.push(path.join(PUB, 'og.png'))

for (const f of made) {
  const m = f.endsWith('.ico') ? { width: 32, height: 32 } : await sharp(f).metadata()
  console.log(`  ${path.relative(PUB, f).padEnd(22)} ${String(m.width).padStart(4)}x${String(m.height).padEnd(4)}  ${fs.statSync(f).size} bytes`)
}
console.log(`\ntagline on card: "${tagline}"`)
