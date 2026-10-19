import type { Metadata } from 'next'
import Credentials from '@/components/Credentials'
import CtaBand from '@/components/CtaBand'
import Img from '@/components/Img'
import JsonLd from '@/components/JsonLd'
import PageHeader from '@/components/PageHeader'
import { config } from '@/lib/config'
import { loadContent, readFrontmatter } from '@/lib/content'
import { breadcrumbList } from '@/lib/schema'
import { buildMetadata } from '@/lib/seo'

const CONTENT = 'about.mdx'
const CRUMBS = [
  { name: 'Home', path: '/' },
  { name: 'About', path: '/about' },
]

export function generateMetadata(): Metadata {
  const fm = readFrontmatter(CONTENT)
  return buildMetadata({ kind: 'about', path: '/about', description: fm.description, image: fm.image ?? config.images.about }).metadata
}

export default async function AboutPage() {
  const { content } = await loadContent(CONTENT)
  return (
    <>
      <JsonLd data={breadcrumbList(CRUMBS)} />
      <PageHeader title={`About ${config.displayName}`} intro={config.tagline} crumbs={CRUMBS} />
      <div className="mx-auto grid max-w-page gap-10 px-4 pt-10 sm:px-6 lg:grid-cols-3">
        <article className="lg:col-span-2">
          <Credentials />
          {content}
        </article>
        {config.images.about && (
          <aside>
            <div className="overflow-hidden rounded-site">
              <Img name={config.images.about} sizes="(min-width: 1024px) 33vw, 100vw" className="h-auto w-full" />
            </div>
          </aside>
        )}
      </div>
      <CtaBand />
    </>
  )
}
