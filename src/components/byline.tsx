import Link from 'next/link'
import { formatDate, isoDay } from '@/lib/dates'
import { readingMinutes } from '@/lib/posts'
import { site } from '@/lib/site'
import type { PostMeta } from '@/lib/types'

export function Byline({ post }: { post: PostMeta }) {
  const minutes = readingMinutes(post)
  return (
    <p className="text-sm text-zinc-600 dark:text-zinc-400">
      <Link href="/about" rel="author" className="hover:underline">
        {site.author.name}
      </Link>
      {' · '}
      <time dateTime={isoDay(post.publishedAt)}>{formatDate(post.publishedAt)}</time>
      {post.updatedAt && (
        <>
          {' · updated '}
          <time dateTime={isoDay(post.updatedAt)}>{formatDate(post.updatedAt)}</time>
        </>
      )}
      {' · '}
      {minutes} min read
    </p>
  )
}
