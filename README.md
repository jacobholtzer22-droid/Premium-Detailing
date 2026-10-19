# aa-site-template

Static Next.js 14 template for Align & Acquire client sites. Facts live only in `site.config.ts` (Zod-validated), prose in `content/*.mdx`, schema is derived in `lib/schema.ts`, design in `theme.ts` + `app/fonts.ts`, and `scripts/verify.ts` gates every build.

## Per-client workflow

1. Use this template on GitHub. Name the new repo after the client. Clone it, `npm install`.
2. Copy `BRIEF.template.md` to `BRIEF.md` and fill it in from what the client actually supplied.
3. Delete the `sample-*.jpg` files and drop the client photos into `public/images/originals/`.
4. Open Claude Code in the repo and tell it to follow `AGENT.md`.
5. Review the UNRESOLVED and INVENTED lists in its report. Rewrite the homepage copy.
6. Verify the slug against the live database, merge the `build/<slug>` branch, deploy `main` to Vercel (build `npm run build`, output `out`).

## Commands

`npm run dev` · `npm run images` (WebP + `manifest.json`, alts preserved on re-run) · `npm run build` · `npm run verify` (build + 17-check gate, non-zero on any failure) · `npm run typecheck` · `npm run seal-contact-form` (template repo only).

## Notes

- **Check 3 fails until `/api/verify-slug` exists on the platform.** Until it does, confirm `businessSlug` by hand against the `Business.slug` column in Neon before step 6. A wrong slug loses every lead from the site.
- **`output: 'export'` is deliberate; do not remove it.** It turns any page that accidentally becomes dynamic (reads headers, cookies, or searchParams) into a build failure instead of a silent serverless function, and it means `verify.ts` inspects the exact HTML bytes Vercel will serve. The costs do not apply here: images are pre-processed by `scripts/process-images.ts` (no `next/image`), the form posts to the platform (no route handlers), and redirects from an old site belong in `vercel.json`, which works with static output.
- Checks 2 and 3 fail on the shipped sample by design; everything else must pass before any merge.
