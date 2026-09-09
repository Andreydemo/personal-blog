import { describe, expect, it } from 'vitest'
import { markdownTwin, markdownTwinPath } from '@/lib/markdown'
import { site } from '@/lib/site'
import { makePost } from './helpers'

const post = makePost({
  slug: 'hello',
  title: 'Hello: a title with a colon',
  description: 'A description that is comfortably longer than fifty characters for schema.',
  publishedAt: '2026-09-09T00:00:00.000Z',
  tags: ['a', 'b'],
  raw: '\n\nBody **bold**.\n\n',
})

describe('markdownTwin', () => {
  it('starts with a YAML front block naming author, canonical and dates', () => {
    const out = markdownTwin(site, post)
    expect(out.startsWith('---\n')).toBe(true)
    expect(out).toContain('title: "Hello: a title with a colon"')
    expect(out).toContain('description: "A description that is comfortably longer than fifty characters for schema."')
    expect(out).toContain('author: "Andrii Korkoshko"')
    expect(out).toContain('author_url: https://andrii.korkoshko.com/about')
    expect(out).toContain('canonical: https://andrii.korkoshko.com/posts/hello')
    expect(out).toContain('published: 2026-09-09')
    expect(out).toContain('tags: [a, b]')
  })

  it('omits updated when there is no updatedAt', () => {
    expect(markdownTwin(site, post)).not.toContain('updated:')
  })

  it('includes updated when present', () => {
    expect(markdownTwin(site, { ...post, updatedAt: '2026-09-12T00:00:00.000Z' })).toContain('updated: 2026-09-12')
  })

  it('places the trimmed body after the block, separated by a blank line, ending with one newline', () => {
    expect(markdownTwin(site, post)).toMatch(/\n---\n\nBody \*\*bold\*\*\.\n$/)
  })
})

describe('markdownTwinPath', () => {
  it('appends .md to the post path', () => {
    expect(markdownTwinPath('hello')).toBe('/posts/hello.md')
  })
})
