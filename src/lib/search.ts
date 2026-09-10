import type { PostMeta } from './types'

export type SearchablePost = PostMeta & { headings: string[] }

/** Post metadata plus its section headings, the fields the archive search looks at. */
export function searchablePost(post: PostMeta, toc: { title: string; url: string }[] = []): SearchablePost {
  const { slug, title, description, publishedAt, updatedAt, tags, draft, metadata } = post
  return { slug, title, description, publishedAt, updatedAt, tags, draft, metadata, headings: toc.map((t) => t.title) }
}

/** True when every whitespace-separated term appears in the title, description, tags or headings. */
export function matchesQuery(post: SearchablePost, q: string): boolean {
  const terms = q.toLowerCase().split(/\s+/).filter(Boolean)
  if (terms.length === 0) return true
  const haystack = [post.title, post.description, ...post.tags, ...post.headings].join('\n').toLowerCase()
  return terms.every((term) => haystack.includes(term))
}

export function filterPosts(posts: SearchablePost[], { q, tag }: { q: string; tag: string }): SearchablePost[] {
  return posts.filter((post) => (!tag || post.tags.includes(tag)) && matchesQuery(post, q))
}
