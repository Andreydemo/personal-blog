import { describe, expect, it } from 'vitest'
import { site } from '@/lib/site'
import { sitemapEntries } from '@/lib/sitemap'
import { makePost } from './helpers'

const older = makePost({ slug: 'older', publishedAt: '2026-01-01T00:00:00.000Z', tags: ['engineering'] })
const newer = makePost({
  slug: 'newer',
  publishedAt: '2026-02-01T00:00:00.000Z',
  updatedAt: '2026-02-05T00:00:00.000Z',
  tags: ['engineering', 'opinions'],
})
const draft = makePost({ slug: 'draft', draft: true, tags: ['politics'] })
const entries = sitemapEntries(site, [older, draft, newer])
const urls = entries.map((e) => e.url)

describe('sitemapEntries', () => {
  it('lists home, about, archive, tags index, tag pages and published posts', () => {
    expect(urls).toEqual([
      'https://andrii.korkoshko.com',
      'https://andrii.korkoshko.com/about',
      'https://andrii.korkoshko.com/posts',
      'https://andrii.korkoshko.com/tags',
      'https://andrii.korkoshko.com/tags/engineering',
      'https://andrii.korkoshko.com/tags/opinions',
      'https://andrii.korkoshko.com/posts/newer',
      'https://andrii.korkoshko.com/posts/older',
    ])
  })

  it('excludes drafts, markdown twins and feeds', () => {
    expect(urls.some((u) => u.includes('draft') || u.endsWith('.md') || u.includes('feed'))).toBe(false)
  })

  it('uses updatedAt (or publishedAt) as lastModified for posts and the newest for aggregate pages', () => {
    const byUrl = Object.fromEntries(entries.map((e) => [e.url, e.lastModified]))
    expect(byUrl['https://andrii.korkoshko.com/posts/newer']).toEqual(new Date('2026-02-05T00:00:00.000Z'))
    expect(byUrl['https://andrii.korkoshko.com/posts/older']).toEqual(new Date('2026-01-01T00:00:00.000Z'))
    expect(byUrl['https://andrii.korkoshko.com']).toEqual(new Date('2026-02-05T00:00:00.000Z'))
    expect(byUrl['https://andrii.korkoshko.com/tags/engineering']).toEqual(new Date('2026-02-05T00:00:00.000Z'))
  })
})
