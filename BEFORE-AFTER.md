# Before and after pairs

The slider on the homepage and the service pages renders nothing until there
is at least one pair in `site.config.ts`. That is deliberate: an empty section
is correct, a fabricated one is not.

## Adding a pair

One command, from this folder:

```bash
npm run add-pair -- \
  --label "Interior" \
  --before ~/Downloads/dirty-seats.jpg \
  --after ~/Downloads/clean-seats.jpg \
  --alt-before "Dirty rear seats with sand and pet hair" \
  --alt-after "The same rear seats after a Gold Package" \
  --caption "Gold Package, same day" \
  --service gold-package
```

`--label`, `--before`, `--after`, `--alt-before` and `--alt-after` are
required. `--caption` and `--service` are optional; `--service` limits the
pair to one service page, and without it the pair shows everywhere.

The script writes both files to `public/images/before-after/`, inserts the
entry into `site.config.ts`, runs the typecheck and the gate, and prints the
git command. It never commits for you.

## What the script does for you

- Center-crops whichever photo has the wider aspect ratio so both end up
  **identically framed and identically sized**. If they do not match exactly
  it refuses to write the pair rather than shipping a slider that jumps.
- Resizes to a 1600px long edge, or to whatever the smaller photo can reach
  without being upscaled.
- Strips every piece of metadata, including GPS.
- Sets `orientation` from the finished pixels. Portrait pairs get a 4:5 stage
  capped at 520px with the copy beside it; landscape pairs get the wide stage
  with the copy above.

## What the script cannot check, and you must

A slider is a claim about one car. These are the rules:

1. **Same vehicle.** Never two different cars. A visitor can see it.
2. **Same angle, roughly.** Shot from the same spot, framed the same way.
3. **Genuinely dirty, then genuinely finished.** Not a foam shot paired with a
   finished shot: foam is the middle of the job, not the start of it.
4. **No license plates.** Crop them out, do not blur them.
5. **No customer faces.** Crew faces are fine on the About page only.
6. **Nothing synthetic.** No AI-generated images, no stock, and never degrade
   or filter a clean photo to manufacture a "before".

If a pair breaks any of those, leave it out. The section hiding itself costs
nothing. A pair that looks staged costs the client trust on the one part of
the page that is supposed to be proof.

## Current state

`beforeAfter` is empty. The client's 2025 ad video was scanned at 0.5 second
intervals for a usable pair and contains none: it is a single shoot of one
green BMW M4 that is already clean in every frame, most frames carry burned-in
captions, and a readable Florida plate appears around the 46 second mark.

The first thing to ask the owner for is three real pairs. Phone photos are
fine.
