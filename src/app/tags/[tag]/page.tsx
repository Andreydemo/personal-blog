import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { PostList } from '@/components/post-list'
import { allPosts } from '@/lib/content'
import { pageMetadata } from '@/lib/metadata'
import { allTags, postsByTag } from '@/lib/posts'
import { site } from '@/lib/site'

type Props = { params: Promise<{ tag: string }> }

export const dynamicParams = false

/** Every tag with a published post, plus the featured tags so nav links never 404. */
export function generateStaticParams() {
  const tags = new Set([...allTags(allPosts).map(({ tag }) => tag), ...site.featuredTags])
  return [...tags].map((tag) => ({ tag }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tag } = await params
  const empty = postsByTag(allPosts, tag).length === 0
  return {
    ...pageMetadata({ title: `#${tag}`, path: `/tags/${tag}` }),
    ...(empty ? { robots: { index: false, follow: true } } : {}),
  }
}

export default async function TagPage({ params }: Props) {
  const { tag } = await params
  const posts = postsByTag(allPosts, tag)
  if (posts.length === 0 && !site.featuredTags.includes(tag)) notFound()
  return (
    <>
      <h1 className="mb-6 text-3xl font-bold">#{tag}</h1>
      <PostList posts={posts} />
    </>
  )
}
