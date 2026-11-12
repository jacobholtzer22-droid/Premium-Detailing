import { z } from 'zod'

/**
 * The schema every site.config.ts is parsed against.
 *
 * This file deliberately does NOT parse anything at import time, so
 * scripts/verify.ts can import the schema and report a parse failure as a
 * check result instead of crashing. lib/config.ts is the module that parses
 * at load and throws, which is what makes an invalid config fail `next build`.
 */

/**
 * Where every contact form submission goes. Frozen, never an env var.
 * The bare apex (alignandacquire.com without www) answers with a 308 that
 * the platform's own tooling does not follow, so the "www." is load-bearing.
 */
export const CONTACT_ENDPOINT = 'https://www.alignandacquire.com/api/contact' as const

/** The honeypot field name the platform checks. Must match lib/spam-constants.ts there. */
export const HONEYPOT_FIELD = 'hp_7d3a_ref' as const

/**
 * Real schema.org types a site may declare itself as. "LandscapingBusiness" and
 * "LandscapeService" do not exist on schema.org and are not accepted. Landscaping
 * and other outdoor trades use HomeAndConstructionBusiness.
 */
export const SCHEMA_TYPES = [
  'HomeAndConstructionBusiness',
  'Plumber',
  'Electrician',
  'HVACBusiness',
  'RoofingContractor',
  'MovingCompany',
  'AutoRepair',
  // Real schema.org type (subtype of LocalBusiness) covering detailers, washes
  // and body shops. "AutoDetailing" is NOT a schema.org type; never add it.
  'AutomotiveBusiness',
  'GeneralContractor',
  'LocalBusiness',
  'ProfessionalService',
  'Locksmith',
  'HousePainter',
] as const

export type SchemaType = (typeof SCHEMA_TYPES)[number]

export const SLUG_REGEX = /^[a-z0-9]+(-[a-z0-9]+)*$/
const TIME_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/

const slug = z.string().regex(SLUG_REGEX, 'must be kebab-case: lowercase letters, digits, single hyphens')

const faq = z.object({
  q: z.string().min(8),
  a: z.string().min(20),
})

/** YYYY-MM-DD. Used for the "as of" stamp on every counted figure. */
const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'must be YYYY-MM-DD')

/**
 * A priced tier INSIDE a service, for a service that is really a price ladder.
 *
 * This exists because the three detailing packages are one service sold at
 * three levels, not three services. As separate `services` entries they
 * crowded out the four paint and glass services on every grid, and the first
 * of them became the site's headline trade. As tiers they are one card, one
 * page and one comparison table, and each keeps its own booking calendar.
 */
/**
 * What it takes to book one thing online, in the owner's CRM.
 *
 * `flyraService` must be the service name EXACTLY as it reads in his Flyra
 * price book, because it is sent as the job's service and a mismatch files the
 * job under a name his techs do not recognise. `durationMinutes` is the only
 * place a package length lives: the slot lookup asks Flyra for windows that
 * long, the booking route recomputes the end time from it, and the package
 * cards and the "how long does it take" FAQ print it. A client-supplied end
 * time is never trusted.
 *
 * null means this thing is not bookable online and gets a quote CTA instead.
 * That is the right answer for anything priced per vehicle: sending somebody
 * to a calendar for work nobody can price until they see it wastes their time.
 */
/**
 * An extra that can be bought alongside a service, priced on its own.
 *
 * Add-ons hang off the SERVICE rather than the site, because "wheels coated,
 * $200" means nothing next to a Bronze wash and "pet hair removal, $75" means
 * nothing next to a ceramic coating. One list per service, rendered as a price
 * table on that service's page and compactly on /book.
 */
const addOn = z.object({
  name: z.string().min(3),
  price: z.number().positive(),
  /** One clause of detail, or null. Never a second price. */
  note: z.string().min(4).nullable().default(null),
})

const flyraBooking = z.object({
  flyraService: z.string().min(2),
  durationMinutes: z.number().int().positive(),
})

