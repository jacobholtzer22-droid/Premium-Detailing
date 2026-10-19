# Client Brief: Premium Detailing

Anything not in this brief does not appear on the site. Facts are tagged [site] (premiumdetailingpsl.com, WordPress, read 2026-10-18), [gbp] (the Google Business Profile, read 2026-10-18), or [review] (public Google review text). No facts came from the owner directly yet; everything here is client-published or public. List every fact you use in the report. Where sources disagree, [gbp] wins for name, address, phone, and hours; [site] wins for service descriptions and prices.

## Business identity

- Display name: Premium Detailing [gbp][site]. Legal entity name: UNKNOWN (the old site never shows an LLC or Inc).
- Trade: auto detailing packages (Bronze, Silver, Gold), ceramic coating with paint correction, paint protection film, and window tint [site]. GBP category: "Car detailing service" [gbp]. GBP description: "Professional car detailing service specializing in ceramic coating and paint protection." [gbp]
- Mobile: "5 Star Detailing, Brought to your Door Step." is the old site's H1 [site]; twenty-five of the sixty-eight most recent reviews say the team came out to the customer's house or driveway [review]. Position the detailing packages as mobile, we-come-to-you. Several photos show a garage with hexagon LED lighting, so coatings may happen at a shop; do not claim a shop and do not claim coatings are mobile. UNRESOLVED: mobile only, or shop plus mobile.
- In business since 2011: "Restoring cars to better than new since 2011" [site]. Years in business: 15 as of 2026.
- Reviews: 449 Google reviews, 5.0 rating, as of 2026-10-18 [gbp]. The old site says "410+" and "414+" [site]. Put the count in config as `reviewCount: 440` and write "more than 440 five-star reviews on Google" everywhere the number appears, from config, never typed into MDX.
- Trusted by businesses: "Car dealerships, companies and clients with very high end cars in the Port St. Lucie all trust us" [site]. You may write "trusted by local dealerships and businesses in Port St. Lucie".
- Owner: reviews name "Chris" (sometimes "Kris") and a tech named "Sebastian" [review]; the video file is named "Chris Detailing Ad 2025" [site]. Do not use either name in copy. UNRESOLVED: confirm the owner's name and whether he wants it on the About page.
- Vehicles handled per reviews: cars, trucks, SUVs, a motorcycle, a side-by-side [review]; a red motorcycle appears in the GBP photos [gbp]. You may write "cars, trucks, SUVs, and motorcycles". Boats appear only in the logo silhouette; do not claim boats. UNRESOLVED.
- Service area: "proudly serving Port St. Lucie and the Treasure Coast area" [site]; "St. Lucie County" [review]. Radius UNKNOWN.
- Words to avoid everywhere: licensed, insured, bonded, certified, guaranteed, guarantee, lifetime, permanent, warranty, "best in", cheapest, "#1", emergency, 24/7 (even though the GBP shows 24 hours), any coating brand name, any film brand name, any competitor name, "shop" or "studio" as a place customers visit.

## Platform

