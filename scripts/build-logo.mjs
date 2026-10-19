/**
 * Builds the brand assets from the one good copy of the logo (the Google
 * Business Profile photo of it on white). Reproducible on purpose: the only
 * logo file the client has is a JPEG of a print, so how it was cut out is
 * part of the asset.
 *
 *   node scripts/build-logo.mjs
 *
 * The white background is removed with a CORNER FLOOD FILL, never a global
 * white key. The wordmark and the silhouettes both contain white that has to
 * stay: a global key would punch holes through the middle of the artwork.
 */
import sharp from 'sharp'
import fs from 'node:fs'
import path from 'node:path'

const SRC = process.env.HOME + '/Downloads/premium-photos/gbp/gbp-44.jpg'
const BRAND = path.join(process.cwd(), 'public/brand')
const TOL = 12
fs.mkdirSync(BRAND, { recursive: true })

const { data, info } = await sharp(SRC).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
const { width: W, height: H, channels: CH } = info
const idx = (x, y) => (y * W + x) * CH
const px = (x, y) => [data[idx(x, y)], data[idx(x, y) + 1], data[idx(x, y) + 2]]
const near = (a, b, tol) => Math.abs(a[0] - b[0]) <= tol && Math.abs(a[1] - b[1]) <= tol && Math.abs(a[2] - b[2]) <= tol

// ---- 1. corner flood fill -> background mask ----
const bg = new Uint8Array(W * H)
const seeds = [[0, 0], [W - 1, 0], [0, H - 1], [W - 1, H - 1]]
const stack = []
for (const [sx, sy] of seeds) {
  if (!bg[sy * W + sx]) { bg[sy * W + sx] = 1; stack.push(sx, sy) }
}
const seedColor = px(0, 0)
while (stack.length) {
  const y = stack.pop(), x = stack.pop()
  for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
    const nx = x + dx, ny = y + dy
    if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue
    const n = ny * W + nx
    if (bg[n]) continue
    if (!near(px(nx, ny), seedColor, TOL)) continue
    bg[n] = 1; stack.push(nx, ny)
  }
}

// ---- 2. one-pixel transition band gets fractional alpha ----
const band = new Uint8Array(W * H)
for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
  if (bg[y * W + x]) continue
  for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
    const nx = x + dx, ny = y + dy
    if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue
    if (bg[ny * W + nx]) { band[y * W + x] = 1; break }
  }
}

const out = Buffer.alloc(W * H * 4)
for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
  const i = idx(x, y), o = (y * W + x) * 4, m = y * W + x
  const [r, g, b] = [data[i], data[i + 1], data[i + 2]]
  if (bg[m]) { out[o] = r; out[o + 1] = g; out[o + 2] = b; out[o + 3] = 0; continue }
  if (band[m]) {
    // unmultiply from white only on the feathered edge, so solid areas stay
    // fully opaque and do not wash out on the dark header
    const a = Math.max(0, Math.min(255, 255 - Math.min(r, g, b)))
    if (a > 8) {
      const f = a / 255
      out[o] = Math.max(0, Math.min(255, Math.round((r - (1 - f) * 255) / f)))
      out[o + 1] = Math.max(0, Math.min(255, Math.round((g - (1 - f) * 255) / f)))
      out[o + 2] = Math.max(0, Math.min(255, Math.round((b - (1 - f) * 255) / f)))
      out[o + 3] = a
      continue
    }
    out[o] = r; out[o + 1] = g; out[o + 2] = b; out[o + 3] = 0; continue
  }
  out[o] = r; out[o + 1] = g; out[o + 2] = b; out[o + 3] = 255
}

