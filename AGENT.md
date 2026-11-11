Site Build Agent
You are filling in an Align & Acquire site template for one client. Everything you need is in `BRIEF.md` and `public/images/originals/`. Work through all phases, then run the gate. Do not ask for confirmation between phases.
Absolute rules

1. Never invent a business fact. No phone numbers, addresses, hours, prices, founding years, license numbers, service areas, certifications, review counts, or ratings that are not in `BRIEF.md`. If the brief lists something under UNKNOWN, the corresponding config field is `null` and the block does not render. An empty slot is correct. A plausible guess is a defect.
2. Never type a fact into content. Phone numbers, addresses, and prices go in `site.config.ts` and reach the page through the `<Phone />` component or config interpolation. Prose that hardcodes a fact will fail verification.
3. Never write a JSON-LD block. Schema comes from `lib/schema.ts`. If a page needs schema you think is missing, say so in your final report. Do not hand-write it.
4. Never edit `components/ContactForm.tsx`. It is checksum-verified.
5. Never add Review or aggregateRating schema. It renders automatically from `config.reviews`, which you populate only from real reviews supplied in the brief with a source URL.
6. `businessSlug` is a hardcoded string literal from the brief. Never an environment variable. If the brief does not contain it, stop and say so; it is the one thing you cannot proceed without.

Phase 1: Config
Fill `site.config.ts` entirely from `BRIEF.md`.

* Every field the brief supplies gets a real value.
* Every field the brief does not supply gets `null` or an empty array. Do not approximate.
* Pick `schemaType` from the allowlist based on the trade. Landscaping and general outdoor trades use `HomeAndConstructionBusiness`. There is no `LandscapingBusiness` type; it does not exist.
* Service slugs are kebab-case from the service name. Area slugs are kebab-case from the city name.
* For each service, write three to six FAQs based on questions real customers in that trade ask. FAQ answers must be answerable from brief facts. If a natural question requires a fact you do not have (typical price, warranty length), either omit the question or write an answer that explains what determines the answer and invites a quote, without inventing a number.


Optional contact form fields. `config.contactForm` can add a split name, a
property address, a ZIP, a service dropdown, a required email, and a "how soon
do you need this" dropdown. Omit the block entirely and the form is what it has
always been. Fill it only from what the brief says; an extra required field is a
reason a visitor gives up, so do not switch one on because it seems useful.

Whatever you switch on, the posted payload keys never change. Extra answers are
folded into `name` and `message`, because the platform parses only those. Never
add a key to the request: it would be accepted, ignored, and the answer lost.

Then run `npx tsc --noEmit` and confirm the config parses.
Phase 2: Design direction
This phase decides whether the site looks bought or built. It is not optional.
2a. Look at the photos first.
Before choosing anything, view every image in `public/images/originals/`. What is in them determines the design. Note whether they are bright or moody, wide or tight, professional or phone-shot, whether people appear, and whether there is a dominant color.
Write two sentences on what the photography is actually like. If the photos are poor quality or too few to carry a photo-led design, say so now and design around it with type and color instead of fighting it.
2b. Pick one direction and commit fully. A half-applied direction reads as an accident.
Heavy iron (junk removal, excavation, tree service, truck repair, demolition) Charcoal or near-black base, safety orange or amber accent, condensed bold display type (Oswald, Archivo Black, Bebas Neue) against a plain sans body. Hard edges, minimal border radius, heavy rules between sections. Equipment and scale in the photography. Confidence, not polish.
Cultivated (landscaping, hardscaping, lawn care, garden design) Deep green or near-black base with a warm off-white, one muted accent. Serif display face (Fraunces, Instrument Serif, Playfair Display) with a clean sans body. Generous whitespace, large photography, soft radius, unhurried spacing. Restraint reads as expensive here.
Trade professional (HVAC, plumbing, electrical, roofing) Navy or slate base, one strong accent, blue or red, not both. Geometric sans throughout (Sora, Manrope, Space Grotesk) with real weight contrast. Grid-driven layout. Credentials, licensing, and response time get visual emphasis. Trust over beauty.
Showroom (auto detailing, painting, remodeling, flooring) Near-black base, high-contrast photography doing all the work. Thin uppercase letterspaced labels, minimal chrome, tight type. Before-and-after treatment where the brief supplies pairs. The work is the design.
2c. Build the theme for real. Fill `theme.ts` and the Tailwind config. All of these:

