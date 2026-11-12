# Build report: premium-detailing (site_update)

Instruction: change only the three package prices (Gold $360, Silver $260, Bronze $160).

## Price changes

| Package | Old  | New  |
|---------|------|------|
| Bronze  | $150 | $160 |
| Silver  | $250 | $260 |
| Gold    | $350 | $360 |

All three prices live in one place, the `PKG` constant in `site.config.ts`. Everything that shows them reads that constant: the Mobile Detailing tier cards, the service's "from" price, the homepage pricing FAQ ("Bronze starts at $160, Silver at $260 and Gold at $360"), the server-side Flyra booking price, and the Offer prices in the JSON-LD from `lib/schema.ts`. No JSON-LD was written by hand. I checked the built HTML: $250 and $350 no longer appear anywhere, and $260 and $360 appear on the pages that show packages. The $150 figures still on the site are other prices: the pressure washing driveway, the headlight restoration add-on, and the low end of the schema price range, which comes from pressure washing.

### Files changed
- `site.config.ts`: the three `PKG` values. Nothing else changed.
- `scripts/booking.test.ts`: the booking test pins each bookable package's price, so it had to change with the config or `npm test` fails. Only those three numbers changed. All 34 tests pass.

## 1. Verify output

```
#   check                                                                   result  detail
--- ----------------------------------------------------------------------  ------  ------
1   site.config.ts parses against schema                                    PASS    
2   businessSlug and identity are filled in (not the template sample)       PASS    slug "premium-detailing"
3   businessSlug exists in the live platform database                       PASS    platform confirmed slug "premium-detailing"
4   components/ContactForm.tsx matches sealed checksum                      PASS    10499ee5c991
5   built HTML posts to the www contact endpoint, never the bare apex       PASS    endpoint on /contact, /services/dealerships-fleet
6   honeypot hp_7d3a_ref inside hidden wrapper, no "company" field          PASS    
7   content/ contains no bare phone, address, email, or price               PASS    
8   no placeholder tokens in content/ or site.config.ts                     PASS    
9   every JSON-LD block parses, has @context/@type, all types on allowlist  PASS    
10  Review/aggregateRating only with real, visible reviews                  PASS    
11  every image has a 15+ char alt; no two images share an alt              PASS    
12  exactly one <h1> per page                                               PASS    
13  titles unique, 30 to 60 chars as rendered                               PASS    
14  meta descriptions present, unique, 140 to 160 chars                     PASS    
15  canonical present on every page and matches config.domain               PASS    
16  sitemap lists every built route and nothing else                        PASS    
17  every internal link resolves to a built route                           PASS    
18  no blank MDX interpolation in rendered text                             PASS    
19  text over the hero photo meets WCAG AA (4.5:1)                          PASS    nothing measured: heroVariant is "split": no text sits on a photograph

19/19 checks passed across 32 pages.
All checks passed.
```

## 2. site.config.ts

Only the `PKG` block changed in this run (see the diff in this commit). The full file is `site.config.ts` in this branch.

## 3. Alt-text spot checks
Not applicable. No images were touched in this run.

## 4. Design direction
Unchanged. This run did not touch design.

## 5. Templated-looking things
Not applicable. This run did not touch layout or content.

## 6. UNRESOLVED
This run added no new unknowns.

## 7. INVENTED
Nothing was invented.

## 8. Issues for the human: please read
- **The 5-Detail Bundle's "saving" figure no longer matches.** `specials.bundle` says $500 for five Bronze details and prints a saving of $250. That was 5 × $150 − $500. At the new Bronze price of $160 the real saving is $300. The schema says `saving` is printed, not computed, and the instructions said not to change other prices, so I left it at $250. The site still says "saving $250". Please confirm with the client whether the bundle should stay at $500 (and the saving become $300) or change price, then update `specials.bundle` to match.
- **The monthly plans ($125 per visit for Bronze, $210 per visit for Silver) did not change.** They are still cheaper than the packages, but the discounts are now larger than before. Please confirm the client wants them to stay as they are.
- **Flyra's own price book is not part of this repo.** If Flyra stores its own prices for "Bronze/Silver/Gold Package", those need to be updated in Flyra as well.