const serviceTier = z.object({
  name: z.string().min(2),
  slug,
  priceFrom: z.number().nullable(),
  priceNote: z.string().nullable(),
  /** Appended after the figure, e.g. "per sq ft". null prints the price alone. */
  priceUnit: z.string().min(2).nullable().default(null),
  /** The bullet list rendered in the comparison column. */
  includes: z.array(z.string().min(4)).min(1),
  booking: flyraBooking.nullable().default(null),
  /** The id this tier's section carries, so /book can deep link to it. */
  anchor: z.string().regex(SLUG_REGEX, 'must be kebab-case'),
})

export const siteConfigSchema = z
  .object({
    /**
     * Sent with every contact form submission and must match a live Business
     * row in the platform database, or every lead from this site is lost.
     * verify.ts confirms it against the platform (check 3) and rejects the
     * shipped sample identity (check 2).
     */
    businessSlug: slug,

    legalName: z.string().min(2),
    displayName: z.string().min(2),
    tagline: z.string().min(10),

    schemaType: z.enum(SCHEMA_TYPES),

    /** E.164. The single source of truth for the phone number; phoneDisplay is derived from it. */
    phone: z.string().regex(/^\+1\d{10}$/, 'must be E.164: +1 followed by 10 digits'),
    email: z.string().email().nullable(),

    /**
     * null when the business does not publish an address. Address-dependent
     * schema properties and the address block do not render.
     */
    address: z
      .object({
        street: z.string().min(3),
        city: z.string().min(2),
        state: z.string().length(2),
        zip: z.string().regex(/^\d{5}$/),
        lat: z.number().nullable(),
        lng: z.number().nullable(),
      })
      .nullable(),

    /**
     * What the business DOES, for the homepage H1, the area H1s and the titles
     * built from them.
     *
     * Without this the template uses services[0].name, which is correct when
     * the first service is the headline trade and wrong when the service list
     * is a price ladder: it put "Bronze Package in Port St. Lucie, FL" in the
     * homepage H1. null keeps the old behavior.
     */
    tradeName: z.string().min(3).nullable().default(null),

    primaryCity: z.string().min(2),
    /** Two-letter state for titles and area pages. Kept top-level because address may be null. */
    primaryState: z.string().length(2),

    serviceAreas: z
      .array(
        z.object({
          slug,
          name: z.string().min(2),
          county: z.string().nullable(),
        }),
      )
      .min(1),

    services: z
      .array(
        z.object({
          slug,
          name: z.string().min(2),
          /**
           * The name as it reads in compact navigation: the services pills and
           * the hero check list. null uses `name`. It exists so an acronym can
           * ride along in one place ("Paint Protection Film (PPF)") without
           * giving the service two names in titles, schema and breadcrumbs.
           */
          displayLabel: z.string().min(2).nullable().default(null),
          shortDescription: z.string().min(40).max(200),
          /** Starting price in whole dollars. The ONLY source of a dollar figure on the site. */
          priceFrom: z.number().nullable(),
          priceNote: z.string().nullable(),
          /** Appended after the figure, e.g. "per sq ft". null prints the price alone. */
          priceUnit: z.string().min(2).nullable().default(null),
          /**
           * Where the work happens. Drives the two paths in "How it works",
           * whether the page shows the shop map and directions, and the line
           * on each card that tells a visitor if they are driving to us.
           *
           *   mobile    we come to the customer
           *   shop      the customer drops the vehicle at the shop
           *   property  we work at the customer's property, not on a vehicle
           *
           * null renders no location line at all, which is right for anything
           * quoted before the logistics are known.
           */
          where: z.enum(['mobile', 'shop', 'property']).nullable().default(null),
          /**
           * Online booking for the service as a whole, or null for a quote.
           * A service sold as a price ladder leaves this null and puts the
           * booking on each tier instead.
           */
          booking: flyraBooking.nullable().default(null),
          /** Extras sold with this service, each priced on its own. */
          addOns: z.array(addOn).default([]),
          /**
           * Announced but not yet bookable. /book shows a muted "Coming soon"
           * pill and a quote CTA instead of a booking button, and the service
           * page swaps its booking CTAs for quote CTAs.
           */
          comingSoon: z.boolean().default(false),
          /**
           * Priced levels of this one service. Empty for a service that is
           * sold as a single thing. When non-empty the service page renders a
           * comparison table and /book renders one card per tier instead of
           * one card for the service.
           */
          tiers: z.array(serviceTier).default([]),
          /** Filename in public/images/originals to use as the page image, or null. */
          image: z.string().nullable(),
          faqs: z.array(faq).min(3).max(6),
        }),
      )
      .min(1),

    /** null means hours are unknown. openingHoursSpecification is omitted entirely. Never guess hours. */
    hours: z
      .array(
        z.object({
          day: z.enum(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']),
          open: z.string().regex(TIME_REGEX, 'HH:MM 24-hour'),
          close: z.string().regex(TIME_REGEX, 'HH:MM 24-hour'),
        }),
      )
      .nullable(),

    /**
     * What visitors READ where hours are printed, when the literal table is
     * not what the business wants shown.
     *
     * `hours` above still feeds openingHoursSpecification, so the structured
     * data keeps matching the Google Business Profile. This is display only.
     * A profile that says "open 24 hours" is a scheduling artefact, not a
     * promise anyone should read as "we answer the phone at 3am".
     * null prints the per-day table as before.
     */
    hoursDisplay: z.string().min(4).nullable().default(null),

    yearsInBusiness: z.number().int().positive().nullable(),
    /**
     * The year the business started, owner-confirmed. Where a "since" line is
     * printed this is the number, rather than this year minus yearsInBusiness,
     * which silently moves the founding date every January.
     */
    foundingYear: z.number().int().min(1900).nullable().default(null),
    licenseNumber: z.string().nullable(),
    insured: z.boolean().nullable(),

    /**
     * Review and aggregateRating schema render ONLY when this array is non-empty,
     * and the same reviews render visibly on the page. Empty by default. Only real
     * reviews with a source URL belong here.
     */
    reviews: z
      .array(
        z.object({
          author: z.string().min(2),
          rating: z.number().min(1).max(5),
          text: z.string().min(10),
          source: z.string().min(2),
          url: z.string().url(),
        }),
      )
      .default([]),

    profiles: z
      .object({
        gbp: z.string().url().nullable(),
        facebook: z.string().url().nullable(),
        instagram: z.string().url().nullable(),
        yelp: z.string().url().nullable(),
        tiktok: z.string().url().nullable(),
      })
      .partial(),

    /** Homepage FAQs. FAQPage schema on the homepage renders only when non-empty. */
    faqs: z.array(faq).default([]),

    /** Which processed images go where. Filenames are keys in public/images/manifest.json. */
    images: z.object({
      hero: z.string().nullable(),
      about: z.string().nullable(),
      /**
       * Gallery tiles. `tag` drives the filter row; orientation is NOT authored
       * here, it is derived from the manifest's pixel dimensions so it cannot
       * drift from the actual file.
       */
      gallery: z
        .array(
          z.object({
            name: z.string().min(3),
            tag: z.string().min(2),
          }),
        )
        .default([]),
      /**
       * Optional full-bleed hero footage, paths under /public.
       *
       * There is no poster field on purpose: `hero` above IS the poster. It
       * is already processed, already preloaded by <Img priority>, already
       * the LCP element, and already what verify check 19 measures the hero
       * copy against. A separate poster would be a second source of truth
       * for the frame a visitor actually reads the H1 over.
       *
       * Requires `hero` to be set; the refine below enforces it.
       */
      heroVideo: z.object({ desktop: z.string().min(2), mobile: z.string().min(2) }).nullable().default(null),
    }),

    /**
     * Extra fields on the contact form. OPTIONAL, and off by default.
     *
     * Omit the whole block and the form renders exactly the fields it has
     * always rendered and posts exactly the payload it has always posted, so
     * every site built before this existed is unaffected. Each option is
     * additive on top of that baseline.
     *
     * What never changes, whatever is switched on: the endpoint, the payload
     * keys { name, phone, email, message, smsConsent, businessSlug } plus the
     * honeypot, and the SMS consent checkbox. Extra answers are folded into
     * `name` and `message`, because those are the two fields the platform
     * already parses.
     */
    contactForm: z
      .object({
        /**
         * Ask for first and last name separately. `name` is still posted as
         * one string, "First Last".
         */
        splitName: z.boolean().default(false),
        /**
         * Street address and city. 'optional' renders them and lets the form
         * through empty; 'required' blocks submission until both are filled.
         * Trades that quote on site need the address; a consultant does not.
         */
        address: z.enum(['off', 'optional', 'required']).default('off'),
        /**
         * Ask for a ZIP or postal code. Independent of `address`.
         *
         * With `address` on, the ZIP sits in the address group and folds into
         * the Address line, which is how a street address is normally written.
         * With `address` off, it renders on its own and folds in as its own
         * "ZIP:" line. A business that quotes from local data needs the ZIP and
         * has no use for the street.
         */
        zip: z.enum(['off', 'optional', 'required']).default('off'),
        /**
         * A "how soon do you need this" dropdown.
         *
         * The label and the choices are per-client because the useful answers
         * are: a water treatment company cares about install timing, a roofer
         * about whether it is leaking now. An empty first choice means the
         * select has no default, so a required timeframe cannot be satisfied by
         * the visitor ignoring it.
         */
        timeframe: z
          .object({
            label: z.string().min(4),
            options: z.array(z.string().min(1)).min(2),
            required: z.boolean().default(false),
          })
          .optional(),
        /**
         * A dropdown of config.services by name, plus "Not sure yet" so nobody
         * is forced to self-diagnose before they can send a message.
         */
        serviceDropdown: z.boolean().default(false),
        /** Require the email address. It is optional by default. */
        emailRequired: z.boolean().default(false),

        /**
         * COPY ONLY. The three options below change wording, never a field,
         * never a payload key, and never a validation rule. They exist because
         * the message box and the submit button are the two places where
         * generic wording costs conversions, and a DJ, a roofer and a
         * consultant need different words there.
         *
         * Each default is the exact text this form has always rendered, so a
         * site that omits them is byte-identical to before they existed.
         */

        /** Label above the message textarea. */
        messageLabel: z.string().min(4).default('What do you need done?'),
        /**
         * Placeholder inside the message textarea. OPTIONAL WITH NO DEFAULT on
         * purpose: the form has never had a placeholder here, and defaulting to
         * an empty string would emit `placeholder=""` where there was no
         * attribute at all. Unset means the attribute is absent.
         *
         * This is the one place to ask for several facts without adding
         * several fields: a short form converts better than a long one, so the
         * extra questions go in the box the visitor is already typing in.
         */
        messagePlaceholder: z.string().min(4).optional(),
        /** Submit button text. "Sending" while in flight is not configurable. */
        submitLabel: z.string().min(4).default('Send Message'),
      })
      .optional(),

    /**
     * Pre-launch mode. True means the site is deployed but must not be indexed:
     * app/layout.tsx sends noindex and app/robots.ts disallows everything.
     * Flip to false at launch, then redeploy.
     */
    prelaunch: z.boolean().default(false),

    /**
     * Ported from AA-Template, which replaced `prelaunch` with this block.
     *
     * This repo predates that change and its robots.ts and layout.tsx still
     * read `prelaunch`, so the two are NOT redundant: `launch.indexable` is
     * what the ops platform reads to report whether a site is live, and the
     * superRefine below makes the pair contradict-proof. Flipping one without
     * the other is a Zod failure, not a silently half-launched site.
     */
    launch: z.object({
      indexable: z.boolean(),
    }),

    /**
     * Google tag. OPTIONAL: omit the block and nothing renders, so a site
     * without it is byte-identical to before it existed.
     *
     * With googleAdsId set, every page loads gtag.js and configs that id (and
     * ga4 when set). conversions.form fires when the contact form shows its
     * thank-you; conversions.call fires on a click of any tel: link. Each
     * label is the "send_to" value Google Ads gives for the conversion
     * action: the same AW- id, a slash, then the label. A missing label means
     * that conversion is not fired.
     */
    tracking: z
      .object({
        googleAdsId: z.string().regex(/^AW-\d{6,12}$/, 'must look like AW-1234567890').optional(),
        conversions: z
          .object({
            form: z.string().regex(/^AW-\d{6,12}\/[\w-]+$/, 'must look like AW-1234567890/AbCdEfGh').optional(),
            call: z.string().regex(/^AW-\d{6,12}\/[\w-]+$/, 'must look like AW-1234567890/AbCdEfGh').optional(),
          })
          .strict()
          .default({}),
        ga4: z.string().regex(/^G-[A-Z0-9]{4,14}$/, 'must look like G-ABC123DEF4').optional(),
        /**
         * Meta pixel id, digits only. Set it and the base pixel loads on every
         * page and a "Lead" event fires wherever the Google Ads form
         * conversion already fires. Unset and not one byte of Meta script is
         * shipped, which is the state this site is in until the owner sends
         * the id.
         *
         * The Conversions API (server-side Meta events) is deliberately NOT
         * here: it needs an access token, which is a secret and belongs in the
         * environment, not in a file that ships to the browser.
         */
        metaPixelId: z.string().regex(/^\d{10,20}$/, 'digits only, as Meta writes it').optional(),
      })
      .strict()
      .superRefine((t, ctx) => {
        for (const key of ['form', 'call'] as const) {
          const label = t.conversions[key]
          if (!label) continue
          if (!t.googleAdsId) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['conversions', key], message: 'needs tracking.googleAdsId' })
          else if (!label.startsWith(`${t.googleAdsId}/`)) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['conversions', key], message: `must start with ${t.googleAdsId}/` })
          }
        }
      })
      .optional(),

    /**
     * Visible-only review figures. These render as words in copy and in the
     * stats strip. They NEVER feed aggregateRating schema; `reviews` above is
     * the only thing that does, and it stays empty when the visible section is
     * built from `testimonials` instead.
     */
    reviewCount: z.number().int().positive().nullable().default(null),
    reviewRating: z.number().min(1).max(5).nullable().default(null),

    /**
     * Counted review figures, each with the date it was counted.
     *
     * Exact numbers with a date, not a rounded claim: the owner says "1,000+
     * across all platforms", and 1,000 is not a number this site can stand
     * behind until he shows where the rest are. What IS verifiable is the
     * Google count and the Facebook count, so those are what live here and the
     * combined figure is derived from them by flooring to the nearest hundred.
     */
    reviewCountExact: z.number().int().positive().nullable().default(null),
    reviewCountAsOf: isoDate.nullable().default(null),
    facebookReviewCount: z.number().int().positive().nullable().default(null),
    facebookReviewsAsOf: isoDate.nullable().default(null),
    /** Where a "Leave a review" button points. Never invented. */
    reviewLink: z.string().url().nullable().default(null),

    /**
     * The total the OWNER claims, and where he says it comes from. Both are
     * his words, which is why they are two authored strings rather than
     * anything derived.
     *
     * This sits beside reviewCountExact and facebookReviewCount, it does not
     * replace them. The claim is what the headline surfaces print; the two
     * counted figures are what the rating bar and the stats strip print, and
     * the reviews page prints both so a visitor can see which part of the
     * number is verified on this site and which part is the owner's word.
     * Never fold the claim into a count, and never emit it as schema.
     */
    reviewClaimTotal: z.string().min(2).nullable().default(null),
    reviewClaimScope: z.string().min(4).nullable().default(null),

    /**
     * Visible testimonials with NO schema attached. Used when the reviews are
     * the business's own Google reviews, which Google treats as self-serving
     * when a site marks them up itself.
     */
    testimonials: z
      .array(
        z.object({
          quote: z.string().min(20),
          name: z.string().min(2),
          /** Which platform it was left on. Printed under the quote, never as a logo. */
          source: z.string().min(2).default('Google'),
        }),
      )
      .default([]),

    /** Three figures for the stats strip. `suffix` is appended to the value as written. */
    stats: z
      .array(
        z.object({
          value: z.string().min(1),
          suffix: z.string().default(''),
          label: z.string().min(4),
        }),
      )
      .default([]),

    /** Counties and the towns covered inside them. Plain text, never links. */
    coverage: z
      .array(
        z.object({
          county: z.string().min(3),
          towns: z.array(z.string().min(2)).min(1),
        }),
      )
      .default([]),

    /**
     * Ordered filenames for the moving car strip under the hero. Each must be
     * a key in the image manifest. Empty means the strip renders nothing.
     *
     * Ordered by hand rather than reusing the gallery order, because the strip
     * is the one place on the page where the first three tiles do all the
     * work.
     */
    carStrip: z.array(z.string().min(3)).default([]),

    /**
     * Social accounts that render as a SECTION rather than a footer link.
     * profiles above still holds the plain links.
     */
    social: z
      .object({
        instagram: z
          .object({
            handle: z.string().min(2),
            url: z.string().url(),
            /**
             * As written, e.g. "20K", with the date it was read. BOTH are
             * null together: a follower count with no date is a number nobody
             * can check, and this one was six months stale before it was
             * pulled. The section renders no follower line when they are null.
             */
            followers: z.string().min(2).nullable().default(null),
            followersAsOf: isoDate.nullable().default(null),
            /**
             * A live-feed JSON endpoint (Behold or similar). SCAFFOLD: the
             * owner has to connect the Instagram account before one exists, so
             * it is null and the section renders the hand-pasted permalinks
             * below instead. Nothing fetches this until it is set.
             */
            feedUrl: z.string().url().nullable().default(null),
            /**
             * Official permalinks. Empty renders nothing at all; there is no
             * live feed, so a post only appears here once someone pastes it.
             */
            posts: z
              .array(
                z.object({
                  url: z.string().url(),
                  /** The caption opening, shown only on the fallback card. */
                  excerpt: z.string().min(10),
                }),
              )
              .default([]),
          })
          .nullable()
          .default(null),
        /**
         * The TikTok profile embed. Handle and url only: TikTok's own embed
         * script renders the posts, so there is nothing here to keep in sync
         * with what he has actually posted.
         */
        tiktok: z
          .object({
            handle: z.string().min(2),
            url: z.string().url(),
          })
          .nullable()
          .default(null),
      })
      .default({ instagram: null, tiktok: null }),

    /**
     * Before/after pairs for the drag slider. Empty means the section renders
     * nothing at all. A pair is only ever the SAME vehicle from roughly the
     * same angle, one dirty and one finished.
     */
    beforeAfter: z
      .array(
        z.object({
          label: z.string().min(2),
          before: z.object({ src: z.string(), alt: z.string().min(10) }),
          after: z.object({ src: z.string(), alt: z.string().min(10) }),
          caption: z.string().nullable(),
          /**
           * Set from the finished files' pixel dimensions by
           * scripts/add-pair.mjs, never guessed. A portrait pair gets a 4/5
           * stage capped at 520px with the copy beside it; a landscape pair
           * keeps the wide stage with the copy above.
           */
          orientation: z.enum(['portrait', 'landscape']).default('landscape'),
          /** Limit this pair to one service page. null means it shows everywhere. */
          service: z.string().nullable().default(null),
        }),
      )
      .default([]),

    /**
     * The founder section on the About page. SCAFFOLD, and null today.
     *
     * The owner was asked for a founder story, a photo and the link to the
     * WPTV clip, and has not sent them. Rather than writing a founder story on
     * his behalf, the section renders nothing at all until this is filled: an
     * invented origin story on an About page is the kind of copy a real
     * customer notices is not in his voice.
     *
     * `press` is for the WPTV appearance. A label with no URL renders nothing,
     * because "as seen on" with nowhere to click is worth less than silence.
     */
    founder: z
      .object({
        name: z.string().min(2),
        /** "Owner and detailing instructor", as he describes himself. */
        role: z.string().min(2),
        /** His own words. Two or three paragraphs, separated by blank lines. */
        story: z.string().min(80),
        /** Manifest filename, or null for a text-only section. */
        image: z.string().nullable().default(null),
        press: z
          .object({
            label: z.string().min(2),
            url: z.string().url(),
          })
          .nullable()
          .default(null),
      })
      .nullable()
      .default(null),

    /** A published promotion, or null. Never invented. */
    offer: z.string().nullable().default(null),

    /**
     * Online booking into the owner's CRM. null turns the whole booking flow
     * off and every package falls back to a quote CTA, which is the safe state:
     * a booking form that cannot reach the CRM loses the job silently.
     *
     * `techIds` are Flyra employee ids, and they are the reason this can be
     * empty while everything else is set. Website bookings are dispatched to
     * the named techs, so with no ids there is nobody to check availability
     * against and the slot route returns no windows rather than guessing. The
     * page then shows its "call us" state, which is a worse experience than a
     * calendar and a much better one than a booking nobody is assigned to.
     */
    booking: z
      .object({
        /** IANA zone. Every slot is shown and sent in this zone, never the visitor's. */
        timezone: z.string().min(3),
        /** Flyra's own minimum notice. Never offer a slot sooner than this. */
        minNoticeHours: z.number().int().nonnegative(),
        /** How far ahead the date strip runs. */
        daysAhead: z.number().int().positive(),
        /** Flyra employee ids from GET /employees. Empty disables the flow. */
        techIds: z.array(z.string().min(1)).default([]),
        /** Whether money is taken to hold the slot. */
        depositRequired: z.boolean(),
        /** The lines printed under the booking heading. One sentence each, all verifiable. */
        notes: z.array(z.string().min(8)).default([]),
      })
      .nullable()
      .default(null),

    /**
     * Standing offers, as opposed to `offer` above which is a single headline
     * promotion. Each is null or empty until the owner actually runs it.
     */
    specials: z
      .object({
        /** Prepaid block of details. `saving` is printed, not computed, so it cannot drift. */
        bundle: z
          .object({
            name: z.string().min(3),
            price: z.number().positive(),
            /** What one visit works out at inside the bundle. */
            unitPrice: z.number().positive(),
            visits: z.number().int().positive(),
            saving: z.number().positive(),
            detail: z.string().min(10),
          })
          .nullable()
          .default(null),
        /** Give this, get this, when the condition is met. */
        referral: z
          .object({
            give: z.number().positive(),
            get: z.number().positive(),
            condition: z.string().min(8),
          })
          .nullable()
          .default(null),
        /** Recurring maintenance plans, billed per completed visit. */
        plans: z
          .array(
            z.object({
              name: z.string().min(3),
              pricePerVisit: z.number().positive(),
              visitsPerYear: z.number().int().positive(),
              note: z.string().min(8).nullable().default(null),
            }),
          )
          .default([]),
      })
      .default({ bundle: null, referral: null, plans: [] }),

    /** Full origin including https:// and www. when www is the primary host. No trailing slash. */
    domain: z
      .string()
      .url()
      .regex(/^https:\/\/[^/]+$/, 'origin only: https://www.example-host.com with no path or trailing slash'),
  })
  .strict()
  .superRefine((cfg, ctx) => {
    // The two launch flags are the same fact written twice (this repo's own
    // code reads `prelaunch`, the ops platform reads `launch.indexable`), so
    // disagreement is always a mistake and never a state worth having.
    if (cfg.prelaunch === cfg.launch.indexable) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['launch', 'indexable'],
        message: `launch.indexable must be the opposite of prelaunch (prelaunch is ${cfg.prelaunch})`,
      })
    }

    // Footage with no poster would leave the hero blank until the clip
    // decodes, and would leave check 19 with nothing to measure.
    if (cfg.images.heroVideo && !cfg.images.hero) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['images', 'heroVideo'],
        message: 'images.hero must be set when images.heroVideo is: the hero image is the video poster and the LCP element',
      })
    }
  })

