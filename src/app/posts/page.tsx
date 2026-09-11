import Link from 'next/link'
import { PostSearch } from '@/components/post-search'
import { allPosts } from '@/lib/content'
import { pageMetadata } from '@/lib/metadata'
import { allTags, publishedPosts } from '@/lib/posts'
import { searchablePost } from '@/lib/search'

export const metadata = pageMetadata({
  title: 'All posts',
  description: 'Every post on the site, searchable by title, summary, tag and section heading.',
  path: '/posts',
})

export default function PostsPage() {
  const posts = publishedPosts(allPosts).map((post) => searchablePost(post, post.toc))
  return (
    <>
      <div className="mb-6 flex flex-wrap items-baseline justify-between gap-2">
        <h1 className="text-3xl font-bold">All posts</h1>
        <Link href="/tags" className="text-sm underline hover:no-underline">
          What the tags mean
        </Link>
      </div>
      <PostSearch posts={posts} tags={allTags(allPosts)} />
    </>
  )
}
