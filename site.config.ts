import type { SiteConfigInput } from '@/lib/config-schema'

/**
 * Every fact about this business, in one place. Prose never hardcodes a fact;
 * it reaches the page through a component or {config.*} interpolation.
 *
 * Anything the brief left UNKNOWN is null or an empty array here, and the
 * block that depends on it does not render. An empty slot is correct; a
 * plausible guess is a defect.
 *
 * Facts marked [owner] came from Chris in writing on 2026-10-19 and outrank
 * anything read off the old site. Facts marked [owner] 2026-11-08 update list
 * come from his written update list of that date and outrank both. Facts marked
 * [flyra] read 2026-11-11 were read from his Flyra account on that date.
 */
/**
 * Add-on prices, named once.
 *
 * The add-ons table on the detailing page, the compact list on /book and the
 * two FAQ answers that quote a figure all read these, because an add-on whose
 * price is typed twice is an add-on that will cost two different amounts on
 * the same site by the end of the year.
 *
 * [owner] 2026-11-08 update list.
 */
/**
 * The three package prices, named once.
 *
 * The tiers below and the homepage FAQ that quotes all three read these. The
 * FAQ used to spell the old figures out in words ("one hundred twenty-five"),
 * which is how it survived two price changes while still being wrong.
 *
 * [owner] 2026-11-08 update list.
 */
const PKG = {
  bronze: 150,
  silver: 250,
  gold: 350,
} as const

const ADDON = {
  headlights: 150,
  petHair: 75,
  engineBay: 50,
  seatShampoo: 125,
  floorShampoo: 100,
  disassembly: 300,
  clayBar: 75,
  ironDecon: 100,
  ozone: 100,
  onePolish: 300,
  enhancement: 400,
  /** Coating extras, priced per area and only sold with a coating. */
  coatingArea: 200,
} as const

