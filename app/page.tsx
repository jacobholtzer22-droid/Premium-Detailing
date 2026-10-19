import type { Metadata } from 'next'
import AreaList from '@/components/AreaList'
import BeforeAfter from '@/components/BeforeAfter'
import CarStrip from '@/components/CarStrip'
import CtaBand from '@/components/CtaBand'
import FaqAccordion from '@/components/FaqAccordion'
import Gallery from '@/components/Gallery'
import Hero from '@/components/Hero'
import HowItWorks from '@/components/HowItWorks'
import InstagramFeed from '@/components/InstagramFeed'
import JsonLd from '@/components/JsonLd'
import RatingBar from '@/components/RatingBar'
import Reveal from '@/components/Reveal'
import Reviews from '@/components/Reviews'
import ServiceGrid from '@/components/ServiceGrid'
import Stats from '@/components/Stats'
import Testimonials from '@/components/Testimonials'
import WhyUs from '@/components/WhyUs'
import { config } from '@/lib/config'
import { loadContent, readFrontmatter } from '@/lib/content'
import { faqPage, localBusiness, organization, website } from '@/lib/schema'
import { buildMetadata } from '@/lib/seo'

const CONTENT = 'home.mdx'

export function generateMetadata(): Metadata {
  const fm = readFrontmatter(CONTENT)
  return buildMetadata({ kind: 'home', path: '/', description: fm.description, image: fm.image }).metadata
}

export default async function HomePage() {
  const { content } = await loadContent(CONTENT)
  return (
    <>
      <JsonLd data={localBusiness()} />
      <JsonLd data={organization()} />
      <JsonLd data={website()} />
      <JsonLd data={faqPage(config.faqs)} />

      <Hero />
      {/* Proof, then the cars, then the words. Somebody who lands here cold
          gets the rating and the work in the first screen after the hero,
          which is the order they would judge a detailer in person. */}
      <RatingBar />
      <CarStrip />
      {/* The lead statement, with the three figures beside it at lg so the
          right half is not empty. The numbers appear once on the page: the
          full width strip that used to sit under How it works is gone. */}
      <section className="border-b border-line bg-surface">
        <div className="mx-auto grid max-w-page items-start gap-12 px-4 py-16 sm:px-6 lg:grid-cols-12 md:py-24">
          <div className="lg:col-span-7">
            <span aria-hidden="true" className="block h-1 w-16 bg-blue-text" />
            <article className="home-lead mt-8">{content}</article>
          </div>
          <div className="lg:col-span-5">
            <Stats variant="card" />
          </div>
        </div>
      </section>
      <ServiceGrid />
      {/* Straight after the services, so the first question a price raises is
          answered by somebody who already paid it. */}
      <Testimonials />
      {/* Renders nothing until the client sends true before/after pairs. */}
      <BeforeAfter />
      <WhyUs />
      <HowItWorks />
      <Gallery limit={12} moreHref="/gallery" />
      <InstagramFeed />
      <Reviews />
      <AreaList />
      <Reveal>
        <FaqAccordion faqs={config.faqs} />
      </Reveal>
      <CtaBand />
    </>
  )
}
