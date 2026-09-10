import Link from 'next/link'
import { JsonLd } from '@/components/json-ld'
import { PostList } from '@/components/post-list'
import { allPosts } from '@/lib/content'
import { webSite } from '@/lib/jsonld'
import { pageMetadata } from '@/lib/metadata'
import { publishedPosts } from '@/lib/posts'
import { site } from '@/lib/site'

export const metadata = pageMetadata({ path: '/' })

export default function HomePage() {
  const posts = publishedPosts(allPosts).slice(0, 10)
  return (
    <>
      <JsonLd data={webSite(site)} />
      <section className="mb-12">
        <h1 className="text-3xl font-bold tracking-tight">{site.name}</h1>
        <p className="mt-3 text-lg text-zinc-600 dark:text-zinc-400">{site.author.bio}</p>
      </section>
      <h2 className="mb-6 text-xl font-semibold">Latest posts</h2>
      <PostList posts={posts} />
      <p className="mt-10 text-sm text-zinc-600 dark:text-zinc-400">
        <Link href="/posts" className="hover:underline">
          All posts and search
        </Link>
        {' · '}
        <Link href="/tags" className="hover:underline">
          Browse by tag
        </Link>
      </p>
    </>
  )
}
