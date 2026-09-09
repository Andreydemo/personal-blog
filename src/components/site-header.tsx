import Link from 'next/link'
import { site } from '@/lib/site'

export function SiteHeader() {
  return (
    <header className="border-b border-zinc-200 dark:border-zinc-800">
      <nav className="mx-auto flex max-w-3xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-4">
        <Link href="/" className="font-semibold">
          {site.name}
        </Link>
        {site.featuredTags.map((tag) => (
          <Link key={tag} href={`/tags/${tag}`} className="text-sm capitalize text-zinc-600 hover:underline dark:text-zinc-400">
            {tag}
          </Link>
        ))}
        <Link href="/about" className="text-sm text-zinc-600 hover:underline dark:text-zinc-400">
          About
        </Link>
      </nav>
    </header>
  )
}
