import { describe, expect, it } from 'vitest'
import { pageMetadata, postMetadata } from '@/lib/metadata'
import { makePost } from './helpers'

describe('pageMetadata', () => {
  it('sets canonical path and website open graph', () => {
    const m = pageMetadata({ title: 'Tags', path: '/tags' })
    expect(m.title).toBe('Tags')
    expect(m.alternates?.canonical).toBe('/tags')
    expect(m.openGraph).toMatchObject({ type: 'website', url: 'https://andrii.korkoshko.com/tags', title: 'Tags' })
  })

  it('leaves title undefined so the layout default applies', () => {
    expect(pageMetadata({ path: '/' })).not.toHaveProperty('title')
  })

  it('advertises the feeds', () => {
    expect(pageMetadata({ path: '/' }).alternates?.types).toMatchObject({
      'application/rss+xml': [{ url: '/feed.xml' }],
      'application/atom+xml': [{ url: '/atom.xml' }],
      'application/feed+json': [{ url: '/feed.json' }],
    })
  })
})

describe('postMetadata', () => {
  const post = makePost({
    slug: 'hello',
    title: 'Hello',
    publishedAt: '2026-09-09T00:00:00.000Z',
    updatedAt: '2026-09-10T00:00:00.000Z',
    tags: ['a'],
  })

  it('sets article open graph, canonical and the generated image', () => {
    const m = postMetadata(post)
    expect(m.title).toBe('Hello')
    expect(m.alternates?.canonical).toBe('/posts/hello')
    expect(m.openGraph).toMatchObject({
      type: 'article',
      url: 'https://andrii.korkoshko.com/posts/hello',
      publishedTime: '2026-09-09T00:00:00.000Z',
      modifiedTime: '2026-09-10T00:00:00.000Z',
      authors: ['https://andrii.korkoshko.com/about'],
      tags: ['a'],
      images: [{ url: '/posts/hello/og', width: 1200, height: 630, alt: 'Hello' }],
    })
    expect(m.twitter).toMatchObject({ card: 'summary_large_image', images: ['/posts/hello/og'] })
    expect(m).not.toHaveProperty('robots')
  })

  it('marks drafts noindex', () => {
    expect(postMetadata(makePost({ draft: true })).robots).toEqual({ index: false, follow: false })
  })

  it('advertises the markdown twin as an alternate', () => {
    expect(postMetadata(post).alternates?.types).toMatchObject({ 'text/markdown': '/posts/hello.md' })
  })
})
