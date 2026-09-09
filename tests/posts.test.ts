import { describe, expect, it } from 'vitest'
import { allTags, findPost, lastModified, postsByTag, publishedPosts, sortNewestFirst } from '@/lib/posts'
import { makePost } from './helpers'

const older = makePost({ slug: 'older', publishedAt: '2026-01-01T00:00:00.000Z', tags: ['engineering'] })
const newer = makePost({ slug: 'newer', publishedAt: '2026-03-01T00:00:00.000Z', tags: ['engineering', 'opinions'] })
const draft = makePost({ slug: 'draft', publishedAt: '2026-04-01T00:00:00.000Z', draft: true, tags: ['politics'] })
const all = [older, draft, newer]

describe('sortNewestFirst', () => {
  it('orders by publishedAt descending without mutating input', () => {
    const sorted = sortNewestFirst(all)
    expect(sorted.map((p) => p.slug)).toEqual(['draft', 'newer', 'older'])
    expect(all[0].slug).toBe('older')
  })

  it('breaks ties by slug for deterministic output', () => {
    const a = makePost({ slug: 'a', publishedAt: '2026-01-01T00:00:00.000Z' })
    const b = makePost({ slug: 'b', publishedAt: '2026-01-01T00:00:00.000Z' })
    expect(sortNewestFirst([b, a]).map((p) => p.slug)).toEqual(['a', 'b'])
  })
})

describe('publishedPosts', () => {
  it('drops drafts and sorts newest first', () => {
    expect(publishedPosts(all).map((p) => p.slug)).toEqual(['newer', 'older'])
  })
})

describe('postsByTag', () => {
  it('returns published posts carrying the tag', () => {
    expect(postsByTag(all, 'engineering').map((p) => p.slug)).toEqual(['newer', 'older'])
    expect(postsByTag(all, 'politics')).toEqual([])
  })
})

describe('allTags', () => {
  it('counts tags across published posts only, most used first then alphabetical', () => {
    expect(allTags(all)).toEqual([
      { tag: 'engineering', count: 2 },
      { tag: 'opinions', count: 1 },
    ])
  })
})

describe('findPost', () => {
  it('finds drafts too, because draft pages are still built', () => {
    expect(findPost(all, 'draft')?.slug).toBe('draft')
    expect(findPost(all, 'missing')).toBeUndefined()
  })
})

describe('lastModified', () => {
  it('prefers updatedAt over publishedAt', () => {
    expect(lastModified(makePost({ publishedAt: '2026-01-01T00:00:00.000Z' }))).toBe('2026-01-01T00:00:00.000Z')
    expect(
      lastModified(makePost({ publishedAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-02-01T00:00:00.000Z' })),
    ).toBe('2026-02-01T00:00:00.000Z')
  })
})
