import Link from 'next/link'
import { config, formatPrice, priceLabel } from '@/lib/config'
import Reveal from './Reveal'

/**
 * Standing offers: the prepaid bundle, the referral, and the maintenance plans.
 *
 * Every figure comes from config.specials. Renders nothing at all when there is
 * no bundle, no referral and no plan, so a client with no offers does not get
 * an empty "Specials" heading asking to be filled.
 *
 * Deliberately not styled as a promotion: no countdown, no "limited time", no
 * strike-through on a price that was never charged. These are things the owner
 * actually runs all year, and dressing them as urgency would be the one thing
 * on this page a visitor could catch us at.
 *
 * Every button goes to the quote form rather than the booking flow, because a
 * plan and a bundle are both a conversation about billing, not a slot on a
 * calendar. The plan name rides in the query string so the service dropdown
 * can land on something sensible.
 */
export default function Specials({ heading = 'Ways to save' }: { heading?: string }) {
  const { bundle, referral, plans } = config.specials
  if (!bundle && !referral && plans.length === 0) return null

  return (
    <section id="specials" className="border-t border-line bg-primary-dark text-on-primary">
      <div className="mx-auto max-w-page px-4 py-16 sm:px-6 md:py-24">
        <Reveal>
          <h2 className="font-heading text-3xl font-bold md:text-4xl">{heading}</h2>
        </Reveal>

        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {bundle && (
            <Reveal className="h-full">
              <div className="flex h-full flex-col rounded-site border border-white/15 bg-white/5 p-6">
                <h3 className="font-heading text-xl font-bold">{bundle.name}</h3>
                <p className="mt-4 font-heading text-3xl font-extrabold tabular-nums">{priceLabel(bundle.price)}</p>
                <p className="mt-1 text-sm text-on-primary/75">
                  {priceLabel(bundle.unitPrice)} a detail across {bundle.visits} visits, saving $
                  {formatPrice(bundle.saving)}.
                </p>
                <p className="mt-4 flex-1 text-base leading-relaxed text-on-primary/85">{bundle.detail}</p>
                <Link
                  href="/contact?service=bundle"
                  className="btn mt-6 inline-flex min-h-[44px] items-center self-start rounded-site bg-accent px-5 py-3 text-sm font-semibold text-on-accent hover:bg-accent-dark"
                >
                  Ask about the bundle
                </Link>
              </div>
            </Reveal>
          )}

          {referral && (
            <Reveal delay={60} className="h-full">
              <div className="flex h-full flex-col rounded-site border border-white/15 bg-white/5 p-6">
                <h3 className="font-heading text-xl font-bold">Refer a friend</h3>
                <p className="mt-4 font-heading text-3xl font-extrabold tabular-nums">
                  Give {priceLabel(referral.give)}, get {priceLabel(referral.get)}
                </p>
                <p className="mt-4 flex-1 text-base leading-relaxed text-on-primary/85">
                  They get {priceLabel(referral.give)} off and you get {priceLabel(referral.get)} back,{' '}
                  {referral.condition}.
                </p>
                <Link
                  href="/contact?service=referral"
                  className="btn mt-6 inline-flex min-h-[44px] items-center self-start rounded-site border-2 border-white/40 px-5 py-3 text-sm font-semibold text-on-primary hover:border-white"
                >
                  Send us their name
                </Link>
              </div>
            </Reveal>
          )}

          {plans.length > 0 && (
            <Reveal delay={120} className="h-full">
              <div className="flex h-full flex-col rounded-site border border-white/15 bg-white/5 p-6">
                <h3 className="font-heading text-xl font-bold">Monthly maintenance</h3>
                <ul className="mt-4 flex-1 space-y-4">
                  {plans.map((plan) => (
                    <li key={plan.name}>
                      <p className="font-heading text-lg font-bold tabular-nums">
                        {plan.name.replace('Monthly Maintenance, ', '')}, {priceLabel(plan.pricePerVisit)} a visit
                      </p>
                      <p className="mt-1 text-sm text-on-primary/75">
                        {plan.visitsPerYear} visits a year.{plan.note ? ` ${plan.note}` : ''}
                      </p>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/contact?service=maintenance-plan"
                  className="btn mt-6 inline-flex min-h-[44px] items-center self-start rounded-site bg-accent px-5 py-3 text-sm font-semibold text-on-accent hover:bg-accent-dark"
                >
                  Join a plan
                </Link>
              </div>
            </Reveal>
          )}
        </div>
      </div>
    </section>
  )
}
