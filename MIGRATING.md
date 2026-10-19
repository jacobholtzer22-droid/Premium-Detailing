# Migrating an existing client repo to the current template

Client repos are copies of this template taken at a point in time. They do not
track it. When the template fixes something every client needs, each client repo
pulls the fix by hand, and the pieces below must land together.

## What to pull, and what travels as one unit

| Change | Files | Pull together |
|---|---|---|
| **SectionVideo: arming must not claim playback** (Oct 2026) **REQUIRED for any repo that already has the video components** | `components/SectionVideo.tsx` | One file. Without it a band that is fully on screen sits frozen with nothing playing. See below |
| **Contact form shows success only for a 2xx** (Oct 2026) **REQUIRED, every repo** | `components/ContactForm.tsx` and `scripts/contact-form.sha256` | **Always both, in one commit.** No schema or platform change. This is a live lead-loss bug: see below |
| **Contact form with optional fields** (Oct 2026) | `components/ContactForm.tsx` and `scripts/contact-form.sha256` | **Always both, in one commit.** See below. Also `lib/config-schema.ts` (the `contactForm` block), `app/privacy-policy/page.tsx`, and the AGENT.md / BRIEF.template.md paragraphs if the repo is still being built by the agent. |
| **next-mdx-remote 6** (CVE-2026-0969; Vercel blocks deploys on 5.x) | `package.json` + `package-lock.json` (`^6.0.0`) and `lib/content.ts` (`blockJS: false`, `blockDangerousJS: true`) | **Always both.** v6 without the option builds green and renders every `{config.*}` in content as an empty string. |
| **Blank-interpolation guard** (verify check 18) | `scripts/verify.ts` | With the v6 bump, so the repo can prove the option is doing its job. |
| **Hero contrast gate** (verify check 19) | `lib/hero-scrim.ts` (new), `components/Hero.tsx` (reads it), `scripts/contrast-check.ts` (new), `scripts/verify.ts`, `package.json` (`contrast` script) | All of them. The CSS and the measurement model read the same stops; a repo with the gate but a hand-typed gradient in `Hero.tsx` is measuring something it does not render. |
| **Next 14.2.35** | `package.json` + `package-lock.json` | On its own. Stay on 14.x. |
| **Background video** (Oct 2026) **optional, opt in** | `components/HeroVideo.tsx`, `components/SectionVideo.tsx`, `lib/video-playback.ts` (all new), `lib/config-schema.ts` (`images.heroVideo` and its refine), `components/Hero.tsx` | All of them, or none. The registry in `lib/video-playback.ts` is what keeps one video playing at a time, and a repo with the components but not the registry will not compile. A repo that never sets `images.heroVideo` renders exactly as before |

**Repos with a customised `scripts/verify.ts` merge, they do not copy.** The
template ships checks 1 to 19. OTS Mobile Detail has 21 and KA-Lights has 24,
because each added its own checks after forking. Copying the template file over
theirs deletes those checks silently and the gate goes green for the wrong
reason. For such a repo, bring over the new check blocks (18 and 19), the
`scripts/verify-text-rules.ts` and `scripts/contrast-check.ts` modules they
import, and the two imports at the top of the file, and keep the repo's own
numbering and extra checks intact. Diff `record(` lines before and after: the
count must go up by exactly the number of checks added, never down.

After pulling, run `npm install`, then `npm run verify`. Only checks 2 and 3 may
fail on a template copy; on a live client repo only check 3 may fail, and only
until `/api/verify-slug` exists on the platform.

## The 2xx fix, and why it is not optional

Before this release the form awaited the fetch and showed "Thanks, we
received your message" for whatever came back. A 500, a 502 while the
platform was down, or the 404 the endpoint returns when `businessSlug`
matches no Business row all rendered the success state.

The visitor is then told their enquiry arrived, so they do not call instead,
and nothing surfaces the loss at either end. A typo'd slug in a client's
`site.config.ts` loses 100% of that site's leads with a thank-you on screen
for every one of them.

Every repo on a hash older than `10499ee5` still behaves that way. There is
no config to set and no platform change: pull the two files.

Proven rather than asserted, by `scripts/proof/res-ok-proof.mjs`, which
drives the real built component with `fetch` stubbed before the bundle runs:

| Response | Success state | Error state | |
|---|---|---|---|
| HTTP 500 | not shown | shown | PASS |
| HTTP 200 | shown | not shown | PASS |

The posted body is byte-identical across both runs and the rendered `<form>`
is byte-identical before and after the change: **2393 bytes, SHA-256
`79055739b70d03a5`, on both sides**, measured on `out/contact.html` by
building `28f499a^` and `28f499a` and comparing the `<form data-endpoint>`
element. (/contact is the only page that renders the form.) Only the branch
after the response moved. An earlier revision of this file said 2398 bytes,
which was the figure from the optional-fields merge measured against different
sample copy; the identity held then too.

## The form file and its hash are one unit

`components/ContactForm.tsx` is sealed. Check 4 hashes the file and compares it
to `scripts/contact-form.sha256`, and a mismatch fails the gate. The two files
describe one fact, so they move as one commit and never separately.

Current seal: `10499ee5c991e3bcd7126b6b17151b97cd18decd8927ce9a16b6d730f9a60f09`
(previously `460131f238cd26096df024b64bf00e42721a4025481a8928b8d6c79d8ef9f42d`,
and before that `1fb815af450deb4cd4c2adbaa362e5106adafe2a19ae45667d6fffcb3a21f260`).

