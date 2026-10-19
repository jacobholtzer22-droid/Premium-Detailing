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
 * anything read off the old site.
 */
const config: SiteConfigInput = {
  // PLACEHOLDER. Swap for the real platform slug at launch, then redeploy.
  // Until this is a real Business row, every lead from this site is lost.
  businessSlug: 'replace-before-launch',

  legalName: 'Premium Detailing',
  displayName: 'Premium Detailing',
  tagline:
    'Mobile detailing at your driveway, plus ceramic coating, paint protection film, paint correction and window tinting at the shop. Serving the Treasure Coast.',

  // AutomotiveBusiness is the real schema.org type for a detailer.
  // "AutoDetailing" is not a schema.org type and must never be used.
  schemaType: 'AutomotiveBusiness',

  phone: '+17723020717',
  email: 'premiumdetailingpsl@gmail.com',

  // The published Google Business Profile address. The shop address is a
  // separate, still-unanswered question on the client follow-up list; nothing
  // on the site names a shop address until he gives one.
  address: {
    street: '864 SW Piedmont Ct',
    city: 'Port St. Lucie',
    state: 'FL',
    zip: '34986',
    lat: 27.2964554,
    lng: -80.3928873,
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
  ],

  // [owner] Five services, all live. The three detailing packages are tiers of
  // one service, not three services: as separate entries the price ladder was
  // taking three of the six cards on every grid and headlining the site.
  services: [
    {
      slug: 'mobile-detailing',
      name: 'Mobile Detailing',
      shortDescription:
        'Three packages that come to your driveway, from a maintenance wash to a full detail inside and out with our own protection blend.',
      priceFrom: 125,
      priceNote: 'Starting price for the Bronze Package; the final quote depends on vehicle size and condition.',
      // The tiers carry the calendars. The service itself is not one bookable
      // thing, so it has no single booking URL.
      bookingUrl: null,
      comingSoon: false,
      image: 'black-bmw-x6-finished-on-pavers.jpg',
      tiers: [
        {
          name: 'Bronze Package',
          slug: 'bronze',
          anchor: 'bronze',
          priceFrom: 125,
          priceNote: 'Starting price; final quote depends on vehicle size and condition.',
          includes: [
            'Exterior hand wash',
            'Tire shine',
            'Interior vacuum',
            'Full interior wipe down',
          ],
          bookingUrl: 'https://api.leadconnectorhq.com/widget/booking/KfMx0UuW6ZhHpIRgeqLe',
        },
        {
          name: 'Silver Package',
          slug: 'silver',
          anchor: 'silver',
          priceFrom: 225,
          priceNote: 'Starting price; final quote depends on vehicle size and condition.',
          includes: [
            'Everything in the Bronze Package',
            'Exterior wax over the paint',
            'Light interior detail',
          ],
          bookingUrl: 'https://api.leadconnectorhq.com/widget/booking/K4lPRLc5picjsYtGzs39',
        },
        {
          name: 'Gold Package',
          slug: 'gold',
          anchor: 'gold',
          priceFrom: 325,
          priceNote: 'Starting price; final quote depends on vehicle size and condition.',
          includes: [
            'Everything in the Bronze and Silver Packages',
            'Full exterior detail, paint detailed meticulously',
            'Full interior detail with seat shampoo and pet hair removal',
            'Odor removal',
            'Our protection blend, at least forty-five days',
          ],
          bookingUrl: 'https://api.leadconnectorhq.com/widget/booking/5EXJwsToTNOyza8OKOB0',
        },
      ],
      faqs: [
        {
          q: 'Do you come to me for a detailing package?',
          a: 'Yes. The Bronze, Silver and Gold packages are mobile, so we come to your driveway in Port St. Lucie or anywhere else on the Treasure Coast and work on the vehicle where it sits.',
        },
        {
          q: 'Which package should I pick?',
          a: 'Bronze maintains a car that is already relatively clean. Silver adds an exterior wax and a light interior detail. Gold is the full job inside and out, finished with a protection blend that holds for at least forty-five days.',
        },
        {
          q: 'Can you get out pet hair, stains and sand?',
          a: 'Yes, and that is the Gold Package. It covers seat shampoo, pet hair and the sand that gets into everything down here, and odor removal is part of the job.',
        },
        {
          q: 'Can you add a clay bar or an engine detail?',
          a: 'Yes. A clay bar treatment, an engine detail and a seat shampoo can all be added to any package. Ask for what you want when you book and it will be quoted alongside the rest of the job.',
        },
        {
          q: 'How long does a package take?',
          a: 'It depends on the size and condition of the vehicle, and Gold takes considerably longer than Bronze. We confirm the time window with you when you book rather than quoting a number that may not hold.',
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
        'A durable coating that adds gloss, resists chemicals and makes a car far easier to wash, with packages running up to five years.',
      priceFrom: 750,
      priceNote: 'Starting price for the coating; paint correction is quoted separately after a paint evaluation.',
      bookingUrl: 'https://api.leadconnectorhq.com/widget/booking/bY1BbL4jeSiarEogmqIz',
      comingSoon: false,
      image: 'black-porsche-macan-shop-hex-lights.jpg',
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
      // [owner] 2026-10-19. Was 3999 from the old site.
      priceFrom: 2999,
      priceNote: 'Starting price; the final quote depends on how much of the vehicle is covered.',
      // No calendar for film yet: it is quoted per vehicle after we see how
      // much coverage you want. Whether it gets its own calendar is an open
      // question on the client follow-up list.
      bookingUrl: null,
      comingSoon: false,
      image: 'black-ram-truck-garage-hex-lights.jpg',
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
      bookingUrl: null,
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
      priceFrom: 399,
      priceNote: 'Starting price; the final quote depends on the vehicle and the number of windows.',
      bookingUrl: null,
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
  ],

  // Mirrors the Google Business Profile so the NAP matches. The site never
  // prints these times; it prints "By appointment, seven days a week".
  hours: [
    { day: 'Monday', open: '00:00', close: '23:59' },
    { day: 'Tuesday', open: '00:00', close: '23:59' },
    { day: 'Wednesday', open: '00:00', close: '23:59' },
    { day: 'Thursday', open: '00:00', close: '23:59' },
    { day: 'Friday', open: '00:00', close: '23:59' },
    { day: 'Saturday', open: '00:00', close: '23:59' },
    { day: 'Sunday', open: '00:00', close: '23:59' },
  ],

  // What every visible surface prints. config.hours above stays as the Google
  // Business Profile has it so the structured data matches; it is never shown.
  hoursDisplay: 'By appointment, seven days a week',

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
  reviewClaimTotal: '1,000+',
  reviewClaimScope: 'across Google and social media',
  reviewCountExact: 449,
  reviewCountAsOf: '2026-10-18',
  facebookReviewCount: 290,
  facebookReviewsAsOf: '2026-10-19',
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
      towns: ['Port St. Lucie', 'St. Lucie West', 'Tradition', 'Fort Pierce', 'Lakewood Park', 'White City', 'Hutchinson Island'],
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

  // No promotion is published anywhere. Do not invent one.
  offer: null,

  profiles: {
    gbp: 'https://www.google.com/maps?cid=15187933252334437823',
    facebook: 'https://www.facebook.com/Premiumdetailingg',
    instagram: 'https://www.instagram.com/premiumdetailing__',
    yelp: null,
    tiktok: 'https://www.tiktok.com/@premiumdetailingg',
  },

  // The Instagram section. There is no live feed and no live follower count:
  // both need the owner to connect the account through Behold or the
  // Instagram Graph API, which is on the client follow-up list. Until then
  // these are official permalinks pasted by hand, and the follower figure
  // carries the date it was read.
  social: {
    instagram: {
      handle: 'premiumdetailing__',
      url: 'https://www.instagram.com/premiumdetailing__/',
      followers: '20K',
      followersAsOf: '2026-10-19',
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
  },

  faqs: [
    {
      q: 'Do you come to me?',
      a: 'The Bronze, Silver and Gold packages come to you, so we detail the vehicle where it is parked. Ceramic coating, paint correction, paint protection film and window tint are done at the shop in Port St. Lucie.',
    },
    {
      q: 'Which package should I pick?',
      a: 'Bronze maintains a car that is already relatively clean. Silver adds an exterior wax and a light interior detail. Gold is the full job inside and out, finished with a protection blend that holds for at least forty-five days.',
    },
    {
      q: 'How much does a detail cost?',
      a: 'Bronze starts at one hundred twenty-five, Silver at two hundred twenty-five and Gold at three hundred twenty-five. Every starting price is listed on the booking page, and the final quote depends on the size and condition of the vehicle.',
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
      a: 'Pick your package on the booking page and choose a time, or call us and we will sort it out over the phone. Coating, correction, film and tint are quoted per vehicle, so send a quote request for those.',
    },
    {
      q: 'Can I get paint protection film and window tint from you?',
      a: 'Yes, both are available. Neither has a booking calendar because the price depends on the vehicle and how much coverage you want, so send a quote request and we will come back with a figure and timing.',
    },
  ],

  images: {
    hero: 'silver-coupe-garage-hex-lights.jpg',
    about: 'detailer-polishing-lifted-truck-driveway.jpg',
    gallery: [
      { name: 'gold-lamborghini-urus-driveway-wash.jpg', tag: 'process' },
      { name: 'gold-lamborghini-urus-rear-quarter.jpg', tag: 'exterior' },
      { name: 'red-mercedes-maybach-gls-driveway.jpg', tag: 'exterior' },
      { name: 'satin-black-audi-rs6-hood-open.jpg', tag: 'exterior' },
      { name: 'black-porsche-macan-shop-hex-lights.jpg', tag: 'coatings' },
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

  // Flip prelaunch to false at launch, then redeploy.
  prelaunch: true,

  domain: 'https://www.premiumdetailingpsl.com',
}

export default config
