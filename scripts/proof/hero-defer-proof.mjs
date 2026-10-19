import { spawn } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

/**
 * Proves the hero clip is requested AFTER the load event, and that neither
 * reduced motion nor data saver requests it at all.
 *
 * The template ships no sample footage, so generate a throwaway pair first,
 * point config.images.heroVideo at it, build, serve, run, then revert:
 *
 *   npx ffmpeg -f lavfi -i testsrc2=size=1920x1080:rate=25:duration=6 \
 *     -an -c:v libx264 -pix_fmt yuv420p -crf 30 public/video/_proof-hero-1920.mp4
 *   npx ffmpeg -f lavfi -i testsrc2=size=1280x720:rate=25:duration=6 \
 *     -an -c:v libx264 -pix_fmt yuv420p -crf 30 public/video/_proof-hero-1280.mp4
 *
 *   images.heroVideo = { desktop: '/video/_proof-hero-1920.mp4',
 *                        mobile:  '/video/_proof-hero-1280.mp4' }
 *
 *   npx next build && npx serve out -l 3240
 *   node scripts/proof/hero-defer-proof.mjs [baseUrl]
 *
 * Recorded result, 2026-10-08, on this template:
 *
 *   scenario                              load     video@   after?    KB
 *   mobile 375, motion allowed            50.6ms   61.3ms   true     801
 *   desktop 1440, motion allowed          23.8ms   38.4ms   true    1561
 *   mobile 375, prefers-reduced-motion    24.3ms   none     n/a        0
 *
 * CLS 0 in all three. Reduced motion renders no <video> element at all.
 */
const BASE = process.argv[2] ?? 'http://localhost:3240'
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const PORT = 9445
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'chrome-hero-'))
const chrome = spawn(CHROME, ['--headless=new', '--disable-gpu', '--no-first-run', '--autoplay-policy=no-user-gesture-required', `--remote-debugging-port=${PORT}`, `--user-data-dir=${profile}`, 'about:blank'], { stdio: 'ignore' })

async function wsUrl() {
  for (let i = 0; i < 40; i++) {
    try {
      const list = await (await fetch(`http://127.0.0.1:${PORT}/json`)).json()
      const p = list.find((t) => t.type === 'page')
      if (p) return p.webSocketDebuggerUrl
    } catch {}
    await sleep(250)
  }
  throw new Error('CDP never came up')
}

const PROBE = `(() => {
  const nav = performance.getEntriesByType('navigation')[0];
  const load = nav.loadEventEnd;
  const vid = performance.getEntriesByType('resource').find(e => /\\.mp4/.test(e.name));
  let cls = 0;
  for (const e of performance.getEntriesByType('layout-shift') || []) if (!e.hadRecentInput) cls += e.value;
  return JSON.stringify({
    loadEventEnd: +load.toFixed(1),
    videoStart: vid ? +vid.startTime.toFixed(1) : null,
    afterLoad: vid ? vid.startTime > load : null,
    file: vid ? vid.name.split('/').pop() : null,
    kb: vid ? Math.round((vid.transferSize || vid.encodedBodySize || 0) / 1024) : 0,
    videoEls: document.querySelectorAll('video').length,
    cls: +cls.toFixed(4),
  });
})()`

const rows = []
try {
  const ws = new WebSocket(await wsUrl())
  await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej })
  let id = 0
  const pending = new Map()
  ws.onmessage = (ev) => { const m = JSON.parse(ev.data); if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id) } }
  const send = (method, params = {}) =>
    new Promise((resolve, reject) => {
      const n = ++id
      pending.set(n, (m) => (m.error ? reject(new Error(`${method}: ${m.error.message}`)) : resolve(m.result)))
      ws.send(JSON.stringify({ id: n, method, params }))
    })
  const evaluate = async (e) => (await send('Runtime.evaluate', { expression: e, returnByValue: true, awaitPromise: true })).result.value

  await send('Page.enable')
  for (const scenario of [
    { name: 'mobile 375, motion allowed', width: 375, mobile: true, reduced: false },
    { name: 'desktop 1440, motion allowed', width: 1440, mobile: false, reduced: false },
    { name: 'mobile 375, prefers-reduced-motion', width: 375, mobile: true, reduced: true },
  ]) {
    await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: scenario.reduced ? 'reduce' : 'no-preference' }] })
    await send('Emulation.setDeviceMetricsOverride', { width: scenario.width, height: 820, deviceScaleFactor: 1, mobile: scenario.mobile })
    await send('Network.clearBrowserCache').catch(() => {})
    await send('Page.navigate', { url: `${BASE}/?t=${Date.now()}` })
    await sleep(5000)
    rows.push({ scenario: scenario.name, ...JSON.parse(await evaluate(PROBE)) })
  }
} finally {
  chrome.kill()
}

console.log('\n=== hero video: armed on idle, never in first load ===\n')
console.log(`${'scenario'.padEnd(36)} ${'load'.padStart(7)} ${'video@'.padStart(8)} ${'after?'.padStart(7)} ${'KB'.padStart(5)} ${'<video>'.padStart(8)} ${'CLS'.padStart(6)}`)
for (const r of rows) {
  console.log(
    `${r.scenario.padEnd(36)} ${String(r.loadEventEnd + 'ms').padStart(7)} ${String(r.videoStart === null ? 'none' : r.videoStart + 'ms').padStart(8)} ${String(r.afterLoad === null ? 'n/a' : r.afterLoad).padStart(7)} ${String(r.kb).padStart(5)} ${String(r.videoEls).padStart(8)} ${String(r.cls).padStart(6)}`,
  )
}
const motion = rows.filter((r) => !r.scenario.includes('reduced'))
const reduced = rows.find((r) => r.scenario.includes('reduced'))
const ok = motion.every((r) => r.afterLoad === true) && reduced.videoStart === null && reduced.videoEls === 0 && rows.every((r) => r.cls === 0)
console.log(`\nrequest begins after the load event in every motion scenario: ${motion.every((r) => r.afterLoad === true)}`)
console.log(`reduced motion requests no video and renders no <video>:      ${reduced.videoStart === null && reduced.videoEls === 0}`)
console.log(`CLS 0 in every scenario:                                      ${rows.every((r) => r.cls === 0)}`)
console.log(`\n${ok ? 'ALL PASS' : 'FAILED'}`)
process.exit(ok ? 0 : 1)
