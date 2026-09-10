import Link from 'next/link'
import { site } from '@/lib/site'
import { tagLabel } from '@/lib/tags'

export function SiteHeader() {
  return (
    <header className="border-b border-zinc-200 dark:border-zinc-800">
      <nav className="mx-auto flex max-w-3xl flex-wrap items-center gap-x-5 gap-y-2 px-4 py-4">
        <Link href="/" className="font-semibold">
          {site.name}
        </Link>
        {site.featuredTags.map((tag) => (
          <Link key={tag} href={`/tags/${tag}`} className="text-sm text-zinc-600 hover:underline dark:text-zinc-400">
            {tagLabel(tag)}
          </Link>
        ))}
        <Link href="/about" className="text-sm text-zinc-600 hover:underline dark:text-zinc-400">
          About
        </Link>
        <form action="/posts" role="search" className="ml-auto">
          <input
            type="search"
            name="q"
            placeholder="Search"
            aria-label="Search posts"
            className="w-28 rounded border border-zinc-300 bg-transparent px-2 py-1 text-sm focus:w-44 focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:border-zinc-700"
          />
        </form>
      </nav>
    </header>
  )
}
