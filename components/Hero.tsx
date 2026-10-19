import Link from 'next/link'
import type { CSSProperties } from 'react'
import { config } from '@/lib/config'
import { HERO_EYEBROW_OPACITY, HERO_TAGLINE_OPACITY, heroScrimCss } from '@/lib/hero-scrim'
import theme from '@/theme'
import HeroVideo from './HeroVideo'
import Img from './Img'
import Phone from './Phone'
import TrustChips from './TrustChips'

/**
 * Homepage hero. Owns the page's single <h1>. Layout comes from
 * theme.heroVariant; every word comes from config.
 *
 * The copy ladder (eyebrow, H1, tagline, buttons, chips) fades up on load
 * through CSS classes only, so under `prefers-reduced-motion: reduce` the
 * stylesheet renders all of it immediately with no JavaScript involved. The
 * photograph's slow push-in is the same deal: one CSS animation, cancelled by
 * the same media query.
 */
export default function Hero() {
  const h1 = `${config.tradeLabel} in ${config.primaryCity}, ${config.primaryState}`
  const hero = config.images.hero
  const rise = (ms: number) => ({ '--rise-delay': `${ms}ms` }) as CSSProperties

  const cta = (dark: boolean) => (
    <div className="mt-8 flex flex-wrap items-center gap-3 hero-rise" style={rise(240)}>
      <Link
        href="/book"
        className="btn rounded-site bg-accent px-6 py-3.5 text-base font-semibold text-on-accent hover:bg-accent-dark"
      >
        Book a Detail
      </Link>
      <Phone
        className={`btn rounded-site border-2 px-6 py-3.5 text-base font-semibold ${
          dark ? 'border-on-primary/40 text-on-primary hover:border-on-primary' : 'border-primary-dark text-primary-dark'
        }`}
        label={`Call ${config.phoneDisplay}`}
      />
    </div>
  )

  if (theme.heroVariant === 'full-bleed' && hero) {
    return (
      <section className="relative isolate flex min-h-[78vh] items-end overflow-hidden bg-primary-dark text-on-primary">
        <div className="absolute inset-0 z-0 hero-kenburns">
          <Img name={hero} priority sizes="100vw" className="h-full w-full object-cover" />
        </div>
        {/* Optional. Sits on the poster at the same z, never replaces it. */}
        {config.images.heroVideo && <HeroVideo {...config.images.heroVideo} />}
        <div aria-hidden="true" className="absolute inset-0 z-[1]" style={{ background: heroScrimCss() }} />
        <div className="relative z-10 mx-auto w-full max-w-page px-4 pb-14 pt-40 sm:px-6 md:pb-20">
          <p
            className="text-sm font-semibold uppercase tracking-[0.2em] hero-rise"
            style={{ opacity: HERO_EYEBROW_OPACITY, ...rise(0) }}
          >
            {config.displayName}
          </p>
          <h1 className="mt-4 max-w-4xl font-heading text-hero font-extrabold hero-rise" style={rise(120)}>
            {h1}
          </h1>
          <p
            className="mt-6 max-w-2xl text-lg md:text-xl hero-rise"
            style={{ opacity: HERO_TAGLINE_OPACITY, ...rise(120) }}
          >
            {config.tagline}
          </p>
          {cta(true)}
          <div className="hero-rise" style={rise(360)}>
            <TrustChips className="mt-10" />
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="bg-bg">
      <div className="mx-auto grid max-w-page items-center gap-12 px-4 py-20 sm:px-6 md:grid-cols-5 md:py-28">
        <div className="md:col-span-3">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent">{config.displayName}</p>
          <h1 className="mt-4 font-heading text-hero font-extrabold text-primary-dark">{h1}</h1>
          <p className="mt-6 max-w-xl text-lg text-muted md:text-xl">{config.tagline}</p>
          {cta(false)}
          <TrustChips className="mt-10" />
        </div>
        {hero && (
          <div className="overflow-hidden rounded-site shadow-site md:col-span-2">
            <Img name={hero} priority sizes="(min-width: 768px) 40vw, 100vw" className="aspect-[4/5] h-auto w-full object-cover" />
          </div>
        )}
      </div>
    </section>
  )
}
