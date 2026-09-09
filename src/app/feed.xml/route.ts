import { allPosts } from '@/lib/content'
import { buildFeed } from '@/lib/feeds'
import { site } from '@/lib/site'

export const dynamic = 'force-static'

export function GET() {
  return new Response(buildFeed(site, allPosts).rss2(), {
    headers: { 'content-type': 'application/rss+xml; charset=utf-8' },
  })
}
