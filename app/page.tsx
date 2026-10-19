import type { Metadata } from 'next'
import AreaList from '@/components/AreaList'
import BeforeAfter from '@/components/BeforeAfter'
import CtaBand from '@/components/CtaBand'
import FaqAccordion from '@/components/FaqAccordion'
import Gallery from '@/components/Gallery'
import Hero from '@/components/Hero'
import HowItWorks from '@/components/HowItWorks'
import JsonLd from '@/components/JsonLd'
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
      {/* The lead statement. Page width and left aligned like every other
          section, with an accent rule and larger type, so it reads as a
          designed band rather than a blog column dropped under the hero. */}
      <section className="border-b border-line bg-surface">
        <div className="mx-auto max-w-page px-4 py-16 sm:px-6 md:py-24">
          <span aria-hidden="true" className="block h-1 w-16 bg-accent" />
          <article className="home-lead mt-8 max-w-[62ch]">{content}</article>
        </div>
      </section>
      <ServiceGrid />
      {/* Renders nothing until the client sends true before/after pairs. */}
      <BeforeAfter />
      <WhyUs />
      <HowItWorks />
      <Stats />
      <Testimonials />
      <Gallery />
      <Reviews />
      <AreaList />
      <Reveal>
        <FaqAccordion faqs={config.faqs} />
      </Reveal>
      <CtaBand />
    </>
  )
}
