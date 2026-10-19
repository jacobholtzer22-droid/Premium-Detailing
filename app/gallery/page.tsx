import type { Metadata } from 'next'
import CtaBand from '@/components/CtaBand'
import Gallery from '@/components/Gallery'
import JsonLd from '@/components/JsonLd'
import PageHeader from '@/components/PageHeader'
import { config } from '@/lib/config'
import { breadcrumbList } from '@/lib/schema'
import { buildMetadata } from '@/lib/seo'

const DESCRIPTION =
  'Cars, trucks and motorcycles detailed, coated and corrected by Premium Detailing, photographed on real jobs across Port St. Lucie and the Treasure Coast.'

const CRUMBS = [
  { name: 'Home', path: '/' },
  { name: 'Recent Work', path: '/gallery' },
]

export const metadata: Metadata = buildMetadata({
  kind: 'other',
  path: '/gallery',
  title: 'Recent Work',
  description: DESCRIPTION,
}).metadata

/**
 * The full photo set. The homepage shows the first twelve and links here;
 * this page passes no `limit`, so every tile renders and the filter row
 * works across all of them.
 */
export default function GalleryPage() {
  return (
    <>
      <JsonLd data={breadcrumbList(CRUMBS)} />
      <PageHeader
        title="Recent Work"
        intro={`Work photographed across ${config.primaryCity} and the Treasure Coast.`}
        crumbs={CRUMBS}
      />
      <Gallery heading="Every job we have photographed" />
      <CtaBand />
    </>
  )
}
