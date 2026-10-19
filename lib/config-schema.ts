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
          shortDescription: z.string().min(40).max(200),
          /** Starting price in whole dollars. The ONLY source of a dollar figure on the site. */
          priceFrom: z.number().nullable(),
          priceNote: z.string().nullable(),
          /**
           * External booking URL for this service, or null when it cannot be
           * booked online. /book renders a "Book this package" button only for
           * services that have one.
           */
          bookingUrl: z.string().url().nullable().default(null),
          /**
           * Announced but not yet bookable. /book shows a muted "Coming soon"
           * pill and a quote CTA instead of a booking button, and the service
           * page swaps its booking CTAs for quote CTAs.
           */
          comingSoon: z.boolean().default(false),
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
     * Visible-only review figures. These render as words in copy and in the
     * stats strip. They NEVER feed aggregateRating schema; `reviews` above is
     * the only thing that does, and it stays empty when the visible section is
     * built from `testimonials` instead.
     */
    reviewCount: z.number().int().positive().nullable().default(null),
    reviewRating: z.number().min(1).max(5).nullable().default(null),

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

    /** A published promotion, or null. Never invented. */
    offer: z.string().nullable().default(null),

    /** Full origin including https:// and www. when www is the primary host. No trailing slash. */
    domain: z
      .string()
      .url()
      .regex(/^https:\/\/[^/]+$/, 'origin only: https://www.example-host.com with no path or trailing slash'),
  })
  .strict()
  .superRefine((cfg, ctx) => {
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
}

/**
 * 3999 -> "3,999". The ONE place a price is turned into text, so a four digit
 * starting price reads as money everywhere it appears instead of "$3999".
 * Prices themselves still live only in site.config.ts, never in content.
 */
export function formatPrice(amount: number): string {
  return amount.toLocaleString('en-US')
}

/** "+15555550123" -> "(555) 555-0123". Authored nowhere; derived from config.phone. */
export function formatPhoneDisplay(e164: string): string {
  const d = e164.replace(/\D/g, '').slice(-10)
  return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`
}

export function deriveConfig(parsed: SiteConfigParsed): SiteConfig {
  const primaryService = parsed.services[0]
  if (!primaryService) throw new Error('services must have at least one entry')
  return {
    ...parsed,
    phoneDisplay: formatPhoneDisplay(parsed.phone),
    primaryService,
    tradeLabel: parsed.tradeName ?? primaryService.name,
  }
}