const config: SiteConfigInput = {
  // The live platform slug. Confirmed against
  // GET /api/verify-slug?slug=premium-detailing -> 200 {"ok":true}, which is
  // also what verify check 3 asks. ContactFormGate sees a real slug here and
  // stops disabling the form.
  businessSlug: 'premium-detailing',

  legalName: 'Premium Detailing',
  displayName: 'Premium Detailing',
  tagline:
    'Mobile detailing at your driveway, plus ceramic coating, paint protection film, paint correction and window tinting at the shop. Serving the Treasure Coast.',

  // AutomotiveBusiness is the real schema.org type for a detailer.
  // "AutoDetailing" is not a schema.org type and must never be used.
  schemaType: 'AutomotiveBusiness',

  phone: '+17723020717',
  email: 'premiumdetailingpsl@gmail.com',

  // [owner] 2026-11-08 update list, matching his Flyra org settings: the
  // public shop address. It replaces the old 864 SW Piedmont Ct, which was the
  // Google Business Profile address and looked residential. That question is
  // now closed: the shop is where coating, film, correction, tint, water
  // damage and mold work is done, and the site shows it on a map.
  //
  // lat/lng geocoded from this exact address on 2026-11-11 by the US Census
  // Bureau geocoder (geocoding.geo.census.gov, benchmark Public_AR_Current),
  // which returned 27.338537, -80.425346 for "2190 RESERVE PARK TRCE, PORT ST
  // LUCIE, FL, 34986". Cross-checked against OpenStreetMap Nominatim, which
  // put the same building at 27.339161 and 27.338146: agreement to roughly a
  // hundred metres, so the Census figure is the one used.
  address: {
    street: '2190 NW Reserve Park Trace, Suite 14',
    city: 'Port St. Lucie',
    state: 'FL',
    zip: '34986',
    lat: 27.338537,
    lng: -80.425346,
  },

  // Drives the homepage and area H1s. Without it the template would use
  // services[0].name, which is now "Mobile Detailing" anyway, but leaving it
  // explicit keeps the H1 stable if the service order ever changes again.
  tradeName: 'Mobile Detailing',

  primaryCity: 'Port St. Lucie',
  primaryState: 'FL',

  // [owner] "Serving the Treasure Coast", in his order. Port St. Lucie is the
  // primary city and is not repeated here; AreaList renders it first and
  // points it at the homepage.
  serviceAreas: [
    { slug: 'stuart', name: 'Stuart', county: 'Martin County' },
    { slug: 'palm-city', name: 'Palm City', county: 'Martin County' },
    { slug: 'jensen-beach', name: 'Jensen Beach', county: 'Martin County' },
    { slug: 'sewalls-point', name: "Sewall's Point", county: 'Martin County' },
    { slug: 'jupiter', name: 'Jupiter', county: 'Palm Beach County' },
    { slug: 'fort-pierce', name: 'Fort Pierce', county: 'St. Lucie County' },
    { slug: 'vero-beach', name: 'Vero Beach', county: 'Indian River County' },
    // [owner] 2026-11-08 update list. The first five are Port St. Lucie
    // neighborhoods rather than separate towns, which is how people here
    // actually describe where they live and what they search for.
    { slug: 'tradition', name: 'Tradition', county: 'St. Lucie County' },
    { slug: 'st-lucie-west', name: 'St. Lucie West', county: 'St. Lucie County' },
    { slug: 'torino', name: 'Torino', county: 'St. Lucie County' },
    { slug: 'st-james', name: 'St. James', county: 'St. Lucie County' },
    { slug: 'southbend', name: 'Southbend', county: 'St. Lucie County' },
    { slug: 'hobe-sound', name: 'Hobe Sound', county: 'Martin County' },
    { slug: 'tequesta', name: 'Tequesta', county: 'Palm Beach County' },
    { slug: 'sebastian', name: 'Sebastian', county: 'Indian River County' },
  ],

  // [owner] Five services, all live. The three detailing packages are tiers of
  // one service, not three services: as separate entries the price ladder was
  // taking three of the six cards on every grid and headlining the site.
  services: [
    {
      slug: 'mobile-detailing',
      name: 'Mobile Detailing',
      shortDescription:
        'Three packages that come to your driveway, from a maintenance wash to a deep detail inside and out with the paint decontaminated.',
      // [owner] 2026-11-08 update list. Was 125.
      priceFrom: PKG.bronze,
      priceNote: 'Starting price for the Bronze Package; the final quote depends on vehicle size and condition.',
      // The tiers carry the booking. The service itself is not one bookable
      // thing, so it has no booking of its own.
      booking: null,
      where: 'mobile',
      comingSoon: false,
      image: 'black-bmw-x6-finished-on-pavers.jpg',
      // [owner] 2026-11-08 update list. Available with any of the three
      // packages. Seat shampoo, pet hair removal and the ozone treatment sit
      // HERE and not inside the Gold Package: they are not included in any
      // package, and the site used to imply Gold covered them.
      addOns: [
        { name: 'Headlight restoration', price: ADDON.headlights, note: null },
        { name: 'Pet hair removal', price: ADDON.petHair, note: null },
        { name: 'Engine bay detail', price: ADDON.engineBay, note: null },
        { name: 'Seat shampoo and extraction', price: ADDON.seatShampoo, note: null },
        { name: 'Floor shampoo and extraction', price: ADDON.floorShampoo, note: null },
        { name: 'Vehicle disassembly', price: ADDON.disassembly, note: 'Seats, console and carpet out for a full clean' },
        { name: 'Clay bar', price: ADDON.clayBar, note: null },
        { name: 'Iron decontamination', price: ADDON.ironDecon, note: null },
        { name: 'Ozone odor treatment', price: ADDON.ozone, note: null },
        { name: 'One-step polish', price: ADDON.onePolish, note: null },
        { name: 'Paint enhancement with 1-year sealant', price: ADDON.enhancement, note: null },
      ],
      tiers: [
        {
          name: 'Bronze Package',
          slug: 'bronze',
          anchor: 'bronze',
          // [owner] 2026-11-08 update list. Was 125.
          priceFrom: PKG.bronze,
          priceNote: 'Starting price; final quote depends on vehicle size and condition.',
          priceUnit: null,
          // [owner] 2026-11-08 update list, from his Flyra price book and tech
          // SOPs. Replaces the shorter list taken off the old website.
          includes: [
            'Exterior hand wash',
            'Wheels and tires cleaned',
            'Interior vacuum: carpets, seats, mats and trunk',
            'Dash, console and door panels wiped down',
            'Glass cleaned inside and out',
          ],
          booking: { flyraService: 'Bronze Package', durationMinutes: 45 },
        },
        {
          name: 'Silver Package',
          slug: 'silver',
          anchor: 'silver',
          // [owner] 2026-11-08 update list. Was 225.
          priceFrom: PKG.silver,
          priceNote: 'Starting price; final quote depends on vehicle size and condition.',
          priceUnit: null,
          includes: [
            'Everything in the Bronze Package',
            'Wax or spray sealant on all paint',
            'Tire dressing',
            'Door jambs cleaned',
            'Interior plastics, vinyl and leather cleaned and protected',
            'Floor mats cleaned',
          ],
          booking: { flyraService: 'Silver Package', durationMinutes: 60 },
        },
        {
          name: 'Gold Package',
          slug: 'gold',
          anchor: 'gold',
          // [owner] 2026-11-08 update list. Was 325.
          priceFrom: PKG.gold,
          priceNote: 'Starting price; final quote depends on vehicle size and condition.',
          priceUnit: null,
          // Note what is NOT here: seat shampoo, pet hair removal and odor
          // treatment used to be listed inside this package and are add-ons in
          // his price book. They moved to service.addOns above rather than
          // being deleted, so the site stops promising them at this price.
          includes: [
            'Everything in the Silver Package',
            'Iron decontamination and clay where the paint needs it',
            'Deep interior detail: vents, seams, cup holders and pedals',
            'Stain spot-treatment',
            'Headliner spot-clean',
            'Under-seat vacuum',
            'Exterior trim dressed',
          ],
          booking: { flyraService: 'Gold Package', durationMinutes: 120 },
        },
      ],
      faqs: [
        {
          q: 'Do you come to me for a detailing package?',
          a: 'Yes. The Bronze, Silver and Gold packages are mobile, so we come to your driveway in Port St. Lucie or anywhere else on the Treasure Coast and work on the vehicle where it sits.',
        },
        {
          q: 'Which package should I pick?',
          a: 'Bronze maintains a car that is already relatively clean. Silver adds wax or a sealant on the paint and cleans and protects the interior surfaces. Gold goes further again: the paint is decontaminated, and the interior gets the vents, seams, cup holders and headliner.',
        },
        {
          q: 'Can you get out pet hair, stains and sand?',
          a:
            `Yes. Pet hair removal is an add-on at $${ADDON.petHair}, and a seat shampoo with extraction is $${ADDON.seatShampoo}. Sand and general grit come out with the vacuum in every package. Ask for the add-ons when you book and they go on the job.`,
        },
        {
          q: 'Can you add a clay bar or an engine detail?',
          a:
            `Yes. A clay bar is $${ADDON.clayBar} and an engine bay detail is $${ADDON.engineBay}, and either goes on any package. The full add-on list and prices are on this page, so you can see what a job costs before you book it.`,
        },
        {
          q: 'How long does a package take?',
          a: 'Bronze takes about 45 minutes, Silver about an hour and Gold about 2 hours. A larger vehicle, or one that has not been cleaned in a long time, takes longer, and the time you pick when you book reserves that whole window.',
        },
        {
          q: 'How often should I book one?',
          a: 'As a general rule, a maintenance wash and vacuum about once a month keeps dirt and salt from building up. How often you need it depends on where the car is parked and how far you drive.',
        },
      ],
    },
    {
      slug: 'ceramic-coating',
      name: 'Ceramic Coating',
      shortDescription:
        'A five-year coating that adds gloss, resists chemicals and makes a car far easier to wash, over paint prepared three different ways.',
      // [owner] 2026-11-08 update list. Was 750. The three packages below are
      // what the figure is the floor of.
      priceFrom: 900,
      priceNote: 'Starting price for the clay and coating package; the other two include paint correction.',
      // No online booking, by design. Which package a car needs is decided at
      // the paint evaluation, so a calendar would be booking work nobody has
      // priced yet. The tiers below are a comparison, not three calendars.
      booking: null,
      where: 'shop',
      comingSoon: false,
      image: 'black-porsche-macan-shop-hex-lights.jpg',
      // [owner] 2026-11-08 update list. Coating extras, each priced per area
      // and sold only alongside a paint coating.
      addOns: [
        { name: 'Wheels coated', price: ADDON.coatingArea, note: null },
        { name: 'Interior coated', price: ADDON.coatingArea, note: null },
        { name: 'Glass coated', price: ADDON.coatingArea, note: null },
      ],
      tiers: [
        {
          name: 'Clay and 5-Year Coating',
          slug: 'clay-coating',
          anchor: 'clay-coating',
          priceFrom: 900,
          priceNote: 'For paint that is already in good condition.',
          priceUnit: null,
          includes: [
            'Clay bar decontamination',
            'Five-year ceramic coating on the paint',
            'Final detail and inspection under shop lighting',
          ],
          booking: null,
        },
        {
          name: 'One-Step Polish and 5-Year Coating',
          slug: 'polish-coating',
          anchor: 'polish-coating',
          priceFrom: 1250,
          priceNote: 'Lifts the lighter swirls before the coating goes on.',
          priceUnit: null,
          includes: [
            'Decontamination and a one-step machine polish',
            'Five-year ceramic coating on the paint',
            'Final detail and inspection under shop lighting',
          ],
          booking: null,
        },
        {
          name: 'Full Paint Correction and 5-Year Coating',
          slug: 'correction-coating',
          anchor: 'correction-coating',
          priceFrom: 1850,
          priceNote: 'Multi-step correction for paint with deeper defects.',
          priceUnit: null,
          includes: [
            'Decontamination and multi-step paint correction',
            'Five-year ceramic coating on the paint',
            'Final detail and inspection under shop lighting',
          ],
          booking: null,
        },
      ],
      faqs: [
        {
          q: 'How long does a ceramic coating last?',
          a: 'It depends on the package. Coating packages run up to five years, and we will tell you at the paint evaluation which one suits the car and how you use it.',
        },
        {
          q: 'Where is the coating done?',
          a: 'At the shop in Port St. Lucie. A coating needs controlled conditions and proper lighting to be applied and inspected properly, which is why it is not one of the mobile services.',
        },
        {
          q: 'Do I need paint correction first?',
          a: 'We start every job with a paint evaluation. A coating locks in whatever is underneath it, so swirl marks and scratches are polished out first when the paint needs it. That is quoted separately.',
        },
        {
          q: 'Can I still wash the car normally?',
          a: 'Yes, and it gets easier. Hand washing is the right way to look after a coated car. Stay out of automatic washes with spinning brushes, which put the swirls straight back in.',
        },
        {
          q: 'Will a coating stop rock chips?',
          a: 'No. A coating adds gloss, chemical resistance and much easier cleaning, but it is thin. Stopping chips from road debris is what paint protection film is for.',
        },
        {
          q: 'Can you coat the interior and the tires too?',
          a: 'Yes, interior and tire coatings are available alongside the paint coating. Ask when you book and they will be quoted with the rest of the work.',
        },
      ],
    },
    {
      slug: 'paint-protection-film',
      name: 'Paint Protection Film',
      // [owner] writes it with the acronym. The acronym rides on the pills and
      // the hero list only; titles, schema and breadcrumbs use `name`.
      displayLabel: 'Paint Protection Film (PPF)',
      shortDescription:
        'A nearly invisible self healing film that takes the rock chips, scratches and road debris instead of your paint.',
      // [owner] 2026-11-08 update list. Was 2999 as a single figure; it is now
      // the floor of the Full Front End package in the tiers below.
      priceFrom: 2499,
      priceNote: 'Starting price for the Full Front End; the final price depends on vehicle size and coverage.',
      // Quoted per vehicle after we see how much coverage you want, so no
      // online booking.
      booking: null,
      where: 'shop',
      comingSoon: false,
      image: 'black-ram-truck-garage-hex-lights.jpg',
      tiers: [
        {
          name: 'Full Front End',
          slug: 'full-front-end',
          anchor: 'full-front-end',
          priceFrom: 2499,
          priceNote: 'The panels that take the road debris.',
          priceUnit: null,
          includes: ['Full hood', 'Front bumper', 'Fenders', 'Mirrors'],
          booking: null,
        },
        {
          name: 'Full Body',
          slug: 'full-body',
          anchor: 'full-body',
          priceFrom: 5999,
          priceNote: 'Every painted panel on the vehicle.',
          priceUnit: null,
          includes: ['Every painted panel', 'Gloss or matte finish', 'Self-healing top layer'],
          booking: null,
        },
      ],
      faqs: [
        {
          q: 'Where is paint protection film fitted?',
          a: 'At the shop in Port St. Lucie. Film has to be cut, laid and squeegeed in clean, controlled conditions, so it is not something that happens on a driveway.',
        },
        {
          q: 'Should I get film or a ceramic coating?',
          a: 'Film stops physical damage like rock chips and scratches. A coating adds gloss and makes the car far easier to clean. Plenty of owners do both, with film on the impact areas.',
        },
        {
          q: 'Can you see the film once it is on?',
          a: 'It is a nearly invisible layer, applied so it preserves the factory finish underneath. It is available in gloss or matte depending on the look you want.',
        },
        {
          q: 'What does self healing mean?',
          a: 'The top layer of the film recovers from fine scratches and swirls with heat or sunlight, so small marks fade out rather than staying in the surface.',
        },
        {
          q: 'Do I have to cover the whole car?',
          a: 'No. How much of the vehicle gets covered is the main thing that moves the price, so tell us what you are trying to protect and we will quote the coverage that fits.',
        },
      ],
    },
    {
      slug: 'paint-correction',
      name: 'Paint Correction',
      shortDescription:
        'Machine polishing that takes swirl marks, light scratches and oxidation out of the paint before anything is sealed over it.',
      // Correction is quoted against what the paint actually needs, so there
      // is no starting figure. A number here would be invented.
      priceFrom: null,
      priceNote: 'Quoted after a paint evaluation.',
      booking: null,
      where: 'shop',
      comingSoon: false,
      image: 'black-mercedes-cls-gloss-front-quarter.jpg',
      faqs: [
        {
          q: 'What is the difference between a one step and a multi step correction?',
          a: 'A one step polish lifts the lighter defects and brings the gloss back in a single pass. Multi step work cuts further and finishes finer, for paint with deeper swirls or oxidation. The evaluation decides which the car needs.',
        },
        {
          q: 'Do I need a coating afterwards?',
          a: 'It is recommended rather than required. Correction removes a thin amount of clear coat to level the defects, and a coating keeps that finish from going straight back to where it was.',
        },
        {
          q: 'Will it remove deep scratches?',
          a: 'Polishing removes light defects: swirl marks, wash marring, haze and oxidation. A scratch that has gone through the clear coat is paint work, not correction, and we will tell you that at the evaluation.',
        },
        {
          q: 'How long does the result hold up?',
          a: 'That depends almost entirely on how the car is washed afterwards. Automatic washes with spinning brushes put the swirls straight back in. A ceramic coating over the corrected paint is what makes it last.',
        },
        {
          q: 'Where is paint correction done?',
          a: 'At the shop in Port St. Lucie. Correction is measured against what the lighting shows, which is why it happens under proper lights rather than in a driveway.',
        },
      ],
    },
    {
      slug: 'window-tint',
      name: 'Window Tinting',
      shortDescription:
        'Tint that cuts heat and glare, blocks the ultraviolet rays that age an interior, and adds privacy.',
      // UNCHANGED, on purpose. Window tint is not in his Flyra price book and
      // owner answer E (still offered? at what price?) came back blank, so the
      // page keeps exactly the price and copy it had. On the client follow-up
      // list; do not touch it until he answers.
      priceFrom: 399,
      priceNote: 'Starting price; the final quote depends on the vehicle and the number of windows.',
      booking: null,
      where: 'shop',
      comingSoon: false,
      image: 'white-bmw-x3-dark-tinted-glass.jpg',
      faqs: [
        {
          q: 'Where does the tinting happen?',
          a: 'At the shop in Port St. Lucie. Film has to go on in clean, still air and then cure, so tinting is not one of the services we bring to a driveway.',
        },
        {
          q: 'Is window tint legal in Florida?',
          a: 'Florida sets limits on how much light each window has to let through, and the limits differ for the windshield, the front sides and the rear. We tint to the legal limit.',
        },
        {
          q: 'What does tint actually do?',
          a: 'It reduces heat and glare, blocks up to ninety nine percent of harmful ultraviolet rays, and adds privacy. Keeping ultraviolet off the dash and seats is what slows an interior aging.',
        },
        {
          q: 'How soon can I roll the windows down?',
          a: 'Freshly applied film needs a few days to cure before the windows are moved. We will tell you at the appointment exactly how long to leave them alone.',
        },
        {
          q: 'Does tint help with a hot Florida interior?',
          a: 'Yes. Cutting the heat that comes through the glass is the main reason most people on the Treasure Coast ask for it, with the look and the privacy as the bonus.',
        },
      ],
    },
    // ---------------------------------------------------------------------
    // [owner] 2026-11-08 update list: four services the site did not carry.
    // All four have image: null, so they use the template's no-photo
    // treatment. There is no client photography of flood damage, mold or a
    // pressure washer, and a stock photo of someone else's work on a page
    // selling this work is the one thing AGENT.md bans outright.
    // ---------------------------------------------------------------------
    {
      slug: 'water-damage-detail',
      name: 'Water Damage Detail',
      shortDescription:
        'Flood and leak damage taken out of a vehicle interior: moisture extracted from carpet and padding, mildew treated, then dried and deodorized.',
      priceFrom: 1000,
      priceNote: 'Starting price; the final quote depends on how far the water got and how long it sat.',
      priceUnit: null,
      booking: null,
      where: 'shop',
      comingSoon: false,
      image: null,
      addOns: [],
      faqs: [
        {
          q: 'What does a water damage detail actually involve?',
          a: 'Moisture is extracted from the carpets, the padding underneath and the upholstery, mold and mildew are treated, and the interior is deodorized and dried. An ozone treatment is included.',
        },
        {
          q: 'Do you repair the electrics or the parts that got wet?',
          a: 'No. Electrical, mechanical and structural repairs are not included in this service. What we do is the interior: get the water out, treat what grew in it, and get it dry and breathable again.',
        },
        {
          q: 'Where is the work done?',
          a: 'At the shop in Port St. Lucie. Drying an interior properly needs the vehicle to sit somewhere controlled for a while, which is not something that happens in a driveway.',
        },
        {
          q: 'How soon should I bring it in?',
          a: 'As soon as you can. Standing water in carpet padding is what turns a wet interior into a mold problem, and the longer it sits the more of the interior has to come apart to deal with it.',
        },
      ],
    },
    {
      slug: 'mold-removal-detail',
      name: 'Mold Removal Detail',
      shortDescription:
        'Mold and mildew taken out of a vehicle interior, with the surfaces treated, the moisture extracted and an ozone treatment to finish.',
      priceFrom: 1000,
      priceNote: 'Starting price; the final quote depends on how widespread the growth is.',
      priceUnit: null,
      booking: null,
      where: 'shop',
      comingSoon: false,
      image: null,
      addOns: [],
      faqs: [
        {
          q: 'What causes mold in a car down here?',
          a: 'Moisture that never fully dried: a window left open in an afternoon storm, a leaking seal, a spill into the carpet padding. Florida humidity does the rest, and it does it fast.',
        },
        {
          q: 'What does the service include?',
          a: 'The affected surfaces are treated, moisture is extracted from the carpets, padding and upholstery, and the interior is deodorized and dried. An ozone treatment is part of the job.',
        },
        {
          q: 'Will the smell come back?',
          a: 'Not if the source of the moisture is fixed. Mold grows back wherever water keeps arriving, so if the cause is a leaking seal or a blocked drain, that needs sorting or the interior will go the same way again.',
        },
        {
          q: 'Do you fix the leak that caused it?',
          a: 'No. Electrical, mechanical and structural repairs are outside this service. We will tell you what we found and where the water looks to be getting in, so you can get it dealt with.',
        },
      ],
    },
    {
      slug: 'pressure-washing',
      name: 'Pressure Washing',
      shortDescription:
        'Driveways, pavers and house exteriors washed at your property, with paver sealing priced by the square foot.',
      priceFrom: 150,
      priceNote: 'Starting price for a driveway; a house exterior and paver sealing are priced separately.',
      priceUnit: null,
      booking: null,
      where: 'property',
      comingSoon: false,
      image: null,
      addOns: [],
      tiers: [
        {
          name: 'Driveway',
          slug: 'driveway',
          anchor: 'driveway',
          priceFrom: 150,
          priceNote: 'A standard residential driveway.',
          priceUnit: null,
          includes: ['Driveway washed down', 'Dirt, algae and staining lifted'],
          booking: null,
        },
        {
          name: 'House Exterior',
          slug: 'house',
          anchor: 'house',
          priceFrom: 500,
          priceNote: 'Priced on the size of the house.',
          priceUnit: null,
          includes: ['House exterior washed', 'Dirt, algae and mildew lifted off the surfaces'],
          booking: null,
        },
        {
          name: 'Paver Sealing',
          slug: 'paver-sealing',
          anchor: 'paver-sealing',
          priceFrom: 1.5,
          priceNote: 'Measured on the area being sealed.',
          priceUnit: 'per sq ft',
          includes: ['Pavers washed first', 'Sealer applied over the cleaned surface'],
          booking: null,
        },
      ],
      faqs: [
        {
          q: 'Do you come to the property for this?',
          a: 'Yes. Pressure washing happens at your property, the same way the detailing packages do. Nothing needs to be dropped anywhere.',
        },
        {
          q: 'What does paver sealing do?',
          a: 'It goes on over cleaned pavers and slows down how fast they stain and grow algae again. It is priced by the square foot because the only thing that moves the number is how much ground there is.',
        },
        {
          q: 'Will it damage the surface?',
          a: 'Pressure is matched to what is being cleaned. Concrete takes more than a painted surface or a screen enclosure, which is why the house exterior and the driveway are priced and handled differently.',
        },
        {
          q: 'Can you do it at the same time as a detail?',
          a: 'Yes, and it is worth asking. If we are already at the house for a package, doing the driveway on the same visit saves a second trip.',
        },
      ],
    },
    {
      slug: 'dealerships-fleet',
      name: 'Dealerships & Fleet',
      shortDescription:
        'Volume detailing for dealerships, companies and fleets around Port St. Lucie, scheduled around your lot or your drivers.',
      // Quote only. There is no per-vehicle figure because the number depends
      // entirely on volume and turnaround, and a starting price here would be
      // invented.
      priceFrom: null,
      priceNote: 'Quoted on volume and turnaround.',
      priceUnit: null,
      booking: null,
      where: null,
      comingSoon: false,
      image: null,
      addOns: [],
      faqs: [
        {
          q: 'Do you already work with dealerships?',
          a: 'Yes. Dealerships, companies and owners of high end vehicles around Port St. Lucie are a steady part of the work, which is where a lot of the volume experience comes from.',
        },
        {
          q: 'How is fleet work priced?',
          a: 'On volume and turnaround rather than per vehicle off a menu. Tell us how many vehicles, what state they are usually in and how often, and we will come back with a figure.',
        },
        {
          q: 'Can you work on site at our lot?',
          a: 'The detailing packages are mobile, so lot work is normal. Coating, film and correction are done at the shop because they need controlled conditions and proper lighting.',
        },
      ],
    },
  ],

  // [owner] 2026-11-08 update list, matching the business hours set in Flyra:
  // every day, 7:00 AM to 7:00 PM. These are now REAL hours rather than the
  // "open 24 hours" the Google Business Profile carried, so the structured
  // data and the visible line finally say the same thing.
  //
  // The booking flow reads the same window from Flyra rather than from here,
  // because Flyra is what actually refuses a slot outside business hours.
  // Keep the two in step: a visitor who is offered 7:30 PM here and refused
  // there has been lied to by this file.
  hours: [
    { day: 'Monday', open: '07:00', close: '19:00' },
    { day: 'Tuesday', open: '07:00', close: '19:00' },
    { day: 'Wednesday', open: '07:00', close: '19:00' },
    { day: 'Thursday', open: '07:00', close: '19:00' },
    { day: 'Friday', open: '07:00', close: '19:00' },
    { day: 'Saturday', open: '07:00', close: '19:00' },
    { day: 'Sunday', open: '07:00', close: '19:00' },
  ],

  // What every visible surface prints: the header strip, the footer and the
  // contact page. Says the same thing as config.hours above, in words.
  hoursDisplay: 'Open 7 days, 7 AM to 7 PM, by appointment',

  yearsInBusiness: 15,
  // [owner] confirmed 2026-10-19. Anywhere a "since" line is printed, this is
  // the number, not this year minus yearsInBusiness.
  foundingYear: 2011,
  licenseNumber: null,
  insured: null,

  // Stays empty on purpose. These are the business's own Google reviews, and a
  // business marking up its own Google reviews is self-serving. They render
  // visibly through `testimonials` instead, with no schema attached.
  reviews: [],

  // Two different things, deliberately kept apart.
  //
  // The claim is the owner's, stated 2026-10-19: 1,000+ across all of his
  // platforms. It is what the headline surfaces print, in his words.
  //
  // The counts are what this site can verify, each with the date it was read.
  // They are what the rating bar, the stats strip and the reviews page print,
  // so a visitor can always see which part of the number has receipts.
  // Never fold one into the other.
  // [owner] 2026-11-08 update list. The claim is now the sum of the two counts
  // below, floored to the nearest hundred: 449 on Google plus 290 on Facebook
  // is 739, so "700+" is a figure this site can show its working for. That
  // replaced "1,000+ across Google and social media", which counted platforms
  // nobody could check.
  reviewClaimTotal: '700+',
  reviewClaimScope: 'across Google and Facebook',
  // [flyra] read 2026-11-11 through his Flyra Google Business Profile
  // connection: 449 reviews, 5.0 average.
  reviewCountExact: 449,
  reviewCountAsOf: '2026-11-11',
  // [owner] 2026-11-08 update list.
  facebookReviewCount: 290,
  facebookReviewsAsOf: '2026-11-08',
  reviewRating: 5.0,
  reviewLink: 'https://share.google/c74H92ObjC9aOQCWb',

  // Verbatim, first name and last initial, no dates, no platform logos. Nine
  // from the 2026-10-18 Google read, ten more sent by the owner on 2026-10-19.
  testimonials: [
    {
      quote:
        'Premium Detailing did an absolute 10/10 job on my truck! They brought out an unbelievable shine on the paint and cleaned the wheels and tires spotless. The interior seats and floor mats look showroom-ready. Professional, thorough, and top-tier service right here in St. Lucie County. Will definitely use again!',
      name: 'Christopher C.',
    },
    {
      quote:
        'Brought my 2026 truck in for a ceramic coating, wow, my truck came out. Amazing! They coated the entire vehicle in including the tires with this permanent tire coating, and it looks absolutely fabulous, extremely satisfied with the work done today!',
      name: 'Corey K.',
    },
    {
      quote:
        'They just did a silver package and a clay bar and made my car look absolutely brand new. This is a six-year-old car and I’ve never seen it. Look this good even when I took it off the lot. Extremely satisfied with the work done today.',
      name: 'Witz-Berline J.',
    },
    {
      quote:
        'I just had my brand new truck ceramic coated by them, it looks absolutely amazing and better than the first day that I bought it. Extremely excited for the future on how easy it is going to be to maintain this vehicle now! Thank you guys, I really appreciate it.',
      name: 'Owen D.',
    },
    {
      quote:
        'Chris really hooked me up!! I called him with an emergency and he helped me out on a weekend!! They did an amazing job on the detail and the car has never looked better. I highly recommend him for all your detail needs!!',
      name: 'Ryan U.',
    },
    {
      quote:
        'My car was trashed. The seats were stained in the inside was really dirty but now my car looks amazing! They did a shampoo on the seats and got out the dog hair and sand that was on the inside. Extremely satisfied.',
      name: 'Janessa C.',
    },
    {
      quote:
        'I just received a five-year coating on my brand new bmw x7! Insane how amazing my cars looks now! I’m so happy! They even ceramic coated the inside too! I couldn’t be happier!',
      name: 'Tara E.',
    },
    {
      quote:
        'This company made my car look brand new and it’s a 2019, it’s black paint so it’s very difficult to take care of but I’m extremely satisfied with the work that was done today! Thank you guys so much. I really appreciate you for putting a good coat of wax on my paint.',
      name: 'Michael P.',
    },
    {
      quote:
        'Chris and His team came out to do a bronze package on my 2016. And it looks better than ever period extremely satisfied with the work that was done today period highly recommend them!',
      name: 'John P.',
    },
    {
      quote:
        'Daily driver and kid transport made good as new. Sebastian was our tech for this detailing and he did an amazing job. Wife and I were very pleased with the job, given the time limit needed for our kid’s pick up time. Made the Mother’s Day gift perfect.',
      name: 'Josh C.',
    },
    {
      quote:
        'Chris came out with his team and they did a silver package on my vehicle that I’m looking to trade in and why it looks absolutely fabulous! Extremely satisfied with the job done. Highly recommend.',
      name: 'Jon M.',
    },
    {
      quote:
        'I’m expecting my first child soon and I wanted to have my car clean because we have a lot of dog hair. Chris and his team came out and made my car look absolutely fabulous and now I feel very comfortable with my new child coming. Thank you guys so much, we greatly appreciate it.',
      name: 'Julie M.',
    },
    {
      quote:
        'I was referred to this company by one of my friends and I’m very glad that I was sent this company. My bike looks absolutely fabulous now. Extremely satisfied with the work that was done today!',
      name: 'Guy F.',
    },
    {
      quote:
        'I just received a silver package plus an engine detail by them and while my car looks amazing! Extremely grateful that I found them. Highly recommend them!',
      name: 'Sarah H.',
    },
    // Anthony D.'s review is HELD OUT, not lost. It ends a clause with "taken
    // care of." and verify check 18 reads any "of." as the signature of a
    // blank {config.*} interpolation. That is a template bug, logged in
    // TEMPLATE-ISSUES.md at the repo root; it is not ours to patch from a
    // client site, and the alternative was editing a customer's words. Once
    // the rule is fixed in AA-Template and pulled down, paste the quote back
    // untouched:
    //
    //   quote: 'Kris came out with his team and did a fabulous job on both
    //   cars, they did a Clay bar and took out the dog hair and made sure that
    //   the paint was waxed and taken care of. Extremely satisfied with the
    //   work that was done today. Thank you guys!'
    //   name: 'Anthony D.'
    {
      quote:
        'I just got my side-by-side clean by them and it looks immaculate. I’m putting it up for sale and I just wanted to make it look brand new and that’s exactly what this company did. Very satisfied with the work that was done!',
      name: 'Richard M.',
    },
    {
      quote:
        'We just got a new car and we wanted it to look brand new since we bought it used. We wanted to make sure that our kids are driving in a very clean car and I’m very satisfied with the work that was done today by this company. It looks absolutely fabulous, thank you guys!',
      name: 'Ariana R.',
    },
    {
      quote:
        'Amazing experience that I just had with this company! They came out to my house and made my truck look brand new, he also gave me a quote to do a ceramic coating on my M2, very excited to use them in the future!',
      name: 'Anthony R.',
    },
    {
      quote:
        'Chris came today and did a light interior detail with a wash and wax on the exterior. My rims were in deep need of cleaning and he came out and put on a show! So glad I chose him to do my car!',
      name: 'Kevonlian B.',
    },
  ],

  // Exact counted figures, not the rounded combined one, so the strip and the
  // rating bar are never two different claims about the same thing.
  stats: [
    { value: '449', suffix: '', label: 'Five-star Google reviews' },
    { value: '290', suffix: '', label: 'Five-star Facebook reviews' },
    { value: '15', suffix: '', label: 'Years detailing the Treasure Coast' },
  ],

  coverage: [
    {
      county: 'St. Lucie County',
      towns: [
        'Port St. Lucie',
        'St. Lucie West',
        'Tradition',
        'Torino',
        'St. James',
        'Southbend',
        'Fort Pierce',
        'Lakewood Park',
        'White City',
        'Hutchinson Island',
      ],
    },
    {
      county: 'Martin County',
      towns: ['Stuart', 'Palm City', 'Jensen Beach', 'Hobe Sound', "Sewall's Point"],
    },
    {
      county: 'Palm Beach County',
      towns: ['Jupiter', 'Juno Beach', 'Tequesta'],
    },
    {
      county: 'Indian River County',
      towns: ['Vero Beach', 'Sebastian'],
    },
  ],

  // The moving strip under the rating bar. Ordered by hand: the Urus leads
  // because the owner asked for it, then the two Huracans, the Range Rover,
  // the Tesla and the X6, then the strongest remaining exteriors. Every tile
  // is checked for a readable plate and for faces before it goes in here.
  carStrip: [
    'gold-lamborghini-urus-rear-quarter.jpg',
    'orange-lamborghini-huracan-driveway.jpg',
    'white-lamborghini-red-wheels-driveway.jpg',
    'black-range-rover-sport-front.jpg',
    'blue-tesla-model-s-driveway.jpg',
    'black-bmw-x6-finished-on-pavers.jpg',
    'red-mercedes-maybach-gls-driveway.jpg',
    'satin-black-audi-rs6-hood-open.jpg',
    'blue-cadillac-escalade-esv-front-quarter.jpg',
    'black-acura-nsx-parking-lot.jpg',
    'red-bmw-x3-m50-outside-shop.jpg',
    'grey-porsche-panamera-front-quarter.jpg',
    'black-corvette-c8-side-profile-shop.jpg',
    'white-mercedes-amg-gle-outside-shop.jpg',
    'chevrolet-ssr-two-tone-paver-driveway.jpg',
    'silver-tesla-model-x-driveway.jpg',
  ],

  // No true before/after pair exists in any photo source the client has sent.
  // A pair is only ever the same vehicle from roughly the same angle, one
  // dirty and one finished. The component ships; the section renders nothing
  // until the client sends pairs. It is the first ask on the follow-up list.
  beforeAfter: [],

  // SCAFFOLD, waiting on the owner. Answer J on the 2026-11-08 list asked for
  // a founder story, a photo and the WPTV clip link, and came back blank, so
  // the About page renders no founder section at all rather than one written
  // for him. Fill name, role, story, optionally image and press, and it
  // appears. On the client follow-up list.
  founder: null,

  // No single headline promotion. The standing offers live in `specials`.
  offer: null,

  // [flyra] read 2026-11-11 and [owner] 2026-11-08 update list.
  //
  // techIds is EMPTY, which switches the whole booking flow off and falls every
  // package back to a quote CTA. That is deliberate, not an oversight: the two
  // Flyra employee ids for Evan Russo and Schuyler Clawson come from
  // GET /employees, and FLYRA_API_KEY could not be read to make that call (it
  // is present in Vercel Production but decrypts to an empty value, and it is
  // absent from Preview entirely). Guessing an employee id would dispatch real
  // jobs to nobody.
  //
  // TO FINISH: put the key in Vercel for Production AND Preview, run
  // GET /employees, paste the two ids here. Nothing else changes.
  booking: {
    timezone: 'America/New_York',
    // Flyra's own minimum notice setting. The slot route never offers anything
    // sooner, and the booking route re-checks it, because a visitor who books
    // a 20 minute-from-now slot has booked a job nobody can get to.
    minNoticeHours: 6,
    daysAhead: 7,
    techIds: [],
    // Flyra deposits apply to estimates, not to a booked detail.
    depositRequired: false,
    notes: [
      'No deposit is needed to book a detail.',
      'You will get a text confirming your appointment.',
      'A processing fee applies to card payments.',
    ],
  },


  // [owner] 2026-11-08 update list. Standing offers, not a limited-time
  // promotion: no countdown, no expiry anybody would have to maintain.
  specials: {
    bundle: {
      name: '5-Detail Bundle',
      price: 500,
      unitPrice: 100,
      visits: 5,
      saving: 250,
      detail: 'Prepay for five Bronze details and use them whenever you want.',
    },
    referral: {
      give: 100,
      get: 100,
      condition: 'when a friend you send us books a ceramic coating',
    },
    // Flyra subscriptions. Billed per completed visit, so a month nobody
    // detailed the vehicle is a month nobody was charged.
    plans: [
      {
        name: 'Monthly Maintenance, Bronze',
        pricePerVisit: 125,
        visitsPerYear: 12,
        note: 'One Bronze detail a month, billed after each visit.',
      },
      {
        name: 'Monthly Maintenance, Silver',
        pricePerVisit: 210,
        visitsPerYear: 12,
        note: 'One Silver detail a month, billed after each visit.',
      },
    ],
  },

  profiles: {
    gbp: 'https://www.google.com/maps?cid=15187933252334437823',
    facebook: 'https://www.facebook.com/Premiumdetailingg',
    instagram: 'https://www.instagram.com/premiumdetailing__',
    yelp: null,
    tiktok: 'https://www.tiktok.com/@premiumdetailingg',
  },

  // The Instagram section. There is no live feed: that needs the owner to
  // connect the account through Behold or the Instagram Graph API, which is
  // still on the client follow-up list. Until then these are official
  // permalinks pasted by hand.
  //
  // The follower count is now null and the line does not render. "20K" was
  // read by hand on 2026-10-19 and was never going to be true for long, and
  // the owner did not supply a fresh figure with the November list. A stale
  // follower count is the kind of number a visitor can check in one tap.
  social: {
    instagram: {
      handle: 'premiumdetailing__',
      url: 'https://www.instagram.com/premiumdetailing__/',
      followers: null,
      followersAsOf: null,
      feedUrl: null,
      posts: [
        {
          url: 'https://www.instagram.com/reel/DHpDXAzRXrK/',
          excerpt: 'We brought this truck back to life with one of our more simpler packages, take a look at the results!',
        },
        {
          url: 'https://www.instagram.com/reel/DGEfXCKx0AC/',
          excerpt: 'Disaster detail brought back to life by yours truly.',
        },
        {
          url: 'https://www.instagram.com/reel/DGG0L7rysWd/',
          excerpt:
            'We completed a paint enhancement + a 5 year ceramic coating + an interior ceramic coating on this 2025 BMW X7 M60i',
        },
        {
          url: 'https://www.instagram.com/reel/DHhSDFixIdX/',
          excerpt: 'This is truly one of the reasons why we’ve grown so much as a company. I can’t do it alone! Shout out to the team!',
        },
        {
          url: 'https://www.instagram.com/reel/DChJb6xxlrs/',
          excerpt: 'Here with WPTV to get our story out.',
        },
        {
          url: 'https://www.instagram.com/reel/DFyb4s3ysvk/',
          excerpt:
            'This customer came in to have some minor scratches removed along with a one step polish and a 5 year coating on the paint, glass & wheels',
        },
      ],
    },
    // [owner] 2026-11-08 update list asked for TikTok beside Instagram. The
    // profile embed renders whatever he has posted most recently, so unlike the
    // Instagram tiles there is nothing here to keep up to date by hand.
    tiktok: {
      handle: 'premiumdetailingg',
      url: 'https://www.tiktok.com/@premiumdetailingg',
    },
  },

  faqs: [
    {
      q: 'Do you come to me?',
      a: 'The Bronze, Silver and Gold packages come to you, so we detail the vehicle where it is parked, and pressure washing happens at your property. Ceramic coating, paint protection film, paint correction, window tint and the water damage and mold work are done at the shop.',
    },
    {
      q: 'Which package should I pick?',
      a: 'Bronze maintains a car that is already relatively clean. Silver adds wax or a sealant on the paint and cleans and protects the interior surfaces. Gold goes further again, decontaminating the paint and taking the interior down to the vents, seams and headliner.',
    },
    {
      q: 'How much does a detail cost?',
      a:
        `Bronze starts at $${PKG.bronze}, Silver at $${PKG.silver} and Gold at $${PKG.gold}. Add-ons are priced individually and listed on the detailing page, and the final quote depends on the size and condition of the vehicle.`,
    },
    {
      q: 'How long does a detail take?',
      a: 'Bronze takes about 45 minutes, Silver about an hour and Gold about 2 hours. A larger or much dirtier vehicle takes longer, and the time you choose when you book holds that whole window for you.',
    },
    {
      q: 'How long does a ceramic coating last?',
      a: 'Coating packages run up to five years depending on which one suits the car. We start with a paint evaluation, correct the paint where it needs it, then apply the coating and inspect the finished job.',
    },
    {
      q: 'Do you detail trucks, SUVs and motorcycles?',
      a: 'Yes. Cars, trucks, SUVs and motorcycles are all regular work for us. Tell us the year, make and model when you get in touch and the quote will reflect the size of the job.',
    },
    {
      q: 'What areas do you cover?',
      a: 'Port St. Lucie and the wider Treasure Coast, including Stuart, Palm City, Jensen Beach, Sewall’s Point, Jupiter, Fort Pierce and Vero Beach. If you are not sure whether you are in range, send your ZIP code with your quote request.',
    },
    {
      q: 'How do I book?',
      a: 'Pick a package on the booking page, choose a time and fill in your details, and you will get a text confirming the appointment. No deposit is needed. Everything priced per vehicle, like coating, film, correction and tint, takes a quote request instead.',
    },
    {
      q: 'Can I get paint protection film and window tint from you?',
      a: 'Yes, both are available. Neither has a booking calendar because the price depends on the vehicle and how much coverage you want, so send a quote request and we will come back with a figure and timing.',
    },
  ],

  images: {
    // [owner] wants an exotic as the first thing on the site.
    //
    // The portrait rear quarter, with theme.heroVariant 'split'. The wide crop
    // of the same wash (gold-lamborghini-urus-hero.jpg, still in originals)
    // was built and rejected: the full-bleed hero box is 0.59:1 on a 390px
    // phone while that crop is 1.85:1, so object-cover throws away 68% of its
    // width and the phone render showed a house, a palm frond and a sliver of
    // roofline. An exotic nobody can see on a phone is not an exotic hero.
    // To go back to it: this line, plus heroVariant in theme.ts.
    hero: 'gold-lamborghini-urus-rear-quarter.jpg',
    about: 'detailer-polishing-lifted-truck-driveway.jpg',
    gallery: [
      { name: 'gold-lamborghini-urus-driveway-wash.jpg', tag: 'process' },
      { name: 'gold-lamborghini-urus-rear-quarter.jpg', tag: 'exterior' },
      { name: 'red-mercedes-maybach-gls-driveway.jpg', tag: 'exterior' },
      { name: 'satin-black-audi-rs6-hood-open.jpg', tag: 'exterior' },
      { name: 'black-porsche-macan-shop-hex-lights.jpg', tag: 'coatings' },
      // Was the hero until the owner asked for an exotic first. It is one of
      // the best shop shots there is, so it moves into the gallery rather than
      // out of the site.
      { name: 'silver-coupe-garage-hex-lights.jpg', tag: 'coatings' },
      { name: 'mercedes-amg-gle-red-leather-interior.jpg', tag: 'interior' },
      { name: 'bmw-x5-wheel-red-caliper-close.jpg', tag: 'wheels' },
      { name: 'blue-cadillac-escalade-esv-front-quarter.jpg', tag: 'exterior' },
      { name: 'harley-road-glide-blue-driveway.jpg', tag: 'bikes' },
      { name: 'bmw-m2-cs-gold-wheels-shop-hex-lights.jpg', tag: 'coatings' },
      { name: 'mercedes-gle-cargo-area-cleaned.jpg', tag: 'interior' },
      { name: 'black-acura-nsx-parking-lot.jpg', tag: 'exterior' },
      { name: 'red-ferrari-308-open-hood-carport.jpg', tag: 'process' },
      { name: 'black-corvette-c8-side-profile-shop.jpg', tag: 'exterior' },
      { name: 'grey-corvette-c8-convertible-driveway.jpg', tag: 'exterior' },
      { name: 'red-bmw-x3-m50-outside-shop.jpg', tag: 'exterior' },
      { name: 'white-mercedes-amg-gle-outside-shop.jpg', tag: 'exterior' },
      { name: 'grey-porsche-panamera-front-quarter.jpg', tag: 'exterior' },
      { name: 'black-bmw-m2-wet-driveway.jpg', tag: 'exterior' },
      { name: 'ford-super-duty-wheel-mud-tire.jpg', tag: 'wheels' },
      { name: 'black-bmw-x6-m-outside-shop.jpg', tag: 'exterior' },
      { name: 'green-lexus-rx-front-quarter-shop.jpg', tag: 'exterior' },
      { name: 'chevrolet-ssr-two-tone-paver-driveway.jpg', tag: 'exterior' },
      { name: 'silver-tesla-model-x-driveway.jpg', tag: 'exterior' },
      { name: 'white-bmw-x7-m-sport-street.jpg', tag: 'exterior' },
      { name: 'grey-bmw-x5-front-quarter-shop.jpg', tag: 'exterior' },
      { name: 'black-bmw-x5-paver-driveway.jpg', tag: 'exterior' },
      { name: 'white-cadillac-escalade-front-quarter.jpg', tag: 'exterior' },
      { name: 'blue-cadillac-escalade-front-detail.jpg', tag: 'exterior' },
      { name: 'green-chevrolet-tahoe-front-quarter.jpg', tag: 'exterior' },
      { name: 'green-chevrolet-tahoe-outside-shop.jpg', tag: 'exterior' },
      { name: 'white-volvo-ex30-paver-driveway.jpg', tag: 'exterior' },
      { name: 'class-c-motorhome-outside-shop.jpg', tag: 'exterior' },
      { name: 'black-bmw-x6-finished-on-pavers.jpg', tag: 'exterior' },
      { name: 'black-mercedes-cls-gloss-front-quarter.jpg', tag: 'coatings' },
      { name: 'porsche-cayenne-red-leather-interior.jpg', tag: 'interior' },
      { name: 'vw-wheel-cleaned-on-pavers.jpg', tag: 'wheels' },
      { name: 'bmw-m4-foam-wash-mobile-van.jpg', tag: 'process' },
      { name: 'red-touring-motorcycle-polished-garage.jpg', tag: 'bikes' },
      { name: 'blue-tesla-model-s-driveway.jpg', tag: 'exterior' },
      { name: 'hot-water-extraction-cloth-seat.jpg', tag: 'interior' },
      { name: 'white-lamborghini-red-wheels-driveway.jpg', tag: 'coatings' },
      { name: 'porsche-wheel-close-up.jpg', tag: 'wheels' },
      { name: 'black-mustang-gloss-front-quarter.jpg', tag: 'coatings' },
      { name: 'orange-lamborghini-huracan-driveway.jpg', tag: 'exterior' },
      { name: 'pickup-truck-interior-dash-finished.jpg', tag: 'interior' },
      { name: 'red-ferrari-foam-wash-bay.jpg', tag: 'process' },
      { name: 'alfa-wheel-red-caliper.jpg', tag: 'wheels' },
      { name: 'black-ram-truck-garage-hex-lights.jpg', tag: 'coatings' },
      { name: 'red-motorcycle-fender-gloss.jpg', tag: 'bikes' },
      { name: 'white-alfa-giulia-side-profile.jpg', tag: 'exterior' },
      { name: 'detail-brush-cleaning-red-door-panel.jpg', tag: 'interior' },
      { name: 'black-infiniti-q50-gloss-front.jpg', tag: 'coatings' },
      { name: 'blue-lancer-evo-front-quarter.jpg', tag: 'exterior' },
      { name: 'black-mercedes-cls-front-hood.jpg', tag: 'process' },
    ],
    // No usable footage: the client's only video is a .mov that could not be
    // probed or transcoded on this machine (no ffmpeg, no Homebrew).
    heroVideo: null,
  },

  contactForm: {
    splitName: false,
    address: 'off',
    zip: 'optional',
    serviceDropdown: true,
    emailRequired: false,
    timeframe: {
      label: 'When do you want it done?',
      // No empty first entry: ContactForm already renders its own
      // <option value="">Choose one</option> placeholder.
      options: ['This week', 'Within a month', 'Just getting prices'],
      required: false,
    },
    messageLabel: 'Tell us about your vehicle',
    messagePlaceholder:
      'Year, make, and model, and what you want done: a package, ceramic coating, paint correction, tint, or paint protection film.',
    submitLabel: 'Get My Quote',
  },

  // Launched 2026-11-04. app/robots.ts and app/layout.tsx read this one;
  // launch.indexable below is the same fact in the field the ops platform
  // reads, and the schema refuses to parse if the two ever disagree.
  prelaunch: false,

  launch: {
    indexable: true,
  },

  // Google Ads. The two labels are the send_to values Google issued for this
  // account's form and call conversion actions. No booking label: there is no
  // /book conversion action yet.
  tracking: {
    googleAdsId: 'AW-696214868',
    conversions: {
      form: 'AW-696214868/W60bCJ_zirQdENTK_csC',
      call: 'AW-696214868/BfqqCNrpirQdENTK_csC',
    },
  },

  domain: 'https://www.premiumdetailingpsl.com',
}

export default config
