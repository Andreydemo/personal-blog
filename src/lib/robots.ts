import type { MetadataRoute } from 'next'
import { absoluteUrl, type SiteConfig } from './site'

export function robotsRules(site: SiteConfig): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: '/' },
      { userAgent: [...site.crawlers], allow: '/' },
    ],
    sitemap: absoluteUrl(site, '/sitemap.xml'),
  }
}
