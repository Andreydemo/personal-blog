import { allPosts } from '@/lib/content'
import { llmsFullTxt } from '@/lib/llms'
import { site } from '@/lib/site'

export const dynamic = 'force-static'

export function GET() {
  return new Response(llmsFullTxt(site, allPosts), {
    headers: { 'content-type': 'text/plain; charset=utf-8' },
  })
}
