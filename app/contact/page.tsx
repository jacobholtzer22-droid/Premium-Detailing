import type { Metadata } from 'next'
import ContactDetails from '@/components/ContactDetails'
import ContactFormGate from '@/components/ContactFormGate'
import CoverageList from '@/components/CoverageList'
import JsonLd from '@/components/JsonLd'
import NextSteps from '@/components/NextSteps'
import PageHeader from '@/components/PageHeader'
import ServiceMap from '@/components/ServiceMap'
import { config } from '@/lib/config'
import { loadContent, readFrontmatter } from '@/lib/content'
import { breadcrumbList, localBusiness } from '@/lib/schema'
import { buildMetadata } from '@/lib/seo'

const CONTENT = 'contact.mdx'
const CRUMBS = [
  { name: 'Home', path: '/' },
  { name: 'Contact', path: '/contact' },
]

export function generateMetadata(): Metadata {
  const fm = readFrontmatter(CONTENT)
  return buildMetadata({ kind: 'contact', path: '/contact', description: fm.description, image: fm.image }).metadata
}

export default async function ContactPage() {
  const { content } = await loadContent(CONTENT)
  return (
    <>
      {/*
        The business node on the contact page, not just a breadcrumb.
        This is the page a search engine expects the name, address, phone and
        hours on, and it is the page a person lands on from a Maps result. It
        is the same @id as the homepage node, so it is one business described
        twice rather than two businesses.
      */}
      <JsonLd data={localBusiness()} />
      <JsonLd data={breadcrumbList(CRUMBS)} />
      <PageHeader title={`Contact ${config.displayName}`} crumbs={CRUMBS} />
      <div className="mx-auto grid max-w-page gap-10 px-4 pt-10 sm:px-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <article className="mb-8">{content}</article>
          <ContactFormGate />
        </div>
        <aside className="space-y-8">
          <ContactDetails />
          {/*
            The shop on a map, and a directions link that opens the native app
            on a phone. Coating, film, correction, tint and the water damage
            work all happen here, so somebody reading this page is often about
            to drive over, and an address they have to copy into another app
            is a step that loses people.
          */}
          <div>
            <h2 className="font-heading text-xl font-semibold text-primary-dark">Find the shop</h2>
            <ServiceMap className="mt-4" />
          </div>
          <NextSteps />
        </aside>
      </div>
      <CoverageList />
    </>
  )
}
