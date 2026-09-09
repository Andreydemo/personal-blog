import { describe, expect, it } from 'vitest'
import { llmsFullTxt, llmsTxt } from '@/lib/llms'
import { site } from '@/lib/site'
import { makePost } from './helpers'

const older = makePost({ slug: 'older', title: 'Older', description: 'Older post description that is long enough to satisfy the schema.', publishedAt: '2026-01-01T00:00:00.000Z' })
const newer = makePost({ slug: 'newer', title: 'Newer', description: 'Newer post description that is long enough to satisfy the schema.', publishedAt: '2026-02-01T00:00:00.000Z', raw: 'Newer body.' })
const draft = makePost({ slug: 'draft', title: 'Draft', draft: true })

describe('llmsTxt', () => {
  const out = llmsTxt(site, [older, draft, newer])

  it('follows the llms.txt shape: H1, blockquote summary, sections', () => {
    expect(out.startsWith('# Andrii Korkoshko\n\n> ')).toBe(true)
    expect(out).toContain('\n## Posts\n')
    expect(out).toContain('\n## About\n')
    expect(out).toContain('\n## Feeds\n')
  })

  it('links each published post to its markdown twin, newest first, with its description', () => {
    const posts = out.split('## Posts')[1].split('## About')[0]
    expect(posts).toContain('- [Newer](https://andrii.korkoshko.com/posts/newer.md): Newer post description')
    expect(posts).toContain('- [Older](https://andrii.korkoshko.com/posts/older.md): Older post description')
    expect(posts.indexOf('Newer')).toBeLessThan(posts.indexOf('Older'))
    expect(out).not.toContain('Draft')
  })

  it('links about and the three feeds', () => {
    expect(out).toContain('(https://andrii.korkoshko.com/about)')
    expect(out).toContain('(https://andrii.korkoshko.com/feed.xml)')
    expect(out).toContain('(https://andrii.korkoshko.com/atom.xml)')
    expect(out).toContain('(https://andrii.korkoshko.com/feed.json)')
  })
})

describe('llmsFullTxt', () => {
  it('concatenates published markdown twins newest first, separated by a rule', () => {
    const out = llmsFullTxt(site, [older, draft, newer])
    expect(out.startsWith('---\ntitle: "Newer"')).toBe(true)
    expect(out).toContain('\n\n---\n\n---\ntitle: "Older"')
    expect(out).toContain('Newer body.')
    expect(out).not.toContain('title: "Draft"')
  })
})

describe('empty site', () => {
  it('renders valid documents with a single blank line between sections when nothing is published', () => {
    const out = llmsTxt(site, [draft])
    expect(out).toContain('## Posts\n\n## About')
    expect(out).not.toContain('\n\n\n')
    expect(llmsFullTxt(site, [draft])).toBe('\n')
  })
})
