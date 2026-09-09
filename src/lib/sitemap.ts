import type { MetadataRoute } from 'next'
import { allTags, lastModified, postsByTag, publishedPosts } from './posts'
import { absoluteUrl, type SiteConfig } from './site'
import type { PostMeta } from './types'

function newestChange(posts: PostMeta[]): Date {
  const newest = posts.map(lastModified).sort().at(-1)
  return newest ? new Date(newest) : new Date()
}

export function sitemapEntries(site: SiteConfig, posts: PostMeta[]): MetadataRoute.Sitemap {
  const published = publishedPosts(posts)
  const siteWide = newestChange(published)
  return [
    { url: site.url, lastModified: siteWide },
    { url: absoluteUrl(site, '/about'), lastModified: siteWide },
    { url: absoluteUrl(site, '/tags'), lastModified: siteWide },
    ...allTags(posts).map(({ tag }) => ({
      url: absoluteUrl(site, `/tags/${tag}`),
      lastModified: newestChange(postsByTag(posts, tag)),
    })),
    ...published.map((post) => ({
      url: absoluteUrl(site, `/posts/${post.slug}`),
      lastModified: new Date(lastModified(post)),
    })),
  ]
}
