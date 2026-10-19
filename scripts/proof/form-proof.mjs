import { chromium } from 'playwright-core'
import fs from 'node:fs'

/**
 * Drives the real contact form in a browser and captures the exact body it
 * would POST, with `fetch` stubbed so nothing leaves the machine.
 *
 * The point is to prove what the component actually sends, not what a copy of
 * its logic sends, so the component is never imported here. It is rendered,
 * filled and submitted.
 *
 * Usage: node scripts/proof/form-proof.mjs <baseUrl> <scenarioJsonFile>
 */
const BASE = process.argv[2]
const scenario = JSON.parse(fs.readFileSync(process.argv[3], 'utf8'))

const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH })
const ctx = await browser.newContext({ viewport: { width: 1280, height: 1000 } })
const page = await ctx.newPage()

// Stub fetch before any app code runs. Records the call and resolves 200, so
// the component takes its success path without a request ever being made.
await page.addInitScript(() => {
  window.__captured = []
  window.fetch = async (url, init) => {
    window.__captured.push({ url: String(url), method: init?.method, headers: init?.headers, body: init?.body })
    return new Response('{}', { status: 200, headers: { 'Content-Type': 'application/json' } })
  }
})

await page.goto(BASE + '/contact', { waitUntil: 'networkidle' })
await page.waitForTimeout(400)

// Fill whatever the scenario names, skipping fields this config did not render.
for (const [selector, value] of Object.entries(scenario.fill ?? {})) {
  const el = page.locator(selector)
  if ((await el.count()) === 0) continue
  const tag = await el.first().evaluate((e) => e.tagName.toLowerCase())
  if (tag === 'select') await el.first().selectOption(value)
  else await el.first().fill(value)
}
if (scenario.consent) await page.locator('input[name="smsConsent"]').check()

await page.locator('form[data-endpoint] button[type="submit"]').click()
await page.waitForTimeout(700)

const captured = await page.evaluate(() => window.__captured)
const validation = await page.locator('form[data-endpoint] [role="alert"]').allTextContents()
const nativeBlocked = await page.evaluate(() => {
  const f = document.querySelector('form[data-endpoint]')
  if (!f) return null
  const bad = [...f.querySelectorAll('input,select,textarea')].filter((e) => !e.checkValidity())
  return bad.map((e) => `${e.name}: ${e.validationMessage}`)
})

console.log(`--- ${scenario.name} ---`)
if (captured.length === 0) {
  console.log('  SUBMISSION BLOCKED, no request made')
  if (validation.length) console.log('  inline message: ' + JSON.stringify(validation.join(' | ')))
  if (nativeBlocked?.length) console.log('  browser validation: ' + nativeBlocked.join('; '))
} else {
  for (const c of captured) {
    console.log('  url    : ' + c.url)
    console.log('  payload: ' + c.body)
  }
}
fs.writeFileSync(scenario.out, JSON.stringify({ name: scenario.name, captured, validation, nativeBlocked }, null, 2))
await browser.close()
