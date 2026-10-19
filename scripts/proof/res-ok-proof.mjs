import { spawn } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

/**
 * Proves what the REAL built ContactForm does when the endpoint answers 500
 * and when it answers 200.
 *
 * It drives the component in a browser rather than re-implementing its logic,
 * because a copy of the logic proves nothing about the shipped file. `fetch`
 * is stubbed before the bundle runs, so the stub also CAPTURES the posted
 * body: the same run proves the handling changed and the payload did not.
 *
 *   npx serve out -l 3240
 *   node scripts/proof/res-ok-proof.mjs [baseUrl]
 */
const BASE = process.argv[2] ?? 'http://localhost:3240'
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const PORT = 9444
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'chrome-proof-'))
const chrome = spawn(CHROME, ['--headless=new', '--disable-gpu', '--no-first-run', `--remote-debugging-port=${PORT}`, `--user-data-dir=${profile}`, 'about:blank'], { stdio: 'ignore' })

async function wsUrl() {
  for (let i = 0; i < 40; i++) {
    try {
      const list = await (await fetch(`http://127.0.0.1:${PORT}/json`)).json()
      const page = list.find((t) => t.type === 'page')
      if (page) return page.webSocketDebuggerUrl
    } catch {}
    await sleep(250)
  }
  throw new Error('CDP never came up')
}

const results = []
try {
  const ws = new WebSocket(await wsUrl())
  await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej })
  let id = 0
  const pending = new Map()
  ws.onmessage = (ev) => {
    const m = JSON.parse(ev.data)
    if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id) }
  }
  const send = (method, params = {}) =>
    new Promise((resolve, reject) => {
      const n = ++id
      pending.set(n, (m) => (m.error ? reject(new Error(`${method}: ${m.error.message}`)) : resolve(m.result)))
      ws.send(JSON.stringify({ id: n, method, params }))
    })
  const evaluate = async (expression) =>
    (await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true })).result.value

  await send('Page.enable')
  await send('Runtime.enable')

  for (const status of [500, 200]) {
    // Stub fetch BEFORE any bundle runs, and record what it was called with.
    await send('Page.addScriptToEvaluateOnNewDocument', {
      source: `
        window.__posted = null;
        window.fetch = function (url, init) {
          window.__posted = { url: String(url), method: init && init.method, headers: init && init.headers, body: init && init.body };
          return Promise.resolve(new Response('{}', { status: ${status}, headers: { 'Content-Type': 'application/json' } }));
        };
      `,
    })
    await send('Page.navigate', { url: `${BASE}/contact` })
    await sleep(2500)

    await evaluate(`
      (() => {
        const f = document.querySelector('form[data-endpoint]');
        const set = (sel, v) => { const el = f.querySelector(sel); if (!el) return;
          const p = Object.getOwnPropertyDescriptor(el.constructor.prototype, 'value');
          p.set.call(el, v); el.dispatchEvent(new Event('input', { bubbles: true })); };
        set('#contact-name', 'Proof Person');
        set('#contact-phone', '5555550123');
        set('#contact-message', 'proof run');
        f.requestSubmit();
        return true;
      })()
    `)
    await sleep(1200)

    const seen = await evaluate(`
      (() => {
        const t = document.body.innerText;
        return JSON.stringify({
          success: t.includes('Thanks, we received your message'),
          errorShown: t.includes('We could not send your message'),
          posted: window.__posted,
        });
      })()
    `)
    results.push({ status, ...JSON.parse(seen) })
  }
} finally {
  chrome.kill()
}

console.log('\n=== ContactForm response handling ===\n')
for (const r of results) {
  console.log(`HTTP ${r.status}`)
  console.log(`  success state shown : ${r.success}`)
  console.log(`  error state shown   : ${r.errorShown}`)
  console.log(`  verdict             : ${r.status === 200 ? (r.success && !r.errorShown ? 'PASS' : 'FAIL') : (!r.success && r.errorShown ? 'PASS' : 'FAIL')}`)
}

const bodies = results.map((r) => r.posted && r.posted.body)
console.log('\n=== posted payload, both runs ===\n')
console.log(bodies[0])
console.log(`\nidentical across the 500 and 200 runs: ${bodies[0] === bodies[1]}`)
console.log(`endpoint: ${results[0].posted && results[0].posted.url}`)

const ok = results.every((r) => (r.status === 200 ? r.success && !r.errorShown : !r.success && r.errorShown)) && bodies[0] === bodies[1]
console.log(`\n${ok ? 'ALL PASS' : 'FAILED'}`)
process.exit(ok ? 0 : 1)
