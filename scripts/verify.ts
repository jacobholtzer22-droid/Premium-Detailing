import { createHash } from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import * as cheerio from 'cheerio'
import rawConfig from '../site.config'
import { CONTACT_ENDPOINT, HONEYPOT_FIELD, SCHEMA_TYPES, SLUG_REGEX, siteConfigSchema } from '../lib/config-schema'
import { DESCRIPTION_MAX, DESCRIPTION_MIN, TITLE_MAX, TITLE_MIN } from './verify-limits'
import { AA_RATIO, runContrastCheck } from './contrast-check'
import { blankInterpolationProblems } from './verify-text-rules'

/**
 * THE GATE. Runs after `next build` against the static output in ./out and
 * exits non-zero on any failure. `npm run verify` = `next build && tsx scripts/verify.ts`.
 *
 * Every check is fatal. Nothing here is a warning, because every one of these
 * has cost real money before: a lost lead is invisible until the client asks
 * why the phone stopped ringing.
 *
 * The report table is the artifact. Read it, not the narration around it.
 */

const ROOT = process.cwd()
const OUT = path.join(ROOT, 'out')
const CONTENT = path.join(ROOT, 'content')
const CONFIG_FILE = path.join(ROOT, 'site.config.ts')
const FORM_FILE = path.join(ROOT, 'components/ContactForm.tsx')
const FORM_BASELINE = path.join(ROOT, 'scripts/contact-form.sha256')
const VERIFY_SLUG_URL = 'https://www.alignandacquire.com/api/verify-slug'

/** Identity markers of the shipped sample config. Any of these in the identity fields means the template is unfilled. */
const SAMPLE_MARKERS = ['sample', 'example', 'template', 'EXAMPLE_']

/**
 * The shipped sample business by name. Scanned across site.config.ts AND every
 * content file, so an agent cannot fill the five identity fields and still ship
 * the sample services, FAQs, or body copy under a real client's name.
 */
const SAMPLE_TOKENS = ['sample-lawn-care', 'Sample Lawn Care']

const PLACEHOLDER_TOKENS = ['TODO', 'TKTK', 'Lorem', '[CITY]', '[SERVICE]', 'EXAMPLE_', 'your business', 'Insert ']

/** Every schema.org type this template can legitimately emit. Anything else is rejected, not warned about. */
const TYPE_ALLOWLIST = new Set<string>([
  ...SCHEMA_TYPES,
  'Organization',
  'WebSite',
  'WebPage',
  'Service',
  'Offer',
  'OfferCatalog',
  'FAQPage',
  'Question',
  'Answer',
  'BreadcrumbList',
  'ListItem',
  'PostalAddress',
  'GeoCoordinates',
  'OpeningHoursSpecification',
  'AggregateRating',
  'Review',
  'Rating',
  'Person',
  'City',
  'AdministrativeArea',
  'Place',
  'ContactPoint',
  'ImageObject',
])

interface Result {
  id: number
  name: string
  pass: boolean
  detail: string
}

const results: Result[] = []
function record(id: number, name: string, pass: boolean, detail = '') {
  results.push({ id, name, pass, detail })
}

// ---------- helpers ----------

function walk(dir: string, ext: string): string[] {
  if (!fs.existsSync(dir)) return []
  const out: string[] = []
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name)
    if (entry.isDirectory()) out.push(...walk(p, ext))
    else if (entry.name.endsWith(ext)) out.push(p)
  }
  return out.sort()
}

interface Page {
  file: string
  route: string
  html: string
  $: cheerio.CheerioAPI
}

function routeFromFile(file: string): string {
  const rel = path.relative(OUT, file).replace(/\\/g, '/')
  if (rel === 'index.html') return '/'
  if (rel.endsWith('/index.html')) return '/' + rel.slice(0, -'/index.html'.length)
  return '/' + rel.replace(/\.html$/, '')
}

function loadPages(): Page[] {
  return walk(OUT, '.html')
    .filter((f) => path.basename(f) !== '404.html' && !path.relative(OUT, f).startsWith('_'))
    .map((file) => {
      const html = fs.readFileSync(file, 'utf8')
      return { file, route: routeFromFile(file), html, $: cheerio.load(html) }
    })
}

