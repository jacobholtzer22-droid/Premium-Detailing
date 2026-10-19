import { config } from '@/lib/config'
import Img from './Img'
import Reveal from './Reveal'

/**
 * Split section: the crew working at a customer's house on one side, four
 * short reasons on the other.
 *
 * Deliberately NOT a "Why Choose Us" checkmark row (AGENT.md Phase 2d bans
 * that pattern). Every point is a fact from the brief, not a slogan.
 */
const POINTS = [
  {
    title: 'We come to your driveway',
    body: 'The Bronze, Silver and Gold packages are mobile. We bring the equipment and work on the vehicle where it is parked, so your day does not stop.',
  },
  {
    title: 'Paint work, not just a wash',
    body: 'Paint correction and ceramic coating are their own craft. Swirl marks and scratches get polished out before anything is sealed over them.',
  },
  {
    title: 'Built for Florida',
    body: 'Salt air, sun and sand are what wear a car down here. Everything we do is aimed at the way vehicles actually age on the Treasure Coast.',
  },
  {
    title: 'Trusted by local dealerships',
    body: 'Dealerships and businesses around Port St. Lucie send us work, alongside owners of some of the most expensive cars in the area.',
  },
]

export default function WhyUs() {
  const about = config.images.about
  return (
    <section className="border-t border-line bg-surface">
      <div className="mx-auto grid max-w-page items-start gap-12 px-4 py-16 sm:px-6 md:grid-cols-2 md:py-24">
        {about && (
          <Reveal className="overflow-hidden rounded-site">
            <Img
              name={about}
              sizes="(min-width: 768px) 46vw, 100vw"
              className="aspect-[4/3] h-full w-full object-cover md:aspect-[4/5]"
            />
          </Reveal>
        )}
        <div>
          <Reveal>
            <h2 className="font-heading text-3xl font-bold text-primary-dark md:text-4xl">
              Why {config.displayName}
            </h2>
          </Reveal>
          <div className="mt-8 border-t border-line">
            {POINTS.map((p, i) => (
              <Reveal key={p.title} delay={Math.min(i * 60, 360)}>
                <div className="border-b border-line py-6">
                  <h3 className="font-heading text-lg font-bold text-primary-dark">{p.title}</h3>
                  <p className="mt-2 text-base leading-relaxed text-muted">{p.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
