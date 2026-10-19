# Questions for Chris, Premium Detailing

Nothing on the site was invented. Every answer below is a gap the site is
currently working around, and each one makes a specific part of the site
better or turns a placeholder into the real thing.

## Top of the list

1. You said 1,000+ reviews. We can verify 739 across Google (449) and Facebook
   (290). Where are the rest? Yelp, Nextdoor, Angi? Send the links and the site
   will say 1,000+.
2. What is the shop address, and should it replace or sit beside
   864 SW Piedmont Ct? Nothing on the site names a shop address until you give
   one; it currently says "the shop in Port St. Lucie" and nothing more.
3. Do you want booking calendars for paint protection film, paint correction
   and window tinting, or quote requests only? They take quote requests today.

## Photos and brand

4. Send 3 before-and-after photo pairs (same car, same angle, phone photos are
   fine). None of the 39 photos you sent on 19 October had a dirty state, so
   the before-and-after slider still has nothing to show.
5. Send original full-resolution photos and the logo file (a vector or a large
   PNG).
6. Is the man holding the loyalty card in your Google photos you, and do you
   want a photo of yourself on the About page?
7. Can we use the two-person photo of your crew polishing the grey BMW? The
   shirt in it carries another company's name and phone number, so it is off
   the site for now.
8. The V.I.P loyalty card in that photo offers a free wash after five visits.
   Is that offer still running, and do you want it on the site?
9. Your 2025 ad video has captions burned into it, including "DISCOUNT" and
   "TAKE ... NOW". We used only the last three seconds, which have no captions,
   because the site cannot advertise a discount that is not confirmed. Is that
   discount still running, and can you send a version without the captions?
10. Six of the 39 photos are off the site because a Florida plate is readable
    and could not be cropped out cleanly: the black Corvette from the rear, the
    grey Super Duty from the rear, the silver Ferrari, both motorcycle shots by
    the van, and the Suzuki in front of the van (that one is your own van's
    plate). Resend any of those shot from a different angle and they go back in.

## What you actually offer

11. Which film brands do you use for paint protection film and tint?
12. What coating packages do you sell, and how long does each last? A review
    mentions a five-year coating.
13. What do the add-ons cost: clay bar, engine detail, seat shampoo, interior
    coating, tire coating? The site lists them by name with no price.
14. Your van lists vinyl wrapping. Do you want a vinyl wrap page, or is that
    service retired?
15. Do you do boats and RVs? Your logo shows a boat, and one of the new photos
    is a motorhome, but no review mentions either.

## Running the business

16. What are your real hours? Your Google profile says open 24 hours, so the
    site currently says "By appointment, seven days a week".
17. How far do you travel, and do you charge a travel fee past a certain point?
    Jupiter is now listed as the southern edge of the range.
18. Do you want 864 SW Piedmont Ct shown on the site? It is on your Google
    profile and your old site, but it looks like a home address.
19. What is the legal name of the business? Is there an LLC or Inc?
20. Do you want your first name used anywhere on the site? Customers use it in
    reviews but the site does not.

## Social and reviews

21. To show a live Instagram feed and a live follower count, the account has to
    be connected through Behold or the Instagram Graph API. The six reels on the
    site are pasted by hand and the "20K followers" figure was read on
    19 October, so both go stale. Do you want the account connected?
22. Are the Facebook, Instagram and TikTok links on your old site still current?
    There is no Yelp link; do you have one?
23. Anthony D.'s review is held back from the site. It ends a sentence with
    "taken care of." and the site's own text checker reads any "of." as a sign
    that a value failed to render, so publishing it would break the build gate.
    We are not willing to edit a customer's words. Confirm you are happy for us
    to publish it with a light edit and it goes straight on.

## Technical

24. Are you still using the LeadConnector booking calendars? The Bronze, Silver,
    Gold and ceramic coating cards link to them.
25. Should quote requests go to the website form, to those calendars, or both?
26. Do you want the Google Tag Manager container from your old site carried over?

## Before launch (for Jacob, not Chris)

27. The platform businessSlug is still the placeholder `replace-before-launch`.
    Until a real Business row exists and the slug is swapped in with
    `npm run set-slug -- <slug>`, every lead from the contact form is lost.
