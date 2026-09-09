import { allPosts } from '@/lib/content'
import { markdownTwin } from '@/lib/markdown'
import { findPost } from '@/lib/posts'
import { site } from '@/lib/site'

export const dynamic = 'force-static'
export const dynamicParams = false

export function generateStaticParams() {
  return allPosts.map((post) => ({ slug: post.slug }))
}

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = findPost(allPosts, slug)
  if (!post) return new Response('Not found', { status: 404 })
  return new Response(markdownTwin(site, post), {
    headers: {
      'content-type': 'text/markdown; charset=utf-8',
      vary: 'Accept',
    },
  })
}
