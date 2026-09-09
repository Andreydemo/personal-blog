export type PostMeta = {
  slug: string
  title: string
  description: string
  /** ISO timestamp, e.g. "2026-09-09T00:00:00.000Z" */
  publishedAt: string
  updatedAt?: string
  tags: string[]
  draft: boolean
  metadata: { readingTime: number; wordCount: number }
}

export type PostContent = PostMeta & {
  /** Markdown source without frontmatter */
  raw: string
  /** Markdown compiled to HTML (used by feeds) */
  html: string
}