export type SiteConfigInput = z.input<typeof siteConfigSchema>
export type SiteConfigParsed = z.output<typeof siteConfigSchema>

export type Service = SiteConfigParsed['services'][number]
export type ServiceTier = Service['tiers'][number]
export type FlyraBooking = NonNullable<Service['booking']>
export type AddOn = Service['addOns'][number]
export type Specials = SiteConfigParsed['specials']
export type BookingSettings = NonNullable<SiteConfigParsed['booking']>
export type ServiceArea = SiteConfigParsed['serviceAreas'][number]
export type Review = SiteConfigParsed['reviews'][number]
export type Faq = SiteConfigParsed['faqs'][number]
export type Hours = NonNullable<SiteConfigParsed['hours']>

/** Derived fields that are computed, never authored. */
export type SiteConfig = SiteConfigParsed & {
  phoneDisplay: string
  /** The first service in config. */
  primaryService: Service
  /** What the business does, for H1s and titles. tradeName, else services[0].name. */
  tradeLabel: string
  /**
   * "1,000+ five-star reviews across Google and social media", or null when
   * the owner has made no claim. The ONE place that sentence is assembled, so
   * the five surfaces that print it cannot drift apart.
   *
   * This replaced a derived figure that floored the two counted totals to the
   * nearest hundred. The owner has since stated the real total across all his
   * platforms, and his number outranks arithmetic done over the two platforms
   * this site happens to be able to count.
   */
  reviewClaimLine: string | null
}