- businessSlug: `replace-before-launch` (placeholder; the human swaps in the real platform slug after the client signs up)
- Domain: `https://www.premiumdetailingpsl.com` (the client's existing domain, currently serving the WordPress site; the new site deploys first on a Vercel URL with prelaunch: true, and DNS moves at launch). www is primary; the apex redirects to www.

## Contact

- Phone: (772) 302-0717, E.164 `+17723020717` [gbp][site].
- Email: premiumdetailingpsl@gmail.com [site].
- Published address: 864 SW Piedmont Ct, Port St. Lucie, FL 34986 [gbp][site]. It is shown on both the GBP and the old site's footer, so it may be published here too. It looks like a residential street; UNRESOLVED whether the owner wants it on the new site. Put "864 SW Piedmont Ct" in address.street.
- Lat/lng: 27.2964554, -80.3928873 [gbp].
- Hours: the GBP shows "Open 24 hours" every day [gbp]. Mirror that in config so NAP matches Google, but display the hours line as "By appointment, seven days a week" wherever the template prints hours, and never write "24/7" or "24 hours" in prose. UNRESOLVED: real hours.
- Booking: the old site books through LeadConnector (GoHighLevel) calendars [site], one per package:
  - Gold: https://api.leadconnectorhq.com/widget/booking/5EXJwsToTNOyza8OKOB0
  - Silver: https://api.leadconnectorhq.com/widget/booking/K4lPRLc5picjsYtGzs39
  - Bronze: https://api.leadconnectorhq.com/widget/booking/KfMx0UuW6ZhHpIRgeqLe
  - Ceramic Coating: https://api.leadconnectorhq.com/widget/booking/bY1BbL4jeSiarEogmqIz
  - General calendar: https://api.leadconnectorhq.com/widget/booking/68wmrQM17x8rmH1F7gqa
  The GBP "Appointments" link points at keap.app [gbp]. Use the LeadConnector links on the /book page (section 4C). UNRESOLVED: whether he still uses these calendars, and whether he wants quote requests to go to the platform form, the calendars, or both.

## Services (in this order)

Before writing each service page, read the saved HTML of the matching old-site page (section 2 downloads live in `~/Downloads/premium-photos/`; fetch the HTML of each page below into `~/Downloads/premium-old-site/` with `curl -L -A "Mozilla/5.0"` first). Everything taken from those pages is [site]. General detailing knowledge (what a clay bar does, why a coating beads water) is allowed; specific claims about this company are not unless they are in this brief or on those pages. Starting prices below are [site] from /book-now/ and live only in config.

### Service 1: Bronze Package
- slug: bronze-package. Old page: /bronze-package/
- Starting price: 125. Price note: "Starting price; final quote depends on vehicle size and condition."
- Includes [site]: exterior wash, tire shine, vacuum, wipe-down. "perfect for someone looking to maintain a vehicle that is already relatively clean."
- Old page's four points [site]: Quick Refresh, Budget-Friendly Care, Interior Freshness, Everyday Protection.
- Customer questions: how long does it take (UNKNOWN; say the booking confirms the time window)? how often (the old page says "regular upkeep"; suggest monthly as general advice, not a company policy)? do you come to me (yes, packages are mobile)? what do I need to provide (UNKNOWN: water and power access; ask, do not state)?

### Service 2: Silver Package
- slug: silver-package. Old page: /silver-package/
- Starting price: 225. Same price note.
- Includes [site]: everything in Bronze, plus exterior wax and a light interior detail. "perfect for the person looking to focus on making their exterior look perfect."
- Old page's four points [site]: Enhanced Shine, Balanced Care, Light Interior Detail, Affordable Upgrade.
- Reviews mention a clay bar added to a Silver [review]; you may list "clay bar treatment" as an add-on with price UNKNOWN (no number).
- Customer questions: Bronze or Silver? how long does the wax last (UNKNOWN; say weeks, not months, as general knowledge, or skip)? is the interior included (light interior only: vacuum and wipe-down)?

### Service 3: Gold Package
- slug: gold-package. Old page: /gold-package/
- Starting price: 325. Same price note.
- Includes [site]: everything in Bronze and Silver, full exterior detail, full interior detail "hitting parts of your car you didn't know needed to be cleaned", paint meticulously detailed, "our proprietary protection blend to protect your car for a minimum of 45 days".
- Old page's benefit list [site]: Complete Interior Deep Clean, Showroom-Quality Finish, Full Protection Package, Healthier Interior, Boosts Resale Value, Time-Saving Maintenance, Luxury-Level Detailing, Peace of Mind, Tire and Trim Renewal, Odor Removal.
- Reviews mention seat shampoo, dog hair, and sand removal [review]; you may write "seat shampoo, pet hair, and sand" as things the Gold handles.
- Customer questions: Gold or Silver? pet hair and stains (yes)? odor removal (yes [site])? how long (UNKNOWN)? is the forty-five-day protection a coating (no, a protection blend; write it in words, no number trap here, but keep it as "at least forty-five days")?

### Service 4: Ceramic Coating & Paint Correction
- slug: ceramic-coating. Old page: /ceramic-coating/ (it carries both the coating and the "Paint Correction & Enhancement in Port St. Lucie and Treasure Coast" section)
- Starting price: 750. Price note: "Starting price for the coating; paint correction is quoted after a paint evaluation."
- Includes [site]: ceramic coating ("a chemical polymer solution applied to the exterior to protect it from external paint damage"), paint correction and enhancement for swirl marks, scratches, and faded paint, "a durable ceramic coating that enhances gloss and protects your car for years".
- Four-step process [site]: 01 Paint Evaluation, 02 Paint Correction / Polishing, 03 Ceramic Coating Protection (hydrophobic, UV, contaminants), 04 Final Detail & Inspection.
- Benefits list [site]: Long-Lasting Protection, Enhanced Gloss & Shine, UV & Oxidation Resistance, Hydrophobic Effect, Scratch & Chemical Resistance, Easier Maintenance, Boosts Resale Value, Heat Resistance, Stain Resistance, Anti-Aging for Paint.
- Reviews mention a five-year coating, interior coating, and tire coating [review]; you may write "coating packages up to five years" and "interior and tire coatings available" with no price. Do not write "permanent".
- Customer questions: how long does a coating last (up to five years depending on the package [review]; no brand)? is paint correction required first (the process says evaluation first)? can I wash it normally after (general: yes, hand wash, no automatic brushes)? does it stop rock chips (no, that is PPF; link to it)?

### Service 5: Paint Protection Film
- slug: paint-protection-film. Old page: /ppf/
- Status: the old /book-now/ page shows "Coming Soon" for PPF with a starting price of 3999 [site]. Build the page, show the starting price from config with the label "Coming soon", and make every CTA on it a quote request, not a booking. UNRESOLVED: whether PPF is bookable now.
- Includes [site]: "a nearly invisible, durable layer applied to your vehicle's paint to protect it from chips, scratches, stains, and road debris", self-healing top layer with heat or sunlight, gloss or matte applications, preserves the factory finish.
- Old page's four points [site]: Durable Protection, Self-Healing, Invisible Shield, Long-Lasting Value. Benefits list [site]: Scratch & Chip Resistance, Self-Healing Technology, UV & Stain Protection, Preserves Factory Finish, Invisible Protection, Long-Lasting Durability, Boosts Resale Value, Hydrophobic Properties, Custom Fit, Peace of Mind.
- Customer questions: PPF or ceramic (film stops chips, coating adds gloss and easy cleaning; both together is common)? full front or full car (UNKNOWN packages; invite a quote)? can you see it (nearly invisible [site])?

### Service 6: Window Tint
- slug: window-tint. Old page: /tint/
- Status: "Coming Soon" on /book-now/ with a starting price of 399 [site]. Same treatment as PPF: page built, price shown with "Coming soon", CTAs are quote requests. UNRESOLVED: whether tint is bookable now, and which film.
- Includes [site]: reduces heat, "blocks up to 99% of harmful UV rays", increases privacy, sleek appearance.
- Old page's four points [site]: Cooler Rides, UV Protection, Added Privacy, Sleek Appearance. Benefits list [site]: UV Protection, Heat Reduction, Glare Control, Privacy & Security, Interior Preservation, Energy Efficiency, Stylish Appearance, Shatter Resistance, Weather Comfort, Skin Protection.
- Customer questions: is it legal in Florida (answer only with the general fact that Florida sets VLT limits by window and the shop tints to legal limits; no percentages)? ceramic tint (UNKNOWN film type; do not claim)? how long until I can roll the windows down (general: a few days; say "we will tell you at the appointment")?

## Offer

- None published. config.offer: null. Do not invent one.

## Contact form

- Ask for first and last name separately? no
- Ask for the property address? off
- Ask for a ZIP code? optional (mobile service; the ZIP tells him whether a job is in range)
- Show a dropdown of the services above? yes, the six services in order, plus "Not sure yet"
- Require the email address? no
- Timeframe dropdown: label "When do you want it done?", options "This week", "Within a month", "Just getting prices", required no
- messageLabel: "Tell us about your vehicle"
- messagePlaceholder: "Year, make, and model, and what you want done: a package, ceramic coating, tint, or paint protection film."
- submitLabel: "Get My Quote"

## Service areas

- Primary city and state: Port St. Lucie, FL
- Area pages (config.serviceAreas, in this order): Fort Pierce, Stuart, Palm City, Jensen Beach, Vero Beach. All are Treasure Coast towns [site says Treasure Coast]; the owner has not confirmed any of them. Write short area pages from true, widely known facts (coastal salt air, sun and UV on paint and interiors, gated communities, boat-trailer and truck owners, snowbird season). If you are not confident a sentence is true, cut it. Report any page you consider thin.
- Coverage (config.coverage):
  - St. Lucie County: Port St. Lucie, St. Lucie West, Tradition, Fort Pierce, Lakewood Park, White City, Hutchinson Island
  - Martin County: Stuart, Palm City, Jensen Beach, Hobe Sound, Sewall's Point
  - Indian River County: Vero Beach, Sebastian
- UNRESOLVED: service radius, and whether he charges a travel fee beyond it.

## Hours

- Config: every day 00:00 to 23:59, America/New_York, to match the GBP [gbp]. Display string wherever hours print: "By appointment, seven days a week".

## Profile URLs

- Google Business Profile: https://www.google.com/maps?cid=15187933252334437823 [gbp]
- Review link the old site uses: https://share.google/c74H92ObjC9aOQCWb [site]. Use it for any "Leave a review" link; otherwise leave it out.
- Facebook: https://www.facebook.com/Premiumdetailingg [site]
- Instagram: https://www.instagram.com/premiumdetailing__ [site]
- TikTok: https://www.tiktok.com/@premiumdetailingg [site]
- Old site Google Tag Manager container: GTM-KSSMBN92 [site]. Do NOT add it. CLIENT-TODO asks whether he wants it carried over.

## Testimonials

Nine real five-star Google reviews, copied verbatim on 2026-10-18 [review]. Show them in a visible testimonials section with first name and last initial, no star icons generated from data, no platform logos, and NO Review or AggregateRating JSON-LD (Google treats a business marking up its own Google reviews as self-serving; the visible section is enough). config.reviews stays [] if populating it would emit schema. A single text link under the section reads "Read all reviews on Google" and points at the GBP URL.

1. Christopher C.: "Premium Detailing did an absolute 10/10 job on my truck! They brought out an unbelievable shine on the paint and cleaned the wheels and tires spotless. The interior seats and floor mats look showroom-ready. Professional, thorough, and top-tier service right here in St. Lucie County. Will definitely use again!"
2. Corey K.: "Brought my 2026 truck in for a ceramic coating, wow, my truck came out. Amazing! They coated the entire vehicle in including the tires with this permanent tire coating, and it looks absolutely fabulous, extremely satisfied with the work done today!"
3. Witz-Berline J.: "They just did a silver package and a clay bar and made my car look absolutely brand new. This is a six-year-old car and I've never seen it. Look this good even when I took it off the lot. Extremely satisfied with the work done today."
4. Owen D.: "I just had my brand new truck ceramic coated by them, it looks absolutely amazing and better than the first day that I bought it. Extremely excited for the future on how easy it is going to be to maintain this vehicle now! Thank you guys, I really appreciate it."
5. Ryan U.: "Chris really hooked me up!! I called him with an emergency and he helped me out on a weekend!! They did an amazing job on the detail and the car has never looked better. I highly recommend him for all your detail needs!!"
6. Janessa C.: "My car was trashed. The seats were stained in the inside was really dirty but now my car looks amazing! They did a shampoo on the seats and got out the dog hair and sand that was on the inside. Extremely satisfied."
7. Tara E.: "I just received a five-year coating on my brand new bmw x7! Insane how amazing my cars looks now! I'm so happy ! They even ceramic coated the inside too! I couldn't be happier !"
8. Michael P.: "This company made my car look brand new and it's a 2019, it's black paint so it's very difficult to take care of but I'm extremely satisfied with the work that was done today! Thank you guys so much. I really appreciate you for putting a good coat of wax on my paint."
9. John P.: "Chris and His team came out to do a bronze package on my 2016. And it looks better than ever period extremely satisfied with the work that was done today period highly recommend them!"

(Review 2 says "permanent tire coating" in the customer's words; that is fine inside a quote and nowhere else. Reviews 5 and 9 name Chris; that is the customer's wording and stays.)

## Photos

Filled by section 2 of the build prompt. Hero, About image, service images, gallery, process tiles, and the optional hero video come from the section 2 table. Before/after pairs: only true pairs, per section 2 step 10; expected to be empty at first build.

## Brand notes

- Logo: red arched "PREMIUM DETAILING" wordmark over blue vehicle silhouettes (car, boat, van) [gbp][site]. Files: `thumb_image-1-2.png` (transparent, 375x194, small) and GBP photo 44 (on white, larger). Sample the exact red and blue from GBP 44.
- Palette direction: "showroom black". Near-black navy surfaces for header, footer, and the CTA band; off-white content sections alternating with white cards; the logo red as the ONE accent (buttons, section rules, the slider handle, active tab). The logo blue stays inside the logo and nowhere else. No gradients except the photo scrim in the hero. Avoid the generic detailing-site look of pure black plus a neon accent.
- Phrases the owner's site uses [site]: "5 Star Detailing, Brought to your Door Step", "Premium Work, Every Time", "Restoring cars to better than new since 2011", "peace of mind and protection designed to last", "Trusted By Thousands, Backed By Experience".
- Competitors: none named. Never name one.

## UNKNOWN (each becomes null or is left out; this is the list to chase)

- Real platform businessSlug (placeholder in use)
- Before/after photo pairs (none exist in either source)
- Legal entity name (LLC?)
- Owner's name and whether it goes on the About page; whether GBP photo 45 is him
- Mobile only, or shop plus mobile; where coatings, PPF, and tint are done
- Real hours (GBP says 24 hours)
- Whether the published street address should stay on the site
- Service radius and travel fee
- Whether PPF and tint are bookable now; which film brands
- Whether the LeadConnector calendars are still in use; where quote requests should go
- Add-on prices (clay bar, engine detail, seat shampoo, interior coating, tire coating)
- Coating packages and durations (reviews mention five years)
- Boats and RVs: yes or no (the logo shows a boat)
- Vector or high-resolution logo
- Whether to carry over GTM-KSSMBN92
- Whether the Facebook, Instagram, and TikTok links are current
- Original full-resolution photos (the GBP and WordPress copies are compressed)
