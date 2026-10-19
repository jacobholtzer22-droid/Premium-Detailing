import type { MetadataRoute } from 'next'
import { config } from '@/lib/config'
import { allRoutes } from '@/lib/routes'

export const dynamic = 'force-static'

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()
  return allRoutes().map((route) => ({
    url: new URL(route, config.domain).toString(),
    lastModified: now,
    changeFrequency: route === '/' ? 'weekly' : 'monthly',
    priority: route === '/' ? 1 : route.startsWith('/services/') ? 0.8 : 0.6,
  }))
}