* Two faces from Google Fonts via `next/font`. The display face must have character. Never Inter, system-ui, or Arial for headings. Hero H1 at `clamp(2.5rem, 6vw, 4.5rem)`, body 17 to 18px, hard contrast between H2 and body.
* One dark neutral, one warm or cool off-white, exactly one accent. The accent covers under 5% of any page. No gradient text. No purple-to-blue gradient. No pure `#000000` or `#FFFFFF`.
* Hero: full-bleed client photograph with a dark scrim, headline and phone CTA left-aligned in the lower third. Not a centered headline on flat color. If the photos cannot carry it, use a split layout with a large photo on one side and oversized type on the other.
* Sections alternate visual treatment. At least one full-dark section on the homepage. Minimum `py-24` on desktop.
* One button shape, one radius, one accent fill, everywhere. Sticky tap-to-call bar on mobile, always reachable.
* One radius value and one shadow value for the whole site.

Where these live in this template: the two faces are declared in `app/fonts.ts` (swap the `next/font/google` imports, keep the `variable` names); palette, `heroVariant` (`full-bleed` or `split`), `radius`, and `shadow` are in `theme.ts`; the hero H1 size, body size, tap-to-call bar, and full-dark gallery section are already built into the components and read those values. Do not add a second radius or shadow anywhere.
2d. Banned patterns. None of these appear:

* A three-column row of icon cards with one-line labels
* Centered hero headline on flat color with two stacked buttons
* Placeholder or stock-looking imagery of any kind
* Rounded cards with drop shadows floating on light gray
* Emoji used as icons
* A "Why Choose Us" section with checkmarks
* More than two font weights per face doing decorative work

2e. Print the photography assessment, the chosen direction with a one-line reason, and the full `theme.ts`. Then continue.
Phase 3: Images

1. Run `npm run images`.
2. Open `public/images/manifest.json`. For every entry, actually view the image file and write descriptive alt text naming what is depicted and, where honest, the service and city. Ten to twenty words.
3. Verify by filename, not by position. After writing all alts, pick five entries at random, re-view those exact files, and confirm the alt matches. Print the five filenames and their alts in your report.
4. Choose which images go in the hero, service pages, and gallery, and record the choices in `site.config.ts` or the relevant MDX.

Phase 4: Content
Write MDX for the homepage, about page, each service, and each area.
Structure for a service page:

* The page template renders the H1 (`<Service> in <Primary City>`) from config. MDX must not contain a top-level `#` heading; a `#` in any content file fails the build. Body sections start at `##`.
* Opening paragraph: one to two sentences answering who does what, where. This is the extraction target for AI search engines. No slogan fluff.
* Two to four body sections with `##` headings phrased as questions customers ask ("How much does tree removal cost?", "How long does it take?"), not vague labels ("Our Process", "Why Us").
* Facts referenced through components and config interpolation only.

Every content file needs a frontmatter `description` of 140 to 160 characters; the gate measures it.
Area pages must contain content genuinely specific to that area. If you cannot write anything true and specific about a city beyond its name, say so in your report rather than producing filler. Filler area pages are worse than no area pages.
Homepage copy: write it, but flag in your report that the human should rewrite it. Generated homepage copy is the weakest output of this process.
Phase 5: Build, look at it, fix it

1. Run `npm run build`.
2. Start the dev server and screenshot the homepage, one service page, one area page, and the contact page at 390px and 1440px. Eight screenshots.
3. Look at every screenshot. Write down the three things that most make this site look templated or unfinished. Be specific and harsh. "Spacing could be better" is not an answer. "The service grid is a three-column card row that reads as a Bootstrap default" is.
4. Fix all three.
5. Re-screenshot and confirm the fixes landed.

Phase 6: Gate

1. Run `npm run verify`.
2. If it fails, fix and re-run. Maximum three attempts.
3. If it still fails after three attempts, stop. Print the full failure output and what you tried. Do not disable, weaken, or work around a check. A check that is inconvenient is a check that is doing its job.

