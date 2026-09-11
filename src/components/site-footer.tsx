import Link from 'next/link'
import { site } from '@/lib/site'

export function SiteFooter() {
  const pages = [
    { label: 'Posts', href: '/posts' },
    { label: 'Tags', href: '/tags' },
    { label: 'About', href: '/about' },
  ]
  const external = [
    { label: 'GitHub', href: site.social.github, rel: 'me' },
    { label: 'LinkedIn', href: site.social.linkedin, rel: 'me' },
    { label: 'X', href: site.social.x, rel: 'me' },
    { label: 'RSS', href: '/feed.xml', rel: 'alternate' },
  ].filter((link) => link.href.length > 0)

  return (
    <footer className="border-t border-zinc-200 dark:border-zinc-800">
      <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-4 px-4 py-6 text-sm text-zinc-600 dark:text-zinc-400">
        <span>
          © {new Date().getUTCFullYear()} {site.author.name}
        </span>
        <nav aria-label="Footer">
          <ul className="flex flex-wrap gap-4">
            {pages.map((link) => (
              <li key={link.label}>
                <Link href={link.href} className="hover:underline">
                  {link.label}
                </Link>
              </li>
            ))}
            {external.map((link) => (
              <li key={link.label}>
                <a href={link.href} rel={link.rel} className="hover:underline">
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </footer>
  )
}
