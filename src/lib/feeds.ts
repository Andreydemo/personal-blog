import { Feed } from 'feed'
import { lastModified, publishedPosts } from './posts'
import { absoluteUrl, type SiteConfig } from './site'
import type { PostContent } from './types'

export const FEED_LIMIT = 50

export function buildFeed(site: SiteConfig, posts: PostContent[]): Feed {
  const items = publishedPosts(posts).slice(0, FEED_LIMIT)
  const author = { name: site.author.name, link: absoluteUrl(site, '/about') }
  const newest = items.map(lastModified).sort().at(-1)

  const feed = new Feed({
    id: site.url,
    link: site.url,
    title: site.name,
    description: site.description,
    language: 'en',
    copyright: `© ${new Date().getUTCFullYear()} ${site.author.name}`,
    generator: false,
    ...(newest ? { updated: new Date(newest) } : {}),
    feedLinks: {
      rss: absoluteUrl(site, '/feed.xml'),
      atom: absoluteUrl(site, '/atom.xml'),
      json: absoluteUrl(site, '/feed.json'),
    },
    author,
  })

  for (const post of items) {
    const url = absoluteUrl(site, `/posts/${post.slug}`)
    feed.addItem({
      title: post.title,
      id: url,
      link: url,
      description: post.description,
      content: post.html,
      author: [author],
      date: new Date(lastModified(post)),
      published: new Date(post.publishedAt),
      category: post.tags.map((name) => ({ name })),
    })
  }
  return feed
}
