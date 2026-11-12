import fs from 'node:fs'
import path from 'node:path'

/**
 * Assembles ./out from the Next build so scripts/verify.ts can inspect the
 * finished HTML exactly as it did under `output: 'export'`.
 *
 * WHY THIS EXISTS. This site needs two server route handlers (the Flyra slot
 * lookup and the booking write), and `output: 'export'` cannot host a route
 * handler: the Flyra key would have to reach the browser, which is the one
 * thing it must never do. So the export was removed.
 *
 * Every page is still prerendered at build time (`next build` reports them all
 * as Static or SSG), so the same finished HTML still exists, just under
 * .next/server/app. This copies it back to ./out in the layout the export
 * produced, which is what keeps scripts/verify.ts BYTE-IDENTICAL: the gate was
 * not edited, reinterpreted or pointed at different data. It still reads real
 * built HTML for every route, the real sitemap and the real robots file.
 *
 * public/images/originals is skipped: it is 62MB of source photography that no
 * page references (every <Img> reads images/processed), and copying it added
 * forty seconds to every gate run. Everything else under public/ is copied, so
 * verify's routeExists() resolves a link to a public file the same way it did.
 *
 * Run by `npm run verify` between the build and the gate. Writes nothing
 * outside ./out.
 */

const ROOT = process.cwd()
const APP = path.join(ROOT, '.next/server/app')
const PUBLIC = path.join(ROOT, 'public')
const OUT = path.join(ROOT, 'out')

/** Next writes a route handler's prerendered body as <route>.body. */
const BODY_FILES = ['sitemap.xml', 'robots.txt', 'llms.txt'] as const

const SKIP_PUBLIC = new Set(['images/originals'])

function copyTree(from: string, to: string, relBase = ''): number {
  let n = 0
  for (const entry of fs.readdirSync(from, { withFileTypes: true })) {
    const rel = relBase ? `${relBase}/${entry.name}` : entry.name
    if (SKIP_PUBLIC.has(rel)) continue
    const src = path.join(from, entry.name)
    const dest = path.join(to, entry.name)
    if (entry.isDirectory()) {
      fs.mkdirSync(dest, { recursive: true })
      n += copyTree(src, dest, rel)
    } else if (entry.isFile()) {
      fs.copyFileSync(src, dest)
      n += 1
    }
  }
  return n
}

function collectHtml(dir: string, relBase = ''): number {
  let n = 0
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const rel = relBase ? `${relBase}/${entry.name}` : entry.name
    const src = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      n += collectHtml(src, rel)
      continue
    }
    if (!entry.name.endsWith('.html')) continue
    const dest = path.join(OUT, rel)
    fs.mkdirSync(path.dirname(dest), { recursive: true })
    fs.copyFileSync(src, dest)
    n += 1
  }
  return n
}

function main() {
  if (!fs.existsSync(APP)) {
    console.error(`No build output at ${path.relative(ROOT, APP)}. Run \`next build\` first.`)
    process.exit(1)
  }

  // Wipe first: a stale page left from an earlier build is a check passing
  // against HTML that is no longer what this commit produces.
  fs.rmSync(OUT, { recursive: true, force: true })
  fs.mkdirSync(OUT, { recursive: true })

  const html = collectHtml(APP)

  const bodies: string[] = []
  for (const name of BODY_FILES) {
    const src = path.join(APP, `${name}.body`)
    if (!fs.existsSync(src)) continue
    fs.copyFileSync(src, path.join(OUT, name))
    bodies.push(name)
  }

  const assets = fs.existsSync(PUBLIC) ? copyTree(PUBLIC, OUT) : 0

  console.log(`collect-out: ${html} pages, ${bodies.length} route bodies (${bodies.join(', ')}), ${assets} public files -> ./out`)

  if (html === 0) {
    console.error('collect-out: no prerendered HTML found. Did a page become dynamic?')
    process.exit(1)
  }
  for (const name of BODY_FILES) {
    if (!bodies.includes(name)) {
      console.error(`collect-out: ${name} was not prerendered. The gate needs it.`)
      process.exit(1)
    }
  }
}

main()