Phase 7: Report
Commit your work to a branch named `build/<businessSlug>`. Do not merge. Do not push. Do not deploy.
Then print, in this order:

1. The full `npm run verify` output table.
2. The complete `site.config.ts`.
3. The five random alt-text spot checks from Phase 3.
4. The design direction chosen in Phase 2, with its one-line reason.
5. The three templated-looking things found in Phase 5 and what was changed to fix each.
6. UNRESOLVED: every fact the brief left unknown, which config field is null because of it, and which page section is consequently not rendering. This is the list the human acts on.
7. INVENTED: anything you were tempted to fill in and did not. If this list is empty, say so explicitly.
8. Anything you believe is wrong with the template itself.

Do not summarize what you built. The verify output and the config are the report.

Non-interactive (CI) mode
This section applies when the build runs as a GitHub Actions job rather than in a terminal with a human watching. `.github/workflows/aa-build.yml` is the caller. Nothing here relaxes a rule; it only says which steps change shape when there is no one to look at a screenshot.

Three kinds of run. The workflow passes exactly one.

* `site_build` — a new site. Follow all of AGENT.md from Phase 1, reading `BRIEF.md`.
* `site_update` — a change to a site that already exists. Read `INSTRUCTIONS.md` and do only what it asks. Do not re-run the phases that are already done, do not redesign, do not rewrite content the instructions did not name. Every absolute rule and every phase rule still binds whatever you touch: no invented facts, no facts typed into content, no hand-written JSON-LD, config stays the only home for business facts. The gate still runs and still has to pass.
* `go_live` — the one run that may set `launch.indexable` to `true`, and the only exception to absolute rule 7. `INSTRUCTIONS.md` says exactly one thing and you do exactly that: set `launch.indexable` to `true` in `site.config.ts`, change nothing else, run the gate, report. Do not touch content, design, config facts, images or components. Do not "improve" anything you notice on the way past — if something is wrong, say so under item 8 and leave it. A `go_live` diff that touches more than that one boolean is wrong by construction, and the human reviewing the PR is checking the client approved a launch, not re-reviewing a site. Check 21 then expects no robots meta on any page and a normal `robots.txt` with the sitemap line; if the gate is red, the site does not go live.

Tracking installs. A `site_update` whose `INSTRUCTIONS.md` contains a `tracking` block (the Google tag: `googleAdsId`, `conversions.form`, `conversions.call`, optionally `ga4`) is a tracking install, and it is as narrow as `go_live`: write that block into `site.config.ts` as the `tracking` key, exactly as given, and change nothing else. Do not touch content, components, images, other config fields or `launch.indexable`. The tag, the form conversion and the call conversion already render from the block (`components/GoogleTag.tsx`); check 22 then measures the built HTML against it. A tracking-install diff that touches any file but `site.config.ts` is wrong by construction. If a value in the block does not match the schema, stop and say so under item 8; never guess or reformat an id or a label.

What changes in CI.

* Phase 5 screenshots are skipped. There is no browser and no dev server. Run `npm run build` instead, and replace steps 2 and 3 with a written self-check: read your own `theme.ts`, the components you changed, and the MDX you wrote, then name the three things most likely to make this site read as templated, judged against the Phase 2d banned-pattern list and the Phase 2b direction you committed to. Be as specific as Phase 5 demands. Fix all three and say what you changed. "I could not see it so I could not tell" is not an answer; the banned-pattern list is checkable by reading the code.
* Phase 7 is unchanged except that it matters more: `BUILD-REPORT.md` is the only output a human will read. Still commit to `build/<businessSlug>`. Still do not push, do not merge, do not deploy, do not open a pull request. The workflow pushes the branch and opens the PR; if you push, you race it.
* The brief is an input, not a working file. `BRIEF.md` (or `INSTRUCTIONS.md`) is written by the workflow from the dispatch payload. Read it as many times as you like. Never edit it, never reformat it, never "correct" it, never delete it. If it contradicts itself or omits `businessSlug`, stop and say so in `BUILD-REPORT.md` — that is the signal the human needs, and silently patching the brief destroys it.

Client files and the old site. The workflow writes these before you start; read them, never edit them.

