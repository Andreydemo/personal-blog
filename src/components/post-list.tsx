import type { PostMeta } from '@/lib/types'
import { PostCard } from './post-card'

export function PostList({ posts }: { posts: PostMeta[] }) {
  if (posts.length === 0) return <p className="text-zinc-600 dark:text-zinc-400">Nothing published yet.</p>
  return (
    <ul className="space-y-10">
      {posts.map((post) => (
        <li key={post.slug}>
          <PostCard post={post} />
        </li>
      ))}
    </ul>
  )
}
