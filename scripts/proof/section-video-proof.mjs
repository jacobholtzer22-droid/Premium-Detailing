import { spawn } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

/**
 * Proves the three SectionVideo playback rules on a real built page carrying
 * a hero video and two section bands:
 *
 *   1. Nothing FAR below the fold preloads. A band just under the fold is
 *      inside the 200px arm margin on purpose, so the test is that a distant
 *      band has not armed and that arming grows as you scroll.
 *   2. Play on enter, pause on leave.
 *   3. Exactly one video playing anywhere, the hero included.
 *
 * The template ships no sample footage and no section band, so this needs a
 * throwaway harness. Generate clips as in hero-defer-proof.mjs, add a band
 * clip and poster, set config.images.heroVideo, and drop two stacked bands
 * into app/page.tsx right after <Hero />:
 *
 *   <section className="relative isolate flex min-h-[90vh] items-end
 *     overflow-hidden bg-primary-dark">
 *     <SectionVideo desktop="..." mobile="..." poster="..." alt="..." />
 *     <div className="relative z-10 ...">band</div>
 *   </section>
 *
 *   npx next build && npx serve out -l 3240
 *   node scripts/proof/section-video-proof.mjs [baseUrl]
 *
 * Recorded result, 2026-10-15, on this template at 390x820, AFTER the
 * arm-does-not-play fix. The 2026-10-08 run recorded "scrolled 900: 0 playing"
 * and read it as the hero pausing correctly. It was also a band that should
 * have been playing and was not, which is the bug that fix closes.
 *
 *   at rest        2 videos in DOM, 1 playing (hero), far band not armed
 *   scrolled 900   3 in DOM, 1 playing (band 1, 79% visible), hero paused
 *   scrolled 1800  3 in DOM, 1 playing (band 2), band 1 and hero paused
 *   scrolled 2700  3 in DOM, 0 playing, nothing is 34% visible
 *
 * Max playing at any point: 1, hero included. At every scroll position where
 * any band is at least 34% visible, exactly one of them is playing.
 */
const BASE = process.argv[2] ?? 'http://localhost:3240'
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const PORT = 9446
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'chrome-sv-'))
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

const STATE = `(() => {
  const v = [...document.querySelectorAll('video')];
  return JSON.stringify({
    scrollY: Math.round(scrollY),
    inDOM: v.length,
    playing: v.filter(x => !x.paused).length,
    videos: v.map(x => ({ src: (x.currentSrc || '').split('/').pop() || 'none', paused: x.paused, t: +x.currentTime.toFixed(2) })),
    mp4s: performance.getEntriesByType('resource').filter(e => /\\.mp4/.test(e.name)).map(e => e.name.split('/').pop()),
  });
})()`

const steps = []
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
  await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 820, deviceScaleFactor: 1, mobile: true })
  await send('Page.navigate', { url: `${BASE}/?t=${Date.now()}` })
  await sleep(5000)
  steps.push({ at: 'at rest, no scroll', ...JSON.parse(await evaluate(STATE)) })

  for (const y of [900, 1800, 2700]) {
    await evaluate(`new Promise(r => { scrollTo(0, ${y}); setTimeout(r, 2500); })`)
    steps.push({ at: `scrolled to ${y}`, ...JSON.parse(await evaluate(STATE)) })
  }
} finally {
  chrome.kill()
}

console.log('\n=== SectionVideo playback rules ===\n')
for (const s of steps) {
  console.log(`${s.at.padEnd(22)} y=${String(s.scrollY).padStart(5)}  inDOM=${s.inDOM}  playing=${s.playing}  mp4s=${s.mp4s.length}`)
  for (const v of s.videos) console.log(`${''.padEnd(24)}${v.paused ? 'paused ' : 'PLAYING'}  ${v.src}  t=${v.t}`)
}

const rest = steps[0]
const last = steps[steps.length - 1]
/**
 * Rule 1 is NOT "no band has armed at rest". A band sitting just under the
 * fold is inside the 200px arm margin on purpose, so that its first frame is
 * decoded before anyone sees it. The rule is that a band FAR below the fold
 * has not armed, and that arming grows with scrolling rather than happening
 * all at once. With two stacked 90vh bands, exactly one is in range at rest.
 */
const rule1 = rest.inDOM < last.inDOM && rest.inDOM <= 2
const rule3 = steps.every((s) => s.playing <= 1)
const everPlayed = steps.some((s) => s.videos.some((v) => v.src.includes('band') && !v.paused))
const everPaused = steps.some((s) => s.videos.some((v) => v.src.includes('band') && v.paused && v.t > 0))
console.log(`\n1. far below the fold does not preload : ${rule1}  (at rest ${rest.inDOM} videos in DOM, ${last.inDOM} after scrolling: the far band armed only on approach)`)
console.log(`2. play on enter                      : ${everPlayed}`)
console.log(`   pause on leave                     : ${everPaused}`)
console.log(`3. never more than one playing        : ${rule3}  (max observed ${Math.max(...steps.map((s) => s.playing))}, hero included)`)
const ok = rule1 && rule3 && everPlayed && everPaused
console.log(`\n${ok ? 'ALL PASS' : 'FAILED'}`)
process.exit(ok ? 0 : 1)
