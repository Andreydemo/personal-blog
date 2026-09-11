import Link from 'next/link'
import { formatDate, isoDay } from '@/lib/dates'
import { readingMinutes } from '@/lib/posts'
import type { PostMeta } from '@/lib/types'
import { TagList } from './tag-list'

export function PostCard({ post }: { post: PostMeta }) {
  return (
    <article className="space-y-2">
      <h3 className="text-xl font-semibold">
        <Link href={`/posts/${post.slug}`} className="hover:underline">
          {post.title}
        </Link>
      </h3>
      <p className="text-zinc-600 dark:text-zinc-400">{post.description}</p>
      <div className="flex flex-wrap items-center gap-3 text-sm text-zinc-600 dark:text-zinc-400">
        <time dateTime={isoDay(post.publishedAt)}>{formatDate(post.publishedAt)}</time>
        <span>{readingMinutes(post)} min read</span>
        <TagList tags={post.tags} />
      </div>
    </article>
  )
}
