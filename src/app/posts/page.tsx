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
      <h1 className="mb-6 text-3xl font-bold">All posts</h1>
      <PostSearch posts={posts} tags={allTags(allPosts)} />
    </>
  )
}
