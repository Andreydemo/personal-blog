import type { Metadata } from 'next'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { Byline } from '@/components/byline'
import { Comments } from '@/components/comments'
import { JsonLd } from '@/components/json-ld'
import { MDXContent } from '@/components/mdx-content'
import { TagList } from '@/components/tag-list'
import { allPosts } from '@/lib/content'
import { blogPosting, breadcrumbs } from '@/lib/jsonld'
import { postMetadata } from '@/lib/metadata'
import { findPost } from '@/lib/posts'
import { site } from '@/lib/site'

type Props = { params: Promise<{ slug: string }> }

export const dynamicParams = false

export function generateStaticParams() {
  return allPosts.map((post) => ({ slug: post.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const post = findPost(allPosts, slug)
  if (!post) notFound()
  return postMetadata(post)
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params
  const post = findPost(allPosts, slug)
  if (!post) notFound()

  return (
    <article>
      <JsonLd data={blogPosting(site, post)} />
      <JsonLd data={breadcrumbs(site, post)} />
      <header className="mb-8 space-y-3">
        {post.draft && (
          <p className="text-sm font-medium text-amber-600">Draft — not listed or indexed</p>
        )}
        <h1 className="text-3xl font-bold tracking-tight">{post.title}</h1>
        <p className="text-lg text-zinc-600 dark:text-zinc-400">{post.description}</p>
        <Byline post={post} />
        {post.cover && (
          <Image
            src={post.cover.src}
            width={post.cover.width}
            height={post.cover.height}
            placeholder="blur"
            blurDataURL={post.cover.blurDataURL}
            alt=""
            className="rounded"
            priority
          />
        )}
      </header>
      <div className="prose prose-zinc max-w-none dark:prose-invert">
        <MDXContent code={post.code} />
      </div>
      <footer className="mt-10">
        <TagList tags={post.tags} />
      </footer>
      {!post.draft && <Comments />}
    </article>
  )
}
