import type { Metadata } from 'next'
import CtaBand from '@/components/CtaBand'
import JsonLd from '@/components/JsonLd'
import PageHeader from '@/components/PageHeader'
import ServiceGrid from '@/components/ServiceGrid'
import ServicePills from '@/components/ServicePills'
import { config } from '@/lib/config'
import { loadContent, readFrontmatter } from '@/lib/content'
import { breadcrumbList } from '@/lib/schema'
import { buildMetadata } from '@/lib/seo'

const CONTENT = 'services.mdx'
const CRUMBS = [
  { name: 'Home', path: '/' },
  { name: 'Services', path: '/services' },
]

export function generateMetadata(): Metadata {
  const fm = readFrontmatter(CONTENT)
  return buildMetadata({ kind: 'services', path: '/services', description: fm.description, image: fm.image }).metadata
}

export default async function ServicesIndexPage() {
  const { content } = await loadContent(CONTENT)
  return (
    <>
      <JsonLd data={breadcrumbList(CRUMBS)} />
      <PageHeader title={`Services in ${config.primaryCity}, ${config.primaryState}`} crumbs={CRUMBS} />
      {/* The pills come first, before the prose: somebody who already knows
          the words "window tinting" should not have to read a paragraph to
          find out we do it. */}
      <ServicePills />
      <article className="mx-auto max-w-3xl px-4 pt-10 sm:px-6">{content}</article>
      <ServiceGrid heading="Everything We Offer" />
      <CtaBand />
    </>
  )
}
