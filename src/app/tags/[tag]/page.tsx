import { notFound } from 'next/navigation'
import { PostList } from '@/components/post-list'
import { allPosts } from '@/lib/content'
import { allTags, postsByTag } from '@/lib/posts'

type Props = { params: Promise<{ tag: string }> }

export const dynamicParams = false

export function generateStaticParams() {
  return allTags(allPosts).map(({ tag }) => ({ tag }))
}

export async function generateMetadata({ params }: Props) {
  const { tag } = await params
  return { title: `#${tag}` }
}

export default async function TagPage({ params }: Props) {
  const { tag } = await params
  const posts = postsByTag(allPosts, tag)
  if (posts.length === 0) notFound()
  return (
    <>
      <h1 className="mb-6 text-3xl font-bold">#{tag}</h1>
      <PostList posts={posts} />
    </>
  )
}
