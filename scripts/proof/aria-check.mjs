import { chromium } from 'playwright-core'
const b = await chromium.launch({ executablePath: process.env.CHROME_PATH })
const p = await (await b.newContext()).newPage()
await p.addInitScript(() => { window.fetch = async () => new Response('{}', { status: 200 }) })
await p.goto('http://localhost:3210/contact', { waitUntil: 'networkidle' })
await p.fill('#contact-name', 'Dana Reyes'); await p.fill('#contact-phone', '555 010 7788')
await p.fill('#contact-address-zip', '9280')          // malformed, trips the JS check
await p.selectOption('#contact-timeframe', 'Within a month')
await p.click('form[data-endpoint] button[type="submit"]'); await p.waitForTimeout(500)
console.log(await p.evaluate(() => {
  const zip = document.getElementById('contact-address-zip')
  const msg = document.getElementById('contact-validation')
  return {
    'zip aria-invalid': zip?.getAttribute('aria-invalid'),
    'zip aria-describedby': zip?.getAttribute('aria-describedby'),
    'message element id': msg?.id,
    'message role': msg?.getAttribute('role'),
    'message text': msg?.textContent,
    'describedby resolves to the message': zip?.getAttribute('aria-describedby') === msg?.id,
    'other fields untouched': document.getElementById('contact-name')?.hasAttribute('aria-invalid') === false,
  }
}))
await b.close()