function routeExists(route: string): boolean {
  const clean = route.split('#')[0]?.split('?')[0] ?? ''
  if (clean === '' || clean === '/') return fs.existsSync(path.join(OUT, 'index.html'))
  const rel = clean.replace(/^\//, '')
  return (
    fs.existsSync(path.join(OUT, `${rel}.html`)) ||
    fs.existsSync(path.join(OUT, rel, 'index.html')) ||
    (fs.existsSync(path.join(OUT, rel)) && fs.statSync(path.join(OUT, rel)).isFile())
  )
}

function collectTypes(node: unknown, acc: string[]): void {
  if (Array.isArray(node)) {
    for (const item of node) collectTypes(item, acc)
    return
  }
  if (node && typeof node === 'object') {
    const obj = node as Record<string, unknown>
    const t = obj['@type']
    if (typeof t === 'string') acc.push(t)
    else if (Array.isArray(t)) for (const x of t) if (typeof x === 'string') acc.push(x)
    for (const [k, v] of Object.entries(obj)) if (k !== '@type') collectTypes(v, acc)
  }
}

function hasKeyDeep(node: unknown, key: string): boolean {
  if (Array.isArray(node)) return node.some((n) => hasKeyDeep(n, key))
  if (node && typeof node === 'object') {
    const obj = node as Record<string, unknown>
    if (key in obj) return true
    return Object.values(obj).some((v) => hasKeyDeep(v, key))
  }
  return false
}

function lineOf(text: string, index: number): number {
  return text.slice(0, index).split('\n').length
}

function imageKey(src: string): string {
  // /images/processed/foo-1024.webp -> foo
  return path.basename(src).replace(/-\d+\.webp$/, '').replace(/\.[a-z]+$/, '')
}

// ---------- checks ----------

async function run() {
  if (!fs.existsSync(OUT)) {
    console.error(`No build output at ${OUT}. Run \`npm run verify\` (which builds first) or \`npm run build\`.`)
    process.exit(1)
  }

  // 1. Config parses.
  const parsed = siteConfigSchema.safeParse(rawConfig)
  if (parsed.success) {
    record(1, 'site.config.ts parses against schema', true)
  } else {
    const detail = parsed.error.issues.map((i) => `${i.path.join('.') || '(root)'}: ${i.message}`).join('; ')
    record(1, 'site.config.ts parses against schema', false, detail)
  }
  const cfg = parsed.success ? parsed.data : null
  const slug = String((rawConfig as { businessSlug?: unknown }).businessSlug ?? '')

  // 2. Slug is real, not the sample identity.
  {
    const identity = [
      ['businessSlug', slug],
      ['displayName', String((rawConfig as { displayName?: unknown }).displayName ?? '')],
      ['legalName', String((rawConfig as { legalName?: unknown }).legalName ?? '')],
      ['domain', String((rawConfig as { domain?: unknown }).domain ?? '')],
    ] as const
    const problems: string[] = []
    if (!SLUG_REGEX.test(slug)) problems.push(`businessSlug "${slug}" is not kebab-case`)
    for (const [field, value] of identity) {
      const hit = SAMPLE_MARKERS.find((m) => value.toLowerCase().includes(m.toLowerCase()))
      if (hit) problems.push(`${field} still carries the sample identity ("${hit}")`)
    }
    if (cfg) {
      // gallery entries are { name, tag } objects; the check is unchanged, it
      // just reads the filename off the object instead of the bare string.
      const sampleImages = [
        cfg.images.hero,
        cfg.images.about,
        ...cfg.images.gallery.map((g) => g.name),
        ...cfg.services.map((s) => s.image),
      ].filter(
        (n): n is string => typeof n === 'string' && n.startsWith('sample-'),
      )
      if (sampleImages.length) problems.push(`config still references sample images: ${[...new Set(sampleImages)].join(', ')}`)
    }
    for (const file of [CONFIG_FILE, ...walk(CONTENT, '.mdx')]) {
      const text = fs.readFileSync(file, 'utf8')
      for (const token of SAMPLE_TOKENS) {
        const idx = text.indexOf(token)
        if (idx !== -1) problems.push(`${path.relative(ROOT, file)}:${lineOf(text, idx)} still contains "${token}"`)
      }
    }
    record(
      2,
      'businessSlug and identity are filled in (not the template sample)',
      problems.length === 0,
      problems.length ? `The template has not been filled in. ${problems.slice(0, 12).join('. ')}.` : `slug "${slug}"`,
    )
  }

  // 3. Slug exists on the platform.
  {
    let pass = false
    let detail = ''
    try {
      const res = await fetch(`${VERIFY_SLUG_URL}?slug=${encodeURIComponent(slug)}`, {
        signal: AbortSignal.timeout(10_000),
        headers: { accept: 'application/json' },
      })
      if (res.status === 200) {
        pass = true
        detail = `platform confirmed slug "${slug}"`
      } else if (res.status === 404) {
        detail = `GET ${VERIFY_SLUG_URL} returned 404. Either the slug "${slug}" is not a Business row on the platform, or the verify-slug endpoint does not exist yet (the platform must expose it). Do not deploy until this is a 200.`
      } else {
        detail = `GET ${VERIFY_SLUG_URL}?slug=${slug} returned ${res.status}`
      }
    } catch (err) {
      detail = `could not reach ${VERIFY_SLUG_URL}: ${err instanceof Error ? err.message : String(err)}. This check does not pass silently on a network error.`
    }
    record(3, 'businessSlug exists in the live platform database', pass, detail)
  }

  // 4. ContactForm checksum.
  {
    const actual = createHash('sha256').update(fs.readFileSync(FORM_FILE)).digest('hex')
    const expected = fs.existsSync(FORM_BASELINE) ? fs.readFileSync(FORM_BASELINE, 'utf8').trim() : ''
    record(
      4,
      'components/ContactForm.tsx matches sealed checksum',
      actual === expected,
      actual === expected ? actual.slice(0, 12) : `expected ${expected.slice(0, 12) || '(no baseline)'} got ${actual.slice(0, 12)}. The sealed form was edited.`,
    )
  }

  const pages = loadPages()
  if (pages.length === 0) {
    record(0, 'build output contains pages', false, 'no HTML files in ./out')
  }

  // 5. Endpoint string present; bare apex absent.
  {
    const withEndpoint = pages.filter((p) => p.html.includes(CONTACT_ENDPOINT)).map((p) => p.route)
    const bare = pages.filter((p) => /(?<!www\.)alignandacquire\.com\/api\/contact/.test(p.html)).map((p) => p.route)
    const pass = withEndpoint.length > 0 && bare.length === 0
    record(
      5,
      'built HTML posts to the www contact endpoint, never the bare apex',
      pass,
      pass ? `endpoint on ${withEndpoint.join(', ')}` : `endpoint on: ${withEndpoint.join(', ') || 'none'}; bare apex on: ${bare.join(', ') || 'none'}`,
    )
  }

  // 6. Honeypot in hidden wrapper; no "company" field.
  {
    const problems: string[] = []
    const formPages = pages.filter((p) => p.$(`form[data-endpoint="${CONTACT_ENDPOINT}"]`).length > 0)
    if (formPages.length === 0) problems.push('no page renders the contact form')
    for (const p of formPages) {
      const hp = p.$(`[name="${HONEYPOT_FIELD}"]`)
      if (hp.length === 0) problems.push(`${p.route}: no ${HONEYPOT_FIELD} field`)
      else if (hp.closest('[hidden]').length === 0) problems.push(`${p.route}: ${HONEYPOT_FIELD} is not inside a hidden wrapper`)
    }
    for (const p of pages) {
      if (p.$('[name="company"]').length > 0) problems.push(`${p.route}: has a field named "company" (autofill bait)`)
    }
    record(6, `honeypot ${HONEYPOT_FIELD} inside hidden wrapper, no "company" field`, problems.length === 0, problems.join('; '))
  }

  // 7. No bare facts in content.
  {
    const patterns: { name: string; re: RegExp }[] = [
      { name: 'phone', re: /(\+1\s?)?\(?\b\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}\b/g },
      {
        name: 'street address',
        re: /\b\d{1,6}\s+(?:[A-Z][a-zA-Z]+\s+){1,3}(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Drive|Dr|Lane|Ln|Way|Court|Ct|Highway|Hwy|Parkway|Pkwy|Place|Pl|Trail|Trl|Circle|Cir)\b\.?/g,
      },
      { name: 'email', re: /[\w.+-]+@[\w-]+\.[\w.-]+/g },
      { name: 'price', re: /\$\s?\d/g },
    ]
    const problems: string[] = []
    for (const file of walk(CONTENT, '.mdx')) {
      const text = fs.readFileSync(file, 'utf8')
      for (const { name, re } of patterns) {
        for (const m of text.matchAll(re)) {
          problems.push(`${path.relative(ROOT, file)}:${lineOf(text, m.index ?? 0)} bare ${name} "${m[0]}"`)
        }
      }
    }
    record(7, 'content/ contains no bare phone, address, email, or price', problems.length === 0, problems.slice(0, 8).join('; '))
  }

  // 8. No placeholder tokens.
  {
    const problems: string[] = []
    const files = [...walk(CONTENT, '.mdx'), CONFIG_FILE]
    for (const file of files) {
      const text = fs.readFileSync(file, 'utf8')
      for (const token of PLACEHOLDER_TOKENS) {
        let idx = text.indexOf(token)
        while (idx !== -1) {
          problems.push(`${path.relative(ROOT, file)}:${lineOf(text, idx)} "${token}"`)
          idx = text.indexOf(token, idx + token.length)
        }
      }
    }
    record(8, 'no placeholder tokens in content/ or site.config.ts', problems.length === 0, problems.slice(0, 8).join('; '))
  }

  // 9. JSON-LD valid and typed from the allowlist. 10. Reviews honest.
  {
    const ldProblems: string[] = []
    const reviewProblems: string[] = []
    for (const p of pages) {
      p.$('script[type="application/ld+json"]').each((_, el) => {
        const raw = p.$(el).text()
        let data: unknown
        try {
          data = JSON.parse(raw)
        } catch {
          ldProblems.push(`${p.route}: JSON-LD does not parse`)
          return
        }
        const obj = data as Record<string, unknown>
        if (!obj['@context']) ldProblems.push(`${p.route}: JSON-LD missing @context`)
        if (!obj['@type']) ldProblems.push(`${p.route}: JSON-LD missing @type`)
        const types: string[] = []
        collectTypes(data, types)
        for (const t of types) if (!TYPE_ALLOWLIST.has(t)) ldProblems.push(`${p.route}: @type "${t}" is not on the allowlist`)

        if (types.includes('Review') || hasKeyDeep(data, 'aggregateRating')) {
          if (!cfg || cfg.reviews.length === 0) {
            reviewProblems.push(`${p.route}: emits Review/aggregateRating with config.reviews empty`)
          } else {
            const body = p.$('body').text()
            for (const r of cfg.reviews) {
              if (!body.includes(r.text)) reviewProblems.push(`${p.route}: review by ${r.author} is in schema but not visible on the page`)
            }
          }
        }
      })
    }
    record(9, 'every JSON-LD block parses, has @context/@type, all types on allowlist', ldProblems.length === 0, ldProblems.slice(0, 8).join('; '))
    record(10, 'Review/aggregateRating only with real, visible reviews', reviewProblems.length === 0, reviewProblems.slice(0, 8).join('; '))
  }

  // 11. Alt text.
  {
    const problems: string[] = []
    const altToFiles = new Map<string, Set<string>>()
    for (const p of pages) {
      p.$('img').each((_, el) => {
        const alt = (p.$(el).attr('alt') ?? '').trim()
        const src = p.$(el).attr('src') ?? ''
        if (alt.length < 15) problems.push(`${p.route}: <img src="${src}"> alt "${alt}" is under 15 characters`)
        const key = imageKey(src)
        const set = altToFiles.get(alt) ?? new Set<string>()
        set.add(key)
        altToFiles.set(alt, set)
      })
    }
    for (const [alt, files] of altToFiles) {
      if (files.size > 1) problems.push(`alt "${alt.slice(0, 40)}..." is shared by different images: ${[...files].join(', ')}`)
    }
    record(11, 'every image has a 15+ char alt; no two images share an alt', problems.length === 0, problems.slice(0, 8).join('; '))
  }

  // 12. One h1.
  {
    const problems = pages.filter((p) => p.$('h1').length !== 1).map((p) => `${p.route}: ${p.$('h1').length} h1`)
    record(12, 'exactly one <h1> per page', problems.length === 0, problems.join('; '))
  }

  // 13. Titles.
  {
    const problems: string[] = []
    const seen = new Map<string, string>()
    for (const p of pages) {
      const title = p.$('head > title').first().text().trim()
      if (!title) {
        problems.push(`${p.route}: no <title>`)
        continue
      }
      if (title.length < TITLE_MIN || title.length > TITLE_MAX) problems.push(`${p.route}: title ${title.length} chars "${title}"`)
      const dup = seen.get(title)
      if (dup) problems.push(`${p.route}: title duplicates ${dup}`)
      seen.set(title, p.route)
    }
    record(13, `titles unique, ${TITLE_MIN} to ${TITLE_MAX} chars as rendered`, problems.length === 0, problems.slice(0, 8).join('; '))
  }

  // 14. Descriptions.
  {
    const problems: string[] = []
    const seen = new Map<string, string>()
    for (const p of pages) {
      const desc = (p.$('meta[name="description"]').attr('content') ?? '').trim()
      if (!desc) {
        problems.push(`${p.route}: no meta description`)
        continue
      }
      if (desc.length < DESCRIPTION_MIN || desc.length > DESCRIPTION_MAX) problems.push(`${p.route}: description ${desc.length} chars`)
      const dup = seen.get(desc)
      if (dup) problems.push(`${p.route}: description duplicates ${dup}`)
      seen.set(desc, p.route)
    }
    record(14, `meta descriptions present, unique, ${DESCRIPTION_MIN} to ${DESCRIPTION_MAX} chars`, problems.length === 0, problems.slice(0, 8).join('; '))
  }

  // 15. Canonicals.
  {
    const problems: string[] = []
    const domain = String((rawConfig as { domain?: unknown }).domain ?? '')
    for (const p of pages) {
      // Next strips the trailing slash from the root canonical; compare without it on both sides.
      const strip = (u: string) => u.replace(/\/$/, '')
      const canonical = p.$('link[rel="canonical"]').attr('href') ?? ''
      const expected = domain ? strip(new URL(p.route, domain).toString()) : ''
      if (!canonical) problems.push(`${p.route}: no canonical`)
      else if (strip(canonical) !== expected) problems.push(`${p.route}: canonical "${canonical}" expected "${expected}"`)
    }
    record(15, 'canonical present on every page and matches config.domain', problems.length === 0, problems.slice(0, 8).join('; '))
  }

  // 16. Sitemap matches routes.
  {
    const problems: string[] = []
    const sitemapFile = path.join(OUT, 'sitemap.xml')
    if (!fs.existsSync(sitemapFile)) {
      problems.push('out/sitemap.xml missing')
    } else {
      const xml = fs.readFileSync(sitemapFile, 'utf8')
      const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => {
        const u = new URL(m[1] ?? '')
        return u.pathname === '/' ? '/' : u.pathname.replace(/\/$/, '')
      })
      const built = new Set(pages.map((p) => p.route))
      const listed = new Set(locs)
      for (const r of built) if (!listed.has(r)) problems.push(`built route ${r} is not in the sitemap`)
      for (const r of listed) if (!built.has(r)) problems.push(`sitemap lists ${r} which was not built`)
    }
    record(16, 'sitemap lists every built route and nothing else', problems.length === 0, problems.slice(0, 8).join('; '))
  }

  // 17. Internal links resolve.
  {
    const problems = new Set<string>()
    for (const p of pages) {
      p.$('a[href]').each((_, el) => {
        const href = p.$(el).attr('href') ?? ''
        if (!href.startsWith('/') || href.startsWith('//')) return
        if (!routeExists(href)) problems.add(`${p.route} links to ${href}`)
      })
    }
    record(17, 'every internal link resolves to a built route', problems.size === 0, [...problems].slice(0, 8).join('; '))
  }

  // 18. No blank MDX interpolation in rendered text.
  //
  // next-mdx-remote 6 disables {expressions} unless lib/content.ts passes
  // blockJS: false. With them disabled the build still passes and every
  // {config.*} renders as an empty string, so pages read "based in , ." with no
  // error anywhere. This check reads the RENDERED TEXT of each element, never the
  // raw HTML: React separates adjacent text nodes with <!-- -->, so a raw-HTML
  // grep sees "Care<!-- --> handles" and misreads healthy output as blank.
  //
  // The signals are structural, not tied to any site's copy; they live in
  // scripts/verify-text-rules.ts so they can be tested against strings.
  {
    const problems: string[] = []

    // Static half: v6 or later must carry the option, or every expression is blank.
    try {
      const mdxPkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'node_modules/next-mdx-remote/package.json'), 'utf8')) as { version: string }
      const major = Number(mdxPkg.version.split('.')[0])
      const contentSrc = fs.readFileSync(path.join(ROOT, 'lib/content.ts'), 'utf8')
      if (major >= 6 && !/blockJS:\s*false/.test(contentSrc)) {
        problems.push(`next-mdx-remote ${mdxPkg.version} is installed but lib/content.ts does not pass blockJS: false, so every {config.*} in content/ renders empty`)
      }
    } catch {
      problems.push('could not read node_modules/next-mdx-remote/package.json')
    }

    const TEXT_ELEMENTS = 'title, h1, h2, h3, h4, h5, h6, p, li, dt, dd, summary, figcaption, td, th, blockquote, address'

    const seen = new Set<string>()
    for (const p of pages) {
      const $ = cheerio.load(p.html)
      $('script, style, noscript').remove()
      const texts: string[] = [$('meta[name="description"]').attr('content') ?? '']
      $(TEXT_ELEMENTS).each((_, el) => {
        // .text() concatenates text nodes only; comment separators are dropped.
        texts.push($(el).text().replace(/ /g, ' '))
      })
      for (const raw of texts) {
        const trimmed = raw.trim()
        for (const name of blankInterpolationProblems(raw)) {
          const key = `${p.route}|${name}|${trimmed.slice(0, 60)}`
          if (seen.has(key)) continue
          seen.add(key)
          problems.push(`${p.route}: ${name} near "${trimmed.slice(0, 70)}"`)
        }
      }
    }
    record(18, 'no blank MDX interpolation in rendered text', problems.length === 0, problems.slice(0, 10).join('; '))
  }

  // 19. Text over the hero photograph meets WCAG AA at the brightest pixels.
  //
  // scripts/contrast-check.ts rebuilds the hero background (processed photo +
  // the scrim from lib/hero-scrim.ts, the same data Hero.tsx renders) and
  // measures the 99.5th percentile luminance under the copy. A gold eyebrow at
  // 3.61:1 over a hero video on a client site passed every other check here.
  {
    if (!cfg) {
      record(19, `text over the hero photo meets WCAG AA (${AA_RATIO}:1)`, false, 'config did not parse; nothing to measure')
    } else {
      try {
        const report = await runContrastCheck(cfg)
        if (report.skipped) {
          record(19, `text over the hero photo meets WCAG AA (${AA_RATIO}:1)`, true, `nothing measured: ${report.skipped}`)
        } else {
          const summary = report.rows.map((r) => `${r.view} ${r.text} ${r.ratio.toFixed(2)}:1`).join('; ')
          record(
            19,
            `text over the hero photo meets WCAG AA (${AA_RATIO}:1)`,
            report.failures.length === 0,
            report.failures.length ? `FAILING: ${report.failures.map((r) => `${r.view} ${r.text} ${r.ratio.toFixed(2)}:1`).join('; ')}` : summary,
          )
        }
      } catch (err) {
        record(19, `text over the hero photo meets WCAG AA (${AA_RATIO}:1)`, false, err instanceof Error ? err.message : String(err))
      }
    }
  }

  // ---------- report ----------
  results.sort((a, b) => a.id - b.id)
  const nameWidth = Math.max(...results.map((r) => r.name.length))
  console.log('')
  console.log(`${'#'.padEnd(3)} ${'check'.padEnd(nameWidth)}  result  detail`)
  console.log(`${'-'.repeat(3)} ${'-'.repeat(nameWidth)}  ------  ------`)
  for (const r of results) {
    console.log(`${String(r.id).padEnd(3)} ${r.name.padEnd(nameWidth)}  ${r.pass ? 'PASS  ' : 'FAIL  '}  ${r.detail}`)
  }
  const failed = results.filter((r) => !r.pass)
  console.log('')
  console.log(`${results.length - failed.length}/${results.length} checks passed across ${pages.length} pages.`)
  if (failed.length) {
    console.log(`FAILED: ${failed.map((f) => `#${f.id}`).join(', ')}. Do not deploy.`)
    process.exit(1)
  }
  console.log('All checks passed.')
}

run().catch((err) => {
  console.error(err instanceof Error ? err.stack ?? err.message : err)
  process.exit(1)
})
