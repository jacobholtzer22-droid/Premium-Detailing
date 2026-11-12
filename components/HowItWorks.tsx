import { config } from '@/lib/config'
import Reveal from './Reveal'

/**
 * How it works, as TWO paths rather than one.
 *
 * The single three-step flow this replaced said "we come to you" at step two,
 * which was true of the detailing packages and false of everything else on the
 * site. Somebody booking a ceramic coating read a page telling them to stay
 * home and then found out they were dropping the car off.
 *
 * Which services belong on which path is derived from `service.where`, so the
 * lists cannot drift from what each service page says. A service with no
 * location set appears on neither, which is right for the fleet work: that one
 * is arranged on a call.
 */
const MOBILE_STEPS = [
  {
    n: '01',
    title: 'Book a package online',
    body: 'Pick Bronze, Silver or Gold, choose a time and tell us where the vehicle is. You get a text confirming it.',
  },
  {
    n: '02',
    title: 'We come to you',
    body: 'We arrive with the equipment and detail the vehicle where it is parked. Nothing to drop off and nothing to wait around for.',
  },
  {
    n: '03',
    title: 'We walk it with you',
    body: 'Before we leave we go round the vehicle with you, so nothing is missed and you know exactly what was done.',
  },
]

const SHOP_STEPS = [
  {
    n: '01',
    title: 'Send a quote request',
    body: 'Tell us the vehicle and what you want. Coating, film, correction and tint are priced against what the paint and the glass actually need.',
  },
  {
    n: '02',
    title: 'Paint evaluation',
    body: 'We look at the paint under proper lighting and tell you which package suits it. That is the point the price is settled.',
  },
  {
    n: '03',
    title: 'Drop it at the shop',
    body: 'The work happens indoors in controlled conditions, which is the only way a coating or a film goes on properly, and we tell you when to collect it.',
  },
]

function names(where: 'mobile' | 'shop' | 'property'): string {
  const list = config.services.filter((s) => s.where === where).map((s) => s.name.toLowerCase())
  if (list.length === 0) return ''
  if (list.length === 1) return list[0] ?? ''
  return `${list.slice(0, -1).join(', ')} and ${list.at(-1)}`
}

function Path({
  label,
  lead,
  steps,
}: {
  label: string
  lead: string
  steps: { n: string; title: string; body: string }[]
}) {
  return (
    <div>
      <Reveal>
        <h3 className="font-heading text-xl font-bold text-primary-dark">{label}</h3>
        <p className="mt-2 text-base leading-relaxed text-muted">{lead}</p>
      </Reveal>
      <ol className="mt-8 space-y-7 border-t border-line pt-7">
        {steps.map((s, i) => (
          <Reveal key={s.n} delay={Math.min(i * 60, 360)} as="li">
            <p className="font-heading text-3xl font-extrabold tabular-nums text-blue-text">{s.n}</p>
            <h4 className="mt-2 font-heading text-lg font-bold text-primary-dark">{s.title}</h4>
            <p className="mt-2 text-base leading-relaxed text-muted">{s.body}</p>
          </Reveal>
        ))}
      </ol>
    </div>
  )
}

export default function HowItWorks() {
  const mobile = names('mobile')
  const shop = names('shop')
  const property = names('property')

  return (
    <section className="border-t border-line bg-bg">
      <div className="mx-auto max-w-page px-4 py-16 sm:px-6 md:py-24">
        <Reveal>
          <h2 className="font-heading text-3xl font-bold text-primary-dark md:text-4xl">How it works</h2>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted">
            Two routes, depending on what you need. One comes to your driveway; the other happens at the shop, because
            it has to.
          </p>
        </Reveal>
        <div className="mt-12 grid gap-12 md:grid-cols-2 md:gap-16">
          <Path
            label="Mobile details"
            lead={
              property
                ? `We come to you: ${mobile}. ${property.charAt(0).toUpperCase()}${property.slice(1)} happens at your property too.`
                : `We come to you: ${mobile}.`
            }
            steps={MOBILE_STEPS}
          />
          <Path label="Shop services" lead={`You drop the vehicle with us: ${shop}.`} steps={SHOP_STEPS} />
        </div>
      </div>
    </section>
  )
}
