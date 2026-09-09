import { allPosts } from '@/lib/content'
import { buildFeed } from '@/lib/feeds'
import { site } from '@/lib/site'

export const dynamic = 'force-static'

export function GET() {
  return new Response(buildFeed(site, allPosts).json1(), {
    headers: { 'content-type': 'application/feed+json; charset=utf-8' },
  })
}
