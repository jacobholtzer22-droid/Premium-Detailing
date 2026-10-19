import Reveal from './Reveal'

/**
 * Three numbered steps for the detailing packages, plus the extra first step
 * that coatings always start with. Numerals carry the section; no icons.
 */
const STEPS = [
  { n: '01', title: 'Book online or call', body: 'Pick the package that fits the vehicle and choose a time, or call and we will work it out on the phone.' },
  { n: '02', title: 'We come to you', body: 'We arrive with the equipment and detail the vehicle where it is parked. You do not have to drop anything off.' },
  { n: '03', title: 'Drive away detailed', body: 'We walk the vehicle with you before we leave, so nothing is missed and you know exactly what was done.' },
]

export default function HowItWorks() {
  return (
    <section className="border-t border-line bg-bg">
      <div className="mx-auto max-w-page px-4 py-16 sm:px-6 md:py-24">
        <Reveal>
          <h2 className="font-heading text-3xl font-bold text-primary-dark md:text-4xl">How it works</h2>
        </Reveal>
        <ol className="mt-10 grid gap-8 md:grid-cols-3">
          {STEPS.map((s, i) => (
            <Reveal key={s.n} delay={Math.min(i * 60, 360)} as="li">
              <p className="font-heading text-4xl font-extrabold tabular-nums text-blue-text">{s.n}</p>
              <h3 className="mt-3 font-heading text-lg font-bold text-primary-dark">{s.title}</h3>
              <p className="mt-2 text-base leading-relaxed text-muted">{s.body}</p>
            </Reveal>
          ))}
        </ol>
        <Reveal>
          <p className="mt-10 border-t border-line pt-6 text-base text-muted">
            Ceramic coating adds a step in front of all three: a paint evaluation, so the work is quoted against what
            the paint actually needs.
          </p>
        </Reveal>
      </div>
    </section>
  )
}
