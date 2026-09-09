import { site } from '@/lib/site'

export function SiteFooter() {
  const links = [
    { label: 'GitHub', href: site.social.github },
    { label: 'LinkedIn', href: site.social.linkedin },
    { label: 'X', href: site.social.x },
    { label: 'RSS', href: '/feed.xml' },
  ].filter((link) => link.href.length > 0)

  return (
    <footer className="border-t border-zinc-200 dark:border-zinc-800">
      <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-4 px-4 py-6 text-sm text-zinc-600 dark:text-zinc-400">
        <span>
          © {new Date().getUTCFullYear()} {site.author.name}
        </span>
        <ul className="flex gap-4">
          {links.map((link) => (
            <li key={link.label}>
              <a href={link.href} rel="me" className="hover:underline">
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  )
}
