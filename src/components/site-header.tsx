import Link from 'next/link'
import { site } from '@/lib/site'
import { tagLabel } from '@/lib/tags'
import { NavLink } from './nav-link'
import { SearchBox } from './search-box'

export function SiteHeader() {
  return (
    <header className="border-b border-zinc-200 dark:border-zinc-800">
      <nav aria-label="Primary" className="mx-auto flex max-w-3xl flex-wrap items-center gap-x-5 gap-y-2 px-4 py-4">
        <Link href="/" className="font-semibold">
          {site.name}
        </Link>
        {site.featuredTags.map((tag) => (
          <NavLink key={tag} href={`/tags/${tag}`}>
            {tagLabel(tag)}
          </NavLink>
        ))}
        <NavLink href="/posts">Posts</NavLink>
        <NavLink href="/about">About</NavLink>
        <SearchBox />
      </nav>
    </header>
  )
}