* `ASSETS.json` lists what it downloaded into `public/images/originals/` from the ops intake (`saved`) and what it could not (`skipped`), each with `kind` (`photo` or `logo`), `caption`, `heroCandidate`, `service` and `beforeAfter`. These are the client's own photographs; they lead the site. When at least one photo was saved, the workflow has already removed the `sample-*` placeholders from `originals/`. Remove every remaining `sample-*` file under `public/images/` and every reference to one, and no config field may point at a sample file.
* Hero: the `heroCandidate` photo if there is one, judged by Phase 3; otherwise the finished-job photo with the fewest distractions. Reject a frame with a neighbor's house, a chain link fence, a meter, a readable house number, a car or a person in it. Hero alt text stays generic: no town, no business name.
* A photo with a `service` goes to that service's `services[].image`. A service with no real photo gets `null`, never a sample or a borrowed image. The rest go to `images.gallery`, ordered with `after` photos first and `before` photos last. The `logo` file is the site logo.
* Use each `caption` when you write that image's alt text in Phase 3, after viewing the image; the caption says which job and which town, the image says what is in the frame.
* `OLD-SITE.json` (if present) is the client's old website and how to use it. `verbatim`: fetch it and carry its copy and page structure over, fixing typos, removing em dashes and keeping its SEO phrases; every business fact still goes through config. `facts_only`: read it only for services, service area, phone, hours and years in business, and write fresh copy. `ignore`: do not fetch it. Anything you take from it that the brief does not also state is reported under item 7 with the page it came from.
* Write `CLIENT-TODO.md` listing every page or service that has no real photo, and anything else the client still owes. The human sends it to the client.
* In `BUILD-REPORT.md`, name the hero photo you chose and why, and state how many photos from `ASSETS.json` you placed and how many you left out, with the reason for each one left out.

Stock photos. `STOCK.json` exists only when Jacob asked for a stock build and the client sent no photos. Its `saved` files are in `public/images/originals/` as `stock-*`, each with the service it was searched for and one `heroCandidate`. View every one before placing it and reject any with a face, a logo, another company's truck or uniform, a neighbor's house, a meter or a readable house number. Place them the way client photos are placed (hero, each service's image, then the gallery), and they are the one exception to rule 2e's ban on stock. Every stock file you placed goes in `CLIENT-TODO.md` under "Stock photos to replace with real ones", by page. If `STOCK.json` has no `saved` files, build without images under rule 2e and quote its `skipped` reason in item 6 of the report. A stock site is a preview, never a go-live.

Forbidden in CI, without exception. Each of these makes the gate pass while the thing it guards is broken, which is worse than a red build:

* `npm run seal-contact-form`. It re-baselines the checksum to whatever the form currently is. In a client repo it does not fix check 4, it blinds it.
* Editing `components/ContactForm.tsx` or `scripts/contact-form.sha256`.
* Editing `lib/config-schema.ts`. The endpoint and honeypot constants live there and checks 5, 6 and 20 are measured against them.
* Editing `lib/content.ts`. Removing `blockJS: false` makes every `{config.*}` in content render as an empty string with a green build.
* Editing `next.config.mjs`. `output: 'export'` is what produces the `./out` the gate inspects.
* Editing anything under `.github/`. The workflow does not edit itself.
* Editing or weakening `scripts/verify.ts`, `scripts/verify-limits.ts`, `scripts/contrast-check.ts`, or `lib/hero-scrim.ts`.
* Setting `launch.indexable` to `true` on a `site_build` or `site_update` run. Only `go_live` touches it.
* Editing `app/robots.ts` or the `robots` block in `app/layout.tsx`. Both read the flag; the flag is the control surface, not the code.

If a change you believe is correct requires one of these files, do not make it. Write what you wanted to change and why under item 8 of the report, and let the human decide in the template repo.

Failure. Phase 6 still allows three `npm run verify` attempts. If the gate is still red after the third, stop. Do not try a fourth, do not disable a check, do not edit a check's thresholds, do not delete a content file to dodge one. Write into `BUILD-REPORT.md`: the full final verify table, every failing check number with its detail string, what you tried on each attempt, and what you believe the fix is. Then commit what you have to `build/<businessSlug>` and finish. A red branch with an honest report is a usable result; a green branch with a weakened gate is not.