// ---- 3. crop to artwork bbox + 4% padding ----
let minX = W, minY = H, maxX = -1, maxY = -1
for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
  if (out[(y * W + x) * 4 + 3] > 16) {
    if (x < minX) minX = x; if (x > maxX) maxX = x
    if (y < minY) minY = y; if (y > maxY) maxY = y
  }
}
const aw = maxX - minX + 1, ah = maxY - minY + 1
const pad = Math.round(Math.max(aw, ah) * 0.04)
const cx = Math.max(0, minX - pad), cy = Math.max(0, minY - pad)
const cw = Math.min(W - cx, aw + pad * 2), chh = Math.min(H - cy, ah + pad * 2)

const rgba = sharp(out, { raw: { width: W, height: H, channels: 4 } })
await rgba.clone().extract({ left: cx, top: cy, width: cw, height: chh }).png().toFile(path.join(BRAND, 'logo.png'))

const bgCount = bg.reduce((a, v) => a + v, 0)
console.log(`source            ${W}x${H}`)
console.log(`flood fill        tolerance ${TOL}, seed ${seedColor.join(',')}, ${bgCount} px (${(bgCount / (W * H) * 100).toFixed(1)}%) removed`)
console.log(`artwork bbox      ${aw}x${ah} at ${minX},${minY}`)
console.log(`logo.png          ${cw}x${chh} (4% padding = ${pad}px)`)

// ---- 4. colour sampling: 5x5 median at the THICKEST stroke of each colour ----
// Thickest = deepest point under iterative erosion, so the sample is never
// taken from an anti-aliased edge.
function deepest(pred) {
  let mask = new Uint8Array(W * H)
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const i = idx(x, y)
    mask[y * W + x] = (!bg[y * W + x] && pred(data[i], data[i + 1], data[i + 2])) ? 1 : 0
  }
  let best = null, depth = 0
  while (true) {
    const next = new Uint8Array(W * H); let any = false
    for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) {
      if (!mask[y * W + x]) continue
      if (mask[(y - 1) * W + x] && mask[(y + 1) * W + x] && mask[y * W + x - 1] && mask[y * W + x + 1]) {
        next[y * W + x] = 1; any = true; best = [x, y]
      }
    }
    if (!any) break
    mask = next; depth++
  }
  return { point: best, depth }
}
function median5(x, y) {
  const rs = [], gs = [], bs = []
  for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) {
    const i = idx(Math.min(W - 1, Math.max(0, x + dx)), Math.min(H - 1, Math.max(0, y + dy)))
    rs.push(data[i]); gs.push(data[i + 1]); bs.push(data[i + 2])
  }
  const mid = (a) => a.sort((p, q) => p - q)[Math.floor(a.length / 2)]
  return [mid(rs), mid(gs), mid(bs)]
}
const hex = ([r, g, b]) => '#' + [r, g, b].map((n) => n.toString(16).padStart(2, '0').toUpperCase()).join('')

const isRed = (r, g, b) => r > 120 && r - g > 60 && r - b > 50
const isCyan = (r, g, b) => b > 120 && b - r > 50 && g > 90

const red = deepest(isRed)
const cyan = deepest(isCyan)
const redHex = hex(median5(...red.point))
const cyanHex = hex(median5(...cyan.point))
console.log(`\nRED  thickest stroke at ${red.point.join(',')} (erosion depth ${red.depth})  5x5 median = ${redHex}`)
console.log(`CYAN largest silhouette at ${cyan.point.join(',')} (erosion depth ${cyan.depth})  5x5 median = ${cyanHex}`)

