import { describe, expect, it } from 'vitest'
import { FEED_LIMIT, buildFeed } from '@/lib/feeds'
import { site } from '@/lib/site'
import { makePost } from './helpers'

describe('buildFeed', () => {
  it('lists published posts newest first with absolute links and full html', () => {
    const older = makePost({ slug: 'older', publishedAt: '2026-01-01T00:00:00.000Z', html: '<p>old</p>' })
    const newer = makePost({ slug: 'newer', publishedAt: '2026-02-01T00:00:00.000Z', html: '<p>new</p>' })
    const draft = makePost({ slug: 'draft', draft: true })
    const feed = buildFeed(site, [older, draft, newer])
    expect(feed.items.map((i) => i.link)).toEqual([
      'https://andrii.korkoshko.com/posts/newer',
      'https://andrii.korkoshko.com/posts/older',
    ])
    expect(feed.items[0].content).toBe('<p>new</p>')
    expect(feed.items[0].author).toEqual([{ name: 'Andrii Korkoshko', link: 'https://andrii.korkoshko.com/about' }])
  })

  it('caps at FEED_LIMIT items', () => {
    const many = Array.from({ length: FEED_LIMIT + 10 }, (_, i) =>
      makePost({ slug: `p${i}`, publishedAt: `2026-01-${String((i % 28) + 1).padStart(2, '0')}T00:00:00.000Z` }),
    )
    expect(buildFeed(site, many).items).toHaveLength(FEED_LIMIT)
  })

  it('uses the newest modification time as the feed updated time', () => {
    const a = makePost({ publishedAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-03-01T00:00:00.000Z' })
    const b = makePost({ publishedAt: '2026-02-01T00:00:00.000Z' })
    expect(buildFeed(site, [a, b]).options.updated?.toISOString()).toBe('2026-03-01T00:00:00.000Z')
  })

  it('renders all three formats', () => {
    const feed = buildFeed(site, [makePost({ slug: 'x' })])
    expect(feed.rss2()).toContain('<item>')
    expect(feed.rss2()).toContain('https://andrii.korkoshko.com/posts/x')
    expect(feed.atom1()).toContain('<entry>')
    expect(JSON.parse(feed.json1()).items[0].url).toBe('https://andrii.korkoshko.com/posts/x')
  })

  it('renders valid empty feeds when nothing is published', () => {
    const feed = buildFeed(site, [makePost({ draft: true })])
    expect(feed.items).toHaveLength(0)
    expect(feed.rss2()).toContain('<rss')
    expect(JSON.parse(feed.json1()).items).toEqual([])
  })
})
