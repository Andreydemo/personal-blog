import { describe, expect, it } from 'vitest'
import { filterPosts, matchesQuery, searchablePost } from '@/lib/search'
import { makePost } from './helpers'

const ssrf = searchablePost(
  makePost({ slug: 'ssrf', title: 'Your webhook feature is an SSRF feature', description: 'A four-layer guard with connect-time DNS pinning closes the hole.', tags: ['engineering', 'security'] }),
  [{ title: 'Which four layers closed it?', url: '#a' }],
)
const guide = searchablePost(
  makePost({ slug: 'guide', title: 'How to prompt ChatGPT and Claude', description: 'Skip the role play and brief the model like a junior associate.', tags: ['ai', 'prompting'] }),
  [{ title: 'Make it interview you', url: '#b' }],
)

describe('matchesQuery', () => {
  it('matches title, description, tags and headings, case-insensitively', () => {
    expect(matchesQuery(ssrf, 'ssrf')).toBe(true)
    expect(matchesQuery(ssrf, 'DNS Pinning')).toBe(true)
    expect(matchesQuery(ssrf, 'security')).toBe(true)
    expect(matchesQuery(ssrf, 'four layers')).toBe(true)
    expect(matchesQuery(ssrf, 'chatgpt')).toBe(false)
  })

  it('requires every term to match somewhere', () => {
    expect(matchesQuery(guide, 'claude interview')).toBe(true)
    expect(matchesQuery(guide, 'claude webhook')).toBe(false)
  })

  it('treats an empty or whitespace query as a match', () => {
    expect(matchesQuery(guide, '')).toBe(true)
    expect(matchesQuery(guide, '   ')).toBe(true)
  })
})

describe('filterPosts', () => {
  it('combines a query with a tag filter', () => {
    expect(filterPosts([ssrf, guide], { q: '', tag: 'ai' }).map((p) => p.slug)).toEqual(['guide'])
    expect(filterPosts([ssrf, guide], { q: 'feature', tag: '' }).map((p) => p.slug)).toEqual(['ssrf'])
    expect(filterPosts([ssrf, guide], { q: 'feature', tag: 'ai' })).toEqual([])
  })
})
