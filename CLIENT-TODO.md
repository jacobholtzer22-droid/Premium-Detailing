# Questions for Chris, Premium Detailing

Nothing on the site was invented. Every answer below is a gap the site is
currently working around, and each one makes a specific part of the site
better or turns a placeholder into the real thing.

Updated 2026-11-11 against your 8 November list. The shop address question is
answered and done: 2190 NW Reserve Park Trace, Suite 14 is now the address
everywhere on the site, on a map on the contact page and on every page for work
done at the shop, and 864 SW Piedmont Ct is gone.

## Blocking the Flyra booking flow (for Jacob, not Chris)

The booking flow is built and tested and is switched OFF, because two things
are missing. Neither needs any code.

A. **FLYRA_API_KEY in Vercel decrypts to an empty value.** It is listed on the
   project for Production (added 2026-11-11) but `vercel env pull` returns
   `FLYRA_API_KEY=""`, so the value never got saved. It is also absent from
   Preview entirely, which means the preview deploy cannot book anything even
   once the value is fixed. Add it again to **Production and Preview**.
B. **The two tech ids are not in config.** `config.booking.techIds` is an empty
   array. They come from `GET /employees` on the Flyra API for Evan Russo and
   Schuyler Clawson, which could not be called without the key above. Paste the
   two ids in and the flow turns itself on.

Until both are done, every package card falls back to a quote CTA and the
booking panel shows "we cannot load the calendar, call us" with the phone
number. Nothing is broken and no lead is lost; online booking is simply not
offered yet.

## Top of the list

1. **Window tint: do you still offer it, and at what price?** It is not in your
   Flyra price book. The tint page is live and UNCHANGED at its old starting
   price because you did not answer, which means the site may be advertising a
   service you have stopped doing, at a price that may be wrong. If you have
   stopped, say so and the page comes down with a redirect.
2. **Years wording.** Pick one: "Detailing since 2011, Premium Detailing since
   2017", or founded 2017 and nine years everywhere. The site still says 2011
   and fifteen years in business because you did not pick, so the About page,
   the homepage copy and the stats strip are all still on the old wording.
3. **About page content.** A founder story in your own words, a photo of you or
   the team or the shop, and the link to the WPTV clip. The page has a founder
   section wired up that renders nothing until these exist. It is the thinnest
   page on the site.
4. **Meta pixel id and GA4 id**, if you want either. Neither is installed. The
   Google Ads tag is live and working.
5. **A follower count for Instagram or TikTok, with the date you read it**, or
   confirm we leave it off. The "20K followers" line has been removed: it was
   read on 19 October and a visitor can check it in one tap.
6. **The Gold Package used to promise "our protection blend, at least
   forty-five days".** Your new price book describes the protection as "wax or
   spray sealant" at the Silver level, so that forty-five day claim has been
   taken off the site rather than reconciled with it. If the blend is still a
   real thing and still lasts that long, say so and it goes back.
7. Do you want booking for paint protection film, paint correction and window
   tinting, or quote requests only? They take quote requests today, and
   ceramic coating now does too, because which of the three coating packages a
   car needs is decided at the paint evaluation.

## Photos and brand

3. Send 3 before-and-after photo pairs (same car, same angle, phone photos are
   fine). None of the 39 photos you sent on 19 October had a dirty state, so
   the before-and-after slider still has nothing to show.
4. Send original full-resolution photos and the logo file (a vector or a large
   PNG).
5. Is the man holding the loyalty card in your Google photos you, and do you
   want a photo of yourself on the About page?
6. Can we use the two-person photo of your crew polishing the grey BMW? The
   shirt in it carries another company's name and phone number, so it is off
   the site for now.
7. The V.I.P loyalty card in that photo offers a free wash after five visits.
   Is that offer still running, and do you want it on the site?
8. Your 2025 ad video has captions burned into it, including "DISCOUNT" and
   "TAKE ... NOW". We used only the last three seconds, which have no captions,
   because the site cannot advertise a discount that is not confirmed. Is that
   discount still running, and can you send a version without the captions?
9. Six of the 39 photos are off the site because a Florida plate is readable
   and could not be cropped out cleanly: the black Corvette from the rear, the
   grey Super Duty from the rear, the silver Ferrari, both motorcycle shots by
   the van, and the Suzuki in front of the van (that one is your own van's
   plate). Resend any of those shot from a different angle and they go back in.

## What you actually offer

10. Which film brands do you use for paint protection film and tint?
11. What coating packages do you sell, and how long does each last? A review
    mentions a five-year coating.
12. What do the add-ons cost: clay bar, engine detail, seat shampoo, interior
    coating, tire coating? The site lists them by name with no price.
13. Your van lists vinyl wrapping. Do you want a vinyl wrap page, or is that
    service retired?
14. Do you do boats and RVs? Your logo shows a boat, and one of the new photos
    is a motorhome, but no review mentions either.

## Running the business

15. What are your real hours? Your Google profile says open 24 hours, so the
    site currently says "By appointment, seven days a week".
16. How far do you travel, and do you charge a travel fee past a certain point?
    Jupiter is now listed as the southern edge of the range.
17. Do you want 864 SW Piedmont Ct shown on the site? It is on your Google
    profile and your old site, but it looks like a home address.
18. What is the legal name of the business? Is there an LLC or Inc?
19. Do you want your first name used anywhere on the site? Customers use it in
    reviews but the site does not.

## Social and reviews

20. To show a live Instagram feed and a live follower count, the account has to
    be connected through Behold or the Instagram Graph API. The six reels on the
    site are still pasted by hand. The "20K followers" line has been REMOVED
    (it was read on 19 October and nothing replaced it). Do you want the
    account connected?
21. Are the Facebook, Instagram and TikTok links on your old site still current?
    There is no Yelp link; do you have one?

## Technical

22. ANSWERED and done: the LeadConnector calendars are gone. Booking now goes
    into Flyra directly. There is no GoHighLevel link left on the site.
23. Quote requests still go to the website form, which reaches the Align and
    Acquire platform. Getting those into Flyra as leads is a change on the
    platform side, not on this site.
24. Do you want the Google Tag Manager container from your old site carried over?
25. A live Instagram feed needs the account connected through Behold or the
    Instagram Graph API. The config field is wired and empty
    (`social.instagram.feedUrl`); the six reels on the page are pasted by hand.
    TikTok needs nothing: that one is the creator embed and updates itself.
26. Meta's Conversions API, which reports leads to Meta from our server rather
    than the browser, needs an access token from your Meta account. Not built.
    Worth doing only once the pixel is in.

## Before launch (for Jacob, not Chris)

25. The platform businessSlug is still the placeholder `replace-before-launch`.
    Until a real Business row exists and the slug is swapped in with
    `npm run set-slug -- <slug>`, every lead from the contact form is lost.