A client repo on an older hash is on an older form. From this release that is
not cosmetic: see the next section.

What breaks when they are split:

- **New form, old hash.** Check 4 fails on every build. The fix people reach for
  is `npm run seal-contact-form`, which re-baselines to whatever the file
  currently is. That makes the gate pass without anyone having confirmed the
  file is the template's form, which is exactly the situation the seal exists
  to prevent. Never run the seal script in a client repo; copy the hash file.
- **Old form, new hash.** Check 4 fails, and the natural reading ("the form was
  tampered with") is wrong, which costs the time of a false investigation.
  Worse since the 2xx fix: the gate is red for a file that is also still
  losing leads silently, so the red is read as a hash problem and the real
  bug keeps running.
- **New hash copied, form forgotten.** The gate goes GREEN, because check 4
  only compares the file to the hash it was given, and the repo keeps the old
  form. This is the quiet one: nothing fails, and every 500 is still a
  thank-you. Check the first line of the fetch handler reads
  `const res = await fetch(` and that `if (!res.ok)` is present.
- **New form, new hash, but without `lib/config-schema.ts`.** `config.contactForm`
  is unknown to the schema, so a site that sets it fails `npm run build` with a
  Zod `unrecognized key` error. A site that does not set it builds and renders
  the old four fields, byte-identically; that case was proven when the branch
  merged (2398-byte `<form>` on both sides, same SHA-256).

The form's posted payload never changes shape. Extra fields fold into `name` and
`message`, because the platform parses only those. Pulling the new form never
requires a platform change.

## Order that works

Run `npm run verify` after each step, not at the end. Only checks 2 and 3 may
fail on a template copy; on a live client repo only check 3, and only until
`/api/verify-slug` exists on the platform.

1. **The 2xx fix, first, on its own.** `components/ContactForm.tsx` and
   `scripts/contact-form.sha256`, one commit. It is the only item here that is
   losing money today, it needs no schema change, and keeping it alone means
   it can ship to a client without waiting for anything else to be reviewed.
   Confirm check 4 passes and that `if (!res.ok)` is in the file.
2. `package.json` dependencies and lockfile for next-mdx-remote 6, with
   `lib/content.ts`. `npm install`. `npm run build`. Open any area page and read
   it; every `{config.*}` must be a word, not a gap.
3. `scripts/verify.ts` (checks 18 and 19), `scripts/contrast-check.ts`,
   `lib/hero-scrim.ts`, `components/Hero.tsx`. If the repo's hero gradient was
   tuned by hand, move its stops into `lib/hero-scrim.ts` rather than keeping a
   second gradient.
4. **Optional form fields**, if the client wants them: `lib/config-schema.ts`
   (the `contactForm` block) and `app/privacy-policy/page.tsx`. The form file
   itself already came in step 1. A repo that sets nothing renders the same
   four fields.
5. **Background video**, if the client has footage:
   `components/HeroVideo.tsx`, `components/SectionVideo.tsx`,
   `lib/video-playback.ts`, the `images.heroVideo` block and its refine in
   `lib/config-schema.ts`, and `components/Hero.tsx`. All five, or none.
6. **The SectionVideo arming fix**, if the repo already had the video
   components from an earlier pull: `components/SectionVideo.tsx` alone. A
   repo doing step 5 now gets it in the same file and has nothing extra to do.
7. Next 14.2.35. `npm install`.

Steps 1 and 2 are the ones that matter for a repo nobody is actively
building: one is losing leads, the other blocks deploys on Vercel.

### Before you pull the video components

Check how the repo's hero stacks. This template positions the hero copy at
`z-10` over a `z-0` image, and both video components paint at `z-0` to match.
A repo whose hero copy block is STATIC needs the media at a negative z-index
instead, because a positioned element at `z-0` paints on top of a static one
whatever the DOM order. Getting this wrong renders a hero with no text at
all, which happened once already. Either convention works; mixing them does
not.

### Arming is not a reason to play

A band arms when it comes within 200px of the viewport, which is off screen.
Until Oct 2026 the ref callback called `playExclusively()` at that moment, so
the band coming into range took the single playback slot, paused the band the
visitor was looking at, and was then paused by its own play observer for not
being 34% visible. The result was a band at 100% visibility frozen on one
frame with nothing playing anywhere, and it never recovered, because its play
observer only fires on an intersection CHANGE and it was already intersecting.

Measured at 390x820 with a hero clip and two stacked bands:

| scroll | band 1 visibility | before | after |
|---|---|---|---|
| 700 | 100% | paused, t frozen at 0.07 | playing |
| 900 | 79% | paused, t frozen at 0.07 | playing |

Max playing at any scroll position is 1 in both runs, hero included, so the
one-at-a-time rule was never the problem.

**Any client repo that pulled `SectionVideo.tsx` before this release has the
bug** and needs the one-file pull in step 6. That includes the repo this
component was ported from: its committed HEAD carried the old line when this
was written (2026-10-15), though work was in flight there on a different
approach, where the registry itself decides who plays instead of each caller
claiming the slot. If that lands and proves out, it supersedes this fix rather
than conflicting with it, and the template should take the newer design whole
rather than carrying both. The symptom is subtle enough to be missed by eye:
the poster underneath is correct, so a frozen band looks like a still, not a
fault.

`images.heroVideo` has no poster field. `images.hero` is the poster, and the
schema rejects a config that sets the video without it: the hero image is
already processed, already preloaded, already the LCP element, and already
what check 19 measures the hero copy against.
