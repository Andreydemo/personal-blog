import { isoDay } from './dates'
import { absoluteUrl, type SiteConfig } from './site'
import type { PostContent } from './types'

/** Double-quoted YAML scalar; JSON string escaping is valid YAML. */
const quote = (value: string) => JSON.stringify(value)

export function markdownTwinPath(slug: string): string {
  return `/posts/${slug}.md`
}

export function markdownTwin(site: SiteConfig, post: PostContent): string {
  const front = [
    '---',
    `title: ${quote(post.title)}`,
    `description: ${quote(post.description)}`,
    `author: ${quote(site.author.name)}`,
    `author_url: ${absoluteUrl(site, '/about')}`,
    `canonical: ${absoluteUrl(site, `/posts/${post.slug}`)}`,
    `published: ${isoDay(post.publishedAt)}`,
    ...(post.updatedAt ? [`updated: ${isoDay(post.updatedAt)}`] : []),
    `tags: [${post.tags.join(', ')}]`,
    '---',
  ]
  return `${front.join('\n')}\n\n${post.raw.trim()}\n`
}