// ---- 5. logo-mark: silhouettes only, square ----
// KEEP what is cyan, rather than REMOVE what is red. Removing red leaves the
// anti-aliased rim of every letter behind, which rendered as ghost lettering
// across the mark. A positive hue test (blue meaningfully above red) keeps the
// silhouettes and their soft edges and drops everything else, lettering and
// the thin arcs included.
const mark = Buffer.from(out)
for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
  const i = idx(x, y), o = (y * W + x) * 4
  if (data[i + 2] - data[i] <= 15) mark[o + 3] = 0
}
// The wordmark is framed by two hairline arcs that are also cyan. A bbox
// keeps them; a density threshold beheads the boat; there is no clean empty
// row between them because the arcs curve down past the vehicles.
//
// So separate them the way the eye does: connected components. The arcs are
// long, thin and low-area; the vehicles and the waves are big solid blobs.
// Keep every component with at least 3% of the largest component's area.
const label = new Int32Array(W * H).fill(-1)
const areas = []
for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
  const p0 = y * W + x
  if (mark[p0 * 4 + 3] <= 16 || label[p0] !== -1) continue
  const id = areas.length
  let area = 0
  const st = [x, y]
  label[p0] = id
  while (st.length) {
    const cy2 = st.pop(), cx2 = st.pop()
    area++
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
      const nx = cx2 + dx, ny = cy2 + dy
      if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue
      const n = ny * W + nx
      if (label[n] !== -1 || mark[n * 4 + 3] <= 16) continue
      label[n] = id
      st.push(nx, ny)
    }
  }
  areas.push(area)
}
// Area alone does not separate them: an arc 800px long is not a small
// component. Shape does. Measure each component's bounding box and drop the
// ones that are long, thin and mostly empty inside that box, which is what a
// hairline curve is and what a vehicle silhouette is not.
const box = areas.map(() => ({ x0: W, y0: H, x1: -1, y1: -1 }))
for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
  const id = label[y * W + x]
  if (id < 0) continue
  const bb = box[id]
  if (x < bb.x0) bb.x0 = x; if (x > bb.x1) bb.x1 = x
  if (y < bb.y0) bb.y0 = y; if (y > bb.y1) bb.y1 = y
}
const maxArea = Math.max(...areas)
const keep = new Set()
const dropped = []
for (let i = 0; i < areas.length; i++) {
  const bb = box[i]
  const bw = bb.x1 - bb.x0 + 1, bh = bb.y1 - bb.y0 + 1
  const aspect = bw / bh
  const density = areas[i] / (bw * bh)
  // Measured on this artwork: the two arcs are 816x75 at 5% density, every
  // vehicle part is 21% or denser. Density is the clean separator; the width
  // test keeps it from ever catching a small sparse detail.
  const thinCurve = density < 0.12 && bw > aw * 0.6
  if (areas[i] >= maxArea * 0.03 && !thinCurve) keep.add(i)
  else if (thinCurve) dropped.push(`${bw}x${bh} aspect ${aspect.toFixed(1)} density ${(density * 100).toFixed(0)}%`)
}
console.log(`mark components   ${areas.length} found, keeping ${keep.size}`)
if (dropped.length) console.log(`mark dropped arcs ${dropped.join(' | ')}`)
for (let i = 0; i < W * H; i++) if (label[i] === -1 || !keep.has(label[i])) mark[i * 4 + 3] = 0

let mnX = W, mnY = H, mxX = -1, mxY = -1
for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
  if (mark[(y * W + x) * 4 + 3] > 16) {
    if (x < mnX) mnX = x; if (x > mxX) mxX = x
    if (y < mnY) mnY = y; if (y > mxY) mxY = y
  }
}
const mw = mxX - mnX + 1, mh = mxY - mnY + 1
const side = Math.max(mw, mh)
const markPad = Math.round(side * 0.08)
await sharp(mark, { raw: { width: W, height: H, channels: 4 } })
  .extract({ left: mnX, top: mnY, width: mw, height: mh })
  .extend({
    top: Math.floor((side - mh) / 2) + markPad, bottom: Math.ceil((side - mh) / 2) + markPad,
    left: Math.floor((side - mw) / 2) + markPad, right: Math.ceil((side - mw) / 2) + markPad,
    background: { r: 0, g: 0, b: 0, alpha: 0 },
  })
  .png()
  .toFile(path.join(BRAND, 'logo-mark.png'))
console.log(`logo-mark.png     ${side + markPad * 2}x${side + markPad * 2} (silhouettes only, ${mw}x${mh} artwork)`)

fs.writeFileSync('/tmp/brand-colors.json', JSON.stringify({ red: redHex, cyan: cyanHex }, null, 2))
