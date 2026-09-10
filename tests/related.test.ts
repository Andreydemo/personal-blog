import { describe, expect, it } from 'vitest'
import { relatedPosts } from '@/lib/posts'
import { makePost } from './helpers'

const me = makePost({ slug: 'me', tags: ['engineering', 'ai', 'agents'], publishedAt: '2026-03-01T00:00:00.000Z' })
const two = makePost({ slug: 'two', tags: ['ai', 'agents'], publishedAt: '2026-01-01T00:00:00.000Z' })
const one = makePost({ slug: 'one', tags: ['engineering', 'security'], publishedAt: '2026-02-01T00:00:00.000Z' })
const oneNewer = makePost({ slug: 'one-newer', tags: ['engineering'], publishedAt: '2026-02-15T00:00:00.000Z' })
const none = makePost({ slug: 'none', tags: ['opinions'] })
const draft = makePost({ slug: 'draft', tags: ['engineering', 'ai', 'agents'], draft: true })

describe('relatedPosts', () => {
  it('ranks by shared tags, then newest, excluding itself, drafts and unrelated posts', () => {
    expect(relatedPosts([me, two, one, oneNewer, none, draft], me).map((p) => p.slug)).toEqual([
      'two',
      'one-newer',
      'one',
    ])
  })

  it('respects the limit', () => {
    expect(relatedPosts([me, two, one, oneNewer], me, 1).map((p) => p.slug)).toEqual(['two'])
  })
})
