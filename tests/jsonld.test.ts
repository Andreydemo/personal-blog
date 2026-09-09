import { describe, expect, it } from 'vitest'
import { blogPosting, breadcrumbs, person, profilePage, webSite } from '@/lib/jsonld'
import { site as base, type SiteConfig } from '@/lib/site'
import { makePost } from './helpers'

const site: SiteConfig = {
  ...base,
  author: { ...base.author, jobTitle: 'Engineer', employer: 'Acme', image: '/images/me.jpg' },
  social: { github: 'https://github.com/x', linkedin: '', x: 'https://x.com/x' },
}
const PERSON_ID = 'https://andrii.korkoshko.com/about#person'

describe('person', () => {
  it('has the fixed @id, absolute urls and only non-empty sameAs links', () => {
    const p = person(site)
    expect(p['@context']).toBe('https://schema.org')
    expect(p['@type']).toBe('Person')
    expect(p['@id']).toBe(PERSON_ID)
    expect(p.url).toBe('https://andrii.korkoshko.com/about')
    expect(p.image).toBe('https://andrii.korkoshko.com/images/me.jpg')
    expect(p.sameAs).toEqual(['https://github.com/x', 'https://x.com/x'])
    expect(p.jobTitle).toBe('Engineer')
    expect(p.worksFor).toEqual({ '@type': 'Organization', name: 'Acme' })
  })

  it('omits empty optional fields', () => {
    const p = person({ ...site, author: { ...site.author, jobTitle: '', employer: '', image: '' } })
    expect(p).not.toHaveProperty('jobTitle')
    expect(p).not.toHaveProperty('worksFor')
    expect(p).not.toHaveProperty('image')
  })
})

describe('profilePage', () => {
  it('wraps the person as mainEntity', () => {
    const page = profilePage(site)
    expect(page['@type']).toBe('ProfilePage')
    expect(page.mainEntity).toMatchObject({ '@type': 'Person', '@id': PERSON_ID })
  })
})

describe('webSite', () => {
  it('references the person by id', () => {
    const w = webSite(site)
    expect(w['@type']).toBe('WebSite')
    expect(w.url).toBe('https://andrii.korkoshko.com')
    expect(w.author).toEqual({ '@id': PERSON_ID })
    expect(w.publisher).toEqual({ '@id': PERSON_ID })
  })
})

describe('blogPosting', () => {
  const post = makePost({
    slug: 'hello',
    title: 'Hello',
    publishedAt: '2026-09-09T00:00:00.000Z',
    updatedAt: '2026-09-10T00:00:00.000Z',
    tags: ['a', 'b'],
    metadata: { readingTime: 2, wordCount: 321 },
  })

  it('fills the article fields from the post', () => {
    const b = blogPosting(site, post)
    expect(b['@type']).toBe('BlogPosting')
    expect(b.headline).toBe('Hello')
    expect(b.url).toBe('https://andrii.korkoshko.com/posts/hello')
    expect(b.mainEntityOfPage).toBe('https://andrii.korkoshko.com/posts/hello')
    expect(b.datePublished).toBe('2026-09-09T00:00:00.000Z')
    expect(b.dateModified).toBe('2026-09-10T00:00:00.000Z')
    expect(b.keywords).toEqual(['a', 'b'])
    expect(b.wordCount).toBe(321)
    expect(b.image).toBe('https://andrii.korkoshko.com/posts/hello/og')
    expect(b.author).toEqual({ '@id': PERSON_ID })
    expect(b.inLanguage).toBe('en')
  })

  it('falls back to publishedAt for dateModified', () => {
    expect(blogPosting(site, makePost({ publishedAt: '2026-01-01T00:00:00.000Z' })).dateModified).toBe(
      '2026-01-01T00:00:00.000Z',
    )
  })
})

describe('breadcrumbs', () => {
  it('lists Home then the post title', () => {
    const b = breadcrumbs(site, makePost({ slug: 'hello', title: 'Hello' }))
    expect(b['@type']).toBe('BreadcrumbList')
    expect(b.itemListElement).toEqual([
      { '@type': 'ListItem', position: 1, name: 'Home', item: { '@id': 'https://andrii.korkoshko.com' } },
      { '@type': 'ListItem', position: 2, name: 'Hello', item: { '@id': 'https://andrii.korkoshko.com/posts/hello' } },
    ])
  })
})
