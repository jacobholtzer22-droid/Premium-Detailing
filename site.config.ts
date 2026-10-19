import type { SiteConfigInput } from '@/lib/config-schema'

/**
 * Every fact about this business, in one place. Prose never hardcodes a fact;
 * it reaches the page through a component or {config.*} interpolation.
 *
 * Anything the brief left UNKNOWN is null or an empty array here, and the
 * block that depends on it does not render. An empty slot is correct; a
 * plausible guess is a defect.
 */
const config: SiteConfigInput = {
  // PLACEHOLDER. Swap for the real platform slug at launch, then redeploy.
  // Until this is a real Business row, every lead from this site is lost.
  businessSlug: 'replace-before-launch',

  legalName: 'Premium Detailing',
  displayName: 'Premium Detailing',
  tagline: 'Mobile detailing, ceramic coating and paint correction on the Treasure Coast. We come to your driveway.',

  // AutomotiveBusiness is the real schema.org type for a detailer.
  // "AutoDetailing" is not a schema.org type and must never be used.
  schemaType: 'AutomotiveBusiness',

  phone: '+17723020717',
  email: 'premiumdetailingpsl@gmail.com',

  address: {
    street: '864 SW Piedmont Ct',
    city: 'Port St. Lucie',
    state: 'FL',
    zip: '34986',
    lat: 27.2964554,
    lng: -80.3928873,
  },

  // Drives the homepage and area H1s. Without it the template would use
  // services[0].name and headline the site "Bronze Package".
  tradeName: 'Mobile Detailing',

  primaryCity: 'Port St. Lucie',
  primaryState: 'FL',

  serviceAreas: [
    { slug: 'fort-pierce', name: 'Fort Pierce', county: 'St. Lucie County' },
    { slug: 'stuart', name: 'Stuart', county: 'Martin County' },
    { slug: 'palm-city', name: 'Palm City', county: 'Martin County' },
    { slug: 'jensen-beach', name: 'Jensen Beach', county: 'Martin County' },
    { slug: 'vero-beach', name: 'Vero Beach', county: 'Indian River County' },
  ],

  services: [
    {
      slug: 'bronze-package',
      name: 'Bronze Package',
      shortDescription:
        'Our entry level detail: exterior wash, tire shine, vacuum and a full wipe down, done at your home.',
      priceFrom: 125,
      priceNote: 'Starting price; final quote depends on vehicle size and condition.',
      bookingUrl: 'https://api.leadconnectorhq.com/widget/booking/KfMx0UuW6ZhHpIRgeqLe',
      comingSoon: false,
      image: 'vw-wheel-cleaned-on-pavers.jpg',
      faqs: [
        {
          q: 'Do you come to me for a Bronze Package?',
          a: 'Yes. The detailing packages are mobile, so we come to your driveway in Port St. Lucie or anywhere else on the Treasure Coast and work on the vehicle where it sits.',
        },
        {
          q: 'What is actually included?',
          a: 'An exterior wash, tire shine, an interior vacuum and a wipe down. It is built to keep a car that is already in decent shape looking sharp, not to recover a neglected one.',
        },
        {
          q: 'How long does a Bronze Package take?',
          a: 'It depends on the size and condition of the vehicle, so we confirm the time window with you when you book rather than quoting a number that may not hold.',
        },
        {
          q: 'How often should I book one?',
          a: 'As a general rule, a maintenance wash and vacuum about once a month keeps dirt and salt from building up. How often you need it depends on where the car is parked and how far you drive.',
        },
        {
          q: 'Should I book Bronze or Silver?',
          a: 'Bronze maintains a car that is already relatively clean. If you want the paint to look its best rather than just clean, the Silver Package adds an exterior wax and a light interior detail.',
        },
        {
          q: 'Do I need to provide anything?',
          a: 'Tell us where the vehicle will be parked when you book and we will confirm what we need from you on site, including access to water or power if that applies.',
        },
      ],
    },
    {
      slug: 'silver-package',
      name: 'Silver Package',
      shortDescription:
        'Everything in Bronze plus an exterior wax and a light interior detail, for paint that looks its best.',
      priceFrom: 225,
      priceNote: 'Starting price; final quote depends on vehicle size and condition.',
      bookingUrl: 'https://api.leadconnectorhq.com/widget/booking/K4lPRLc5picjsYtGzs39',
      comingSoon: false,
      image: 'black-bmw-x6-finished-on-pavers.jpg',
      faqs: [
        {
          q: 'What does the Silver Package add over Bronze?',
          a: 'Everything in the Bronze Package, plus an exterior wax and a light interior detail. It is aimed at the person who wants the outside of the car to look perfect.',
        },
        {
          q: 'Is the full interior included?',
          a: 'The interior work in Silver is light: a vacuum and a wipe down. If the inside needs a deep clean, seat shampoo or odor removal, that is the Gold Package.',
        },
        {
          q: 'Can you add a clay bar?',
          a: 'Yes, a clay bar treatment can be added to a Silver Package. Ask for it when you book and we will quote it with the rest of the job.',
        },
        {
          q: 'How long does the wax last?',
          a: 'A wax is a short-term layer measured in weeks, and Florida sun and rain shorten it. If you want protection that lasts, a ceramic coating is the right conversation.',
        },
        {
          q: 'Do you come to my house for this?',
          a: 'Yes. The packages are mobile. We bring the equipment to you and work on the vehicle at your home or wherever it is parked.',
        },
      ],
    },
    {
      slug: 'gold-package',
      name: 'Gold Package',
      shortDescription:
        'The full detail inside and out, finished with a protection blend that holds for at least forty-five days.',
      priceFrom: 325,
      priceNote: 'Starting price; final quote depends on vehicle size and condition.',
      bookingUrl: 'https://api.leadconnectorhq.com/widget/booking/5EXJwsToTNOyza8OKOB0',
      comingSoon: false,
      image: 'porsche-cayenne-red-leather-interior.jpg',
      faqs: [
        {
          q: 'What makes the Gold Package different?',
          a: 'It includes everything in Bronze and Silver, then adds a full exterior detail and a full interior detail that reaches the parts of a car most cleans never touch. The paint is detailed meticulously.',
        },
        {
          q: 'Can you get out pet hair, stains and sand?',
          a: 'Yes. The Gold Package covers seat shampoo, pet hair and the sand that gets into everything down here, and odor removal is part of the job.',
        },
        {
          q: 'How long does the protection last?',
          a: 'We finish with our own protection blend that holds for at least forty-five days. It is a protection blend, not a ceramic coating, so it is topped up rather than cured on.',
        },
        {
          q: 'Should I book Gold or Silver?',
          a: 'Silver focuses on the exterior with a light interior refresh. Choose Gold when the inside needs real work, or when you want the whole car brought back rather than maintained.',
        },
        {
          q: 'How long does a Gold Package take?',
          a: 'Longer than the other two packages, and it varies a lot with the condition of the interior. We confirm the time window with you when the appointment is booked.',
        },
      ],
    },
    {
      slug: 'ceramic-coating',
      name: 'Ceramic Coating',
      shortDescription:
        'Paint correction to take swirl marks and scratches out, then a durable ceramic coating for gloss and protection.',
      priceFrom: 750,
      priceNote: 'Starting price for the coating; paint correction is quoted after a paint evaluation.',
      bookingUrl: 'https://api.leadconnectorhq.com/widget/booking/bY1BbL4jeSiarEogmqIz',
      comingSoon: false,
      image: 'black-mercedes-cls-gloss-front-quarter.jpg',
      faqs: [
        {
          q: 'How long does a ceramic coating last?',
          a: 'It depends on the package. Coating packages run up to five years, and we will tell you at the paint evaluation which one suits the car and how you use it.',
        },
        {
          q: 'Do I need paint correction first?',
          a: 'We start every job with a paint evaluation. A coating locks in whatever is underneath it, so swirl marks and scratches are polished out first when the paint needs it.',
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
          q: 'What does the process look like?',
          a: 'Four steps: a paint evaluation, paint correction and polishing, the ceramic coating itself, then a final detail and inspection before the car goes back to you.',
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
      shortDescription:
        'A nearly invisible self healing film that takes the rock chips, scratches and road debris instead of your paint.',
      priceFrom: 3999,
      priceNote: 'Starting price; the final quote depends on how much of the vehicle is covered.',
      bookingUrl: null,
      comingSoon: true,
      image: 'black-ram-truck-garage-hex-lights.jpg',
      faqs: [
        {
          q: 'Can I book paint protection film right now?',
          a: 'Not yet. Film is coming soon, so send a quote request instead of booking and we will come back to you with options and timing as soon as it is available.',
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
      slug: 'window-tint',
      name: 'Window Tint',
      shortDescription:
        'Tint that cuts heat and glare, blocks the ultraviolet rays that age an interior, and adds privacy.',
      priceFrom: 399,
      priceNote: 'Starting price; the final quote depends on the vehicle and the number of windows.',
      bookingUrl: null,
      comingSoon: true,
      image: 'white-bmw-x3-dark-tinted-glass.jpg',
      faqs: [
        {
          q: 'Can I book window tint right now?',
          a: 'Not yet. Tint is coming soon, so send a quote request rather than booking and we will be in touch with options and timing once it is available.',
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
  licenseNumber: null,
  insured: null,

  // Stays empty on purpose. These are the business's own Google reviews, and a
  // business marking up its own Google reviews is self-serving. They render
  // visibly through `testimonials` instead, with no schema attached.
  reviews: [],

  reviewCount: 440,
  reviewRating: 5.0,

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
  ],

  stats: [
    { value: '440', suffix: '+', label: 'Five-star Google reviews' },
    { value: '5.0', suffix: '', label: 'Google rating' },
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
      county: 'Indian River County',
      towns: ['Vero Beach', 'Sebastian'],
    },
  ],

  // No true before/after pair exists in either photo source. A pair is only
  // ever the same vehicle from roughly the same angle, one dirty and one
  // finished. The component ships; the section renders nothing until the
  // client sends pairs. It is the first ask on the client follow-up list.
  beforeAfter: [],

  // No promotion is published anywhere. Do not invent one.
  offer: null,

  profiles: {
    gbp: 'https://www.google.com/maps?cid=15187933252334437823',
    facebook: 'https://www.facebook.com/Premiumdetailingg',
    instagram: 'https://www.instagram.com/premiumdetailing__',
    yelp: null,
  },

  faqs: [
    {
      q: 'Do you come to me?',
      a: 'Yes. The Bronze, Silver and Gold packages are mobile, so we come to your driveway and detail the vehicle where it sits. For ceramic coating, paint protection film and tint, ask when you book and we will confirm where the work happens.',
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
      a: 'Port St. Lucie and the wider Treasure Coast, including Fort Pierce, Stuart, Palm City, Jensen Beach and Vero Beach. If you are not sure whether you are in range, send your ZIP code with your quote request.',
    },
    {
      q: 'How do I book?',
      a: 'Pick your package on the booking page and choose a time, or call us and we will sort it out over the phone. If you are not sure what you need yet, send a quote request and describe the vehicle.',
    },
    {
      q: 'Do you offer paint protection film and window tint?',
      a: 'Both are coming soon. The pages are up with starting prices so you know roughly where they land, and you can send a quote request now to be told as soon as they are bookable.',
    },
  ],

  images: {
    hero: 'silver-coupe-garage-hex-lights.jpg',
    about: 'detailer-polishing-lifted-truck-driveway.jpg',
    gallery: [
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
      'Year, make, and model, and what you want done: a package, ceramic coating, tint, or paint protection film.',
    submitLabel: 'Get My Quote',
  },

  // Flip prelaunch to false at launch, then redeploy.
  prelaunch: true,

  domain: 'https://www.premiumdetailingpsl.com',
}

export default config
