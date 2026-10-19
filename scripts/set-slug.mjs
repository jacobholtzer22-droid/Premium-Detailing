#!/usr/bin/env node
/**
 * One command to put the real platform slug in place and ship it.
 *
 *   npm run set-slug -- <slug>
 *
 * The slug is a hardcoded string literal in site.config.ts, never an env var.
 * An env var would mean the deployed bundle's slug depends on Vercel project
 * settings that are invisible from the repo, and a wrong or missing one fails
 * silently: the form posts, the platform answers 200, and the lead is gone.
 *
 * Check 3 is expected to fail even with a correct slug, because the platform
 * does not expose /api/verify-slug yet. That is why it is excluded below and
 * why the runbook ends with a real ZZTEST lead: an HTTP 200 proves nothing.
 */
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

const PLACEHOLDER = 'replace-before-launch'
const CONFIG = path.join(process.cwd(), 'site.config.ts')
const SLUG_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/

const fail = (msg) => {
  console.error(`\nset-slug: ${msg}\n`)
  process.exit(1)
}

const run = (cmd, args) =>
  execFileSync(cmd, args, { stdio: 'pipe', encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 })

// 1. Validate.
const slug = process.argv[2]
if (!slug) fail('usage: npm run set-slug -- <slug>')
if (slug === PLACEHOLDER) fail(`"${PLACEHOLDER}" is the placeholder, not a real slug.`)
if (slug.length < 3 || slug.length > 60) fail(`slug must be 3 to 60 characters, got ${slug.length}.`)
if (!SLUG_RE.test(slug)) fail(`slug must be lowercase letters, digits and single hyphens. Got "${slug}".`)

// 2. Swap the literal.
const before = fs.readFileSync(CONFIG, 'utf8')
const line = before.split('\n').find((l) => l.includes('businessSlug:'))
if (!line) fail('no businessSlug line found in site.config.ts')

const re = /businessSlug:\s*'[^']*'/
if (!re.test(before)) fail('businessSlug is not a single-quoted string literal; refusing to edit blindly.')
const after = before.replace(re, `businessSlug: '${slug}'`)
if (after === before) fail(`site.config.ts already reads "${slug}". Nothing to do.`)
fs.writeFileSync(CONFIG, after)

console.log('\n=== site.config.ts ===')
console.log(`  before: ${line.trim()}`)
console.log(`  after:  ${after.split('\n').find((l) => l.includes('businessSlug:')).trim()}`)

// 3. Typecheck, then the gate. Check 3 is excluded; everything else blocks.
const restore = () => fs.writeFileSync(CONFIG, before)

console.log('\n=== npm run typecheck ===')
try {
  const out = run('npm', ['run', 'typecheck'])
  console.log(out.trim() || '  (no output: clean)')
} catch (e) {
  console.log(e.stdout || '', e.stderr || '')
  restore()
  fail('typecheck failed. site.config.ts restored, nothing committed.')
}

console.log('\n=== npm run verify ===')
let verifyOut = ''
try {
  verifyOut = run('npm', ['run', 'verify'])
} catch (e) {
  verifyOut = `${e.stdout || ''}${e.stderr || ''}`
}
const table = verifyOut.slice(verifyOut.indexOf('#   check'))
console.log(table || verifyOut)

// "FAILED: #3. Do not deploy." and "FAILED: #3, #14." both parse here. Pull
// the digits that follow a '#', rather than splitting on commas, because the
// line ends in prose.
const failedLine = (table.match(/^FAILED: (.+)$/m) || [])[1] || ''
const failed = [...failedLine.matchAll(/#(\d+)/g)].map((m) => m[1])
const blocking = failed.filter((n) => n !== '3')

if (blocking.length) {
  restore()
  fail(`verify failed on check(s) ${blocking.join(', ')}. site.config.ts restored, nothing committed.`)
}
if (failed.includes('3')) {
  console.log(
    '\nNote: check 3 failed as expected. The platform does not expose /api/verify-slug yet,\n' +
      'so it fails for a correct slug too. The ZZTEST lead in the runbook is the real proof.',
  )
}

// 4. Commit and push.
console.log('\n=== git ===')
try {
  run('git', ['add', 'site.config.ts'])
  console.log(run('git', ['commit', '-m', `Set platform slug to ${slug}`]).trim())
  console.log(run('git', ['push']).trim() || '  pushed')
} catch (e) {
  console.log(e.stdout || '', e.stderr || '')
  fail('git step failed. The slug IS written to site.config.ts; commit and push by hand.')
}

// 5. Runbook, verbatim.
console.log(
  '\n=== RUNBOOK ===\n' +
    'Deploy is automatic on push. When it is live: 1) open /contact on the production URL and confirm the form is enabled, 2) submit a lead with name ZZTEST, 3) confirm a WebsiteLead row for this Business in Neon (an HTTP 200 proves nothing), 4) confirm the owner text and email arrived, 5) remove ALLOW_PLACEHOLDER_DEPLOY from the Vercel project if it was set.\n',
)
