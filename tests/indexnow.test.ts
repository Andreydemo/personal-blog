import { describe, expect, it } from 'vitest'
import { collectUrls, findIndexNowKey, isDraftSource, parseNameStatus, slugFromFile } from '../scripts/indexnow-lib'

describe('parseNameStatus', () => {
  it('parses A/M/D and expands renames into delete + add', () => {
    const out = 'A\tcontent/posts/a.mdx\nM\tcontent/posts/b.mdx\nD\tcontent/posts/c.mdx\nR100\tcontent/posts/old.mdx\tcontent/posts/new.mdx\n'
    expect(parseNameStatus(out)).toEqual([
      { status: 'A', file: 'content/posts/a.mdx' },
      { status: 'M', file: 'content/posts/b.mdx' },
      { status: 'D', file: 'content/posts/c.mdx' },
      { status: 'D', file: 'content/posts/old.mdx' },
      { status: 'A', file: 'content/posts/new.mdx' },
    ])
  })

  it('returns nothing for empty output', () => {
    expect(parseNameStatus('')).toEqual([])
  })
})

describe('slugFromFile', () => {
  it('maps post files to slugs and ignores everything else', () => {
    expect(slugFromFile('content/posts/hello-world.mdx')).toBe('hello-world')
    expect(slugFromFile('content/README.md')).toBeNull()
    expect(slugFromFile('content/posts/nested/x.mdx')).toBeNull()
  })
})

describe('isDraftSource', () => {
  it('detects draft: true inside the frontmatter only', () => {
    expect(isDraftSource('---\ntitle: "x"\ndraft: true\n---\nbody')).toBe(true)
    expect(isDraftSource('---\ntitle: "x"\ndraft: false\n---\nbody')).toBe(false)
    expect(isDraftSource('---\ntitle: "x"\n---\nbody')).toBe(false)
    expect(isDraftSource('---\ntitle: "x"\n---\ndraft: true')).toBe(false)
  })

  it('handles CRLF line endings and quoted booleans', () => {
    expect(isDraftSource('---\r\ntitle: "x"\r\ndraft: true\r\n---\r\nbody')).toBe(true)
    expect(isDraftSource('---\ntitle: "x"\ndraft: "true"\n---\nbody')).toBe(true)
    expect(isDraftSource("---\ntitle: \"x\"\ndraft: 'true'\n---\nbody")).toBe(true)
    expect(isDraftSource('---\r\ntitle: "x"\r\ndraft: false\r\n---\r\nbody')).toBe(false)
  })
})

describe('findIndexNowKey', () => {
  it('finds the 32-hex key file name', () => {
    const key = 'a'.repeat(32)
    expect(findIndexNowKey(['favicon.ico', `${key}.txt`, 'robots.txt'])).toBe(key)
    expect(findIndexNowKey(['favicon.ico'])).toBeNull()
  })
})

describe('collectUrls', () => {
  const sources: Record<string, string> = {
    'content/posts/added.mdx': '---\ntitle: "a"\n---\n',
    'content/posts/changed.mdx': '---\ntitle: "c"\n---\n',
    'content/posts/secret.mdx': '---\ntitle: "s"\ndraft: true\n---\n',
  }
  const read = (file: string) => sources[file]

  it('builds urls for published changes, skips drafts, keeps deletions, tracks additions', () => {
    const changes = parseNameStatus(
      'A\tcontent/posts/added.mdx\nM\tcontent/posts/changed.mdx\nA\tcontent/posts/secret.mdx\nD\tcontent/posts/gone.mdx\nM\tcontent/README.md\n',
    )
    expect(collectUrls(changes, 'https://andrii.korkoshko.com', read)).toEqual({
      urls: [
        'https://andrii.korkoshko.com/posts/added',
        'https://andrii.korkoshko.com/posts/changed',
        'https://andrii.korkoshko.com/posts/gone',
      ],
      added: ['https://andrii.korkoshko.com/posts/added'],
    })
  })
})
