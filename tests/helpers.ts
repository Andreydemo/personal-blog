import type { PostContent } from '@/lib/types'

let counter = 0

export function makePost(overrides: Partial<PostContent> = {}): PostContent {
  counter += 1
  return {
    slug: `post-${counter}`,
    title: `Post ${counter}`,
    description: 'A description that is comfortably longer than fifty characters for schema.',
    publishedAt: '2026-01-01T00:00:00.000Z',
    tags: ['engineering'],
    draft: false,
    metadata: { readingTime: 3, wordCount: 600 },
    raw: `# Heading\n\nBody of post ${counter}.`,
    html: `<h1>Heading</h1>\n<p>Body of post ${counter}.</p>`,
    ...overrides,
  }
}
