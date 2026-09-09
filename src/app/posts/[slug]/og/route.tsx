import { ImageResponse } from 'next/og'
import { allPosts } from '@/lib/content'
import { formatDate } from '@/lib/dates'
import { OG_IMAGE } from '@/lib/metadata'
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

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: 64,
          background: '#09090b',
          color: '#fafafa',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ fontSize: 28, color: '#a1a1aa' }}>{site.url.replace('https://', '')}</div>
        <div style={{ fontSize: 64, fontWeight: 700, lineHeight: 1.1 }}>{post.title}</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 28, color: '#a1a1aa' }}>
          <span>{site.author.name}</span>
          <span>{formatDate(post.publishedAt)}</span>
        </div>
      </div>
    ),
    OG_IMAGE,
  )
}
