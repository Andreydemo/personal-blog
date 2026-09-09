import type { MetadataRoute } from 'next'
import { allPosts } from '@/lib/content'
import { site } from '@/lib/site'
import { sitemapEntries } from '@/lib/sitemap'

export default function sitemap(): MetadataRoute.Sitemap {
  return sitemapEntries(site, allPosts)
}
