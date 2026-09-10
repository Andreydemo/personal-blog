import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { PostList } from '@/components/post-list'
import { allPosts } from '@/lib/content'
import { pageMetadata } from '@/lib/metadata'
import { allTags, postsByTag } from '@/lib/posts'
import { TAGS, isKnownTag, tagInfo, tagLabel } from '@/lib/tags'

type Props = { params: Promise<{ tag: string }> }

export const dynamicParams = false

/** Every registered tag plus any tag with a published post, so nav and chip links never 404. */
export function generateStaticParams() {
  const tags = new Set([...TAGS.map((t) => t.tag), ...allTags(allPosts).map(({ tag }) => tag)])
  return [...tags].map((tag) => ({ tag }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tag } = await params
  const empty = postsByTag(allPosts, tag).length === 0
  return {
    ...pageMetadata({ title: `#${tag}`, description: tagInfo(tag)?.description, path: `/tags/${tag}` }),
    ...(empty ? { robots: { index: false, follow: true } } : {}),
  }
}

export default async function TagPage({ params }: Props) {
  const { tag } = await params
  const posts = postsByTag(allPosts, tag)
  if (posts.length === 0 && !isKnownTag(tag)) notFound()
  const info = tagInfo(tag)
  return (
    <>
      <header className="mb-8 space-y-2">
        <h1 className="text-3xl font-bold">#{tag}</h1>
        {info && (
          <p className="text-lg text-zinc-600 dark:text-zinc-400">
            {info.kind === 'section' ? 'Section' : 'Topic'}: {info.description}
          </p>
        )}
        <p className="text-sm text-zinc-500">
          {posts.length === 1 ? '1 post' : `${posts.length} posts`} in {tagLabel(tag)} ·{' '}
          <Link href="/tags" className="hover:underline">
            All tags
          </Link>
        </p>
      </header>
      <PostList posts={posts} />
    </>
  )
}
