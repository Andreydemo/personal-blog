import type { TocEntry } from '@/lib/toc'

export function TableOfContents({ toc }: { toc: TocEntry[] }) {
  return (
    <nav aria-label="Contents" className="mb-8 text-sm text-zinc-600 dark:text-zinc-400">
      <p className="mb-1 font-medium uppercase tracking-wide text-zinc-500">Contents</p>
      <ol className="list-decimal space-y-0.5 pl-5">
        {toc.map((entry) => (
          <li key={entry.url}>
            <a href={entry.url} className="hover:underline">
              {entry.title}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  )
}