/**
 * 3999 -> "3,999", 1.5 -> "1.50". The ONE place a price is turned into text, so
 * a four digit starting price reads as money everywhere it appears instead of
 * "$3999", and a per-unit rate reads as money instead of "$1.5".
 * Prices themselves still live only in site.config.ts, never in content.
 */
export function formatPrice(amount: number): string {
  const fractionDigits = Number.isInteger(amount) ? 0 : 2
  return amount.toLocaleString('en-US', {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  })
}

/**
 * 45 -> "about 45 minutes", 60 -> "about an hour", 120 -> "about 2 hours".
 *
 * Derived from booking.durationMinutes, which is the same number the slot
 * lookup asks Flyra for and the booking route recomputes the end time from, so
 * what a visitor reads on the card is the length actually reserved. "about"
 * is not hedging: it is the caveat the owner asked for, because a larger or
 * very dirty vehicle takes longer.
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) return `about ${minutes} minutes`
  const hours = minutes / 60
  if (hours === 1) return 'about an hour'
  if (Number.isInteger(hours)) return `about ${hours} hours`
  return `about ${hours.toFixed(1)} hours`
}

/**
 * A price as it is printed everywhere: the figure, then its unit when it has
 * one. One function so "$1.50 per sq ft" cannot become "$1.5/sqft" on the
 * second surface that prints it.
 */
export function priceLabel(amount: number, unit: string | null = null): string {
  return unit ? `$${formatPrice(amount)} ${unit}` : `$${formatPrice(amount)}`
}

/** "+15555550123" -> "(555) 555-0123". Authored nowhere; derived from config.phone. */
export function formatPhoneDisplay(e164: string): string {
  const d = e164.replace(/\D/g, '').slice(-10)
  return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`
}

export function deriveConfig(parsed: SiteConfigParsed): SiteConfig {
  const primaryService = parsed.services[0]
  if (!primaryService) throw new Error('services must have at least one entry')
  const { reviewClaimTotal, reviewClaimScope } = parsed
  return {
    ...parsed,
    phoneDisplay: formatPhoneDisplay(parsed.phone),
    primaryService,
    tradeLabel: parsed.tradeName ?? primaryService.name,
    reviewClaimLine:
      reviewClaimTotal && reviewClaimScope ? `${reviewClaimTotal} five-star reviews ${reviewClaimScope}` : null,
  }
}
