import type { PostMeta } from './types'

export function sortNewestFirst<T extends PostMeta>(posts: T[]): T[] {
  return [...posts].sort(
    (a, b) => b.publishedAt.localeCompare(a.publishedAt) || a.slug.localeCompare(b.slug),
  )
}

export function publishedPosts<T extends PostMeta>(posts: T[]): T[] {
  return sortNewestFirst(posts.filter((post) => !post.draft))
}

export function postsByTag<T extends PostMeta>(posts: T[], tag: string): T[] {
  return publishedPosts(posts).filter((post) => post.tags.includes(tag))
}

export function allTags(posts: PostMeta[]): { tag: string; count: number }[] {
  const counts = new Map<string, number>()
  for (const post of publishedPosts(posts)) {
    for (const tag of post.tags) counts.set(tag, (counts.get(tag) ?? 0) + 1)
  }
  return [...counts]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag))
}

export function findPost<T extends PostMeta>(posts: T[], slug: string): T | undefined {
  return posts.find((post) => post.slug === slug)
}

export function lastModified(post: PostMeta): string {
  return post.updatedAt ?? post.publishedAt
}

/** Published posts sharing tags with `post`, most shared tags first, then newest. */
export function relatedPosts<T extends PostMeta>(posts: T[], post: PostMeta, limit = 3): T[] {
  const mine = new Set(post.tags)
  return publishedPosts(posts)
    .filter((candidate) => candidate.slug !== post.slug)
    .map((candidate) => ({ candidate, shared: candidate.tags.filter((tag) => mine.has(tag)).length }))
    .filter(({ shared }) => shared > 0)
    .sort(
      (a, b) =>
        b.shared - a.shared ||
        b.candidate.publishedAt.localeCompare(a.candidate.publishedAt) ||
        a.candidate.slug.localeCompare(b.candidate.slug),
    )
    .slice(0, limit)
    .map(({ candidate }) => candidate)
}
