import Link from 'next/link'

export function TagList({ tags }: { tags: string[] }) {
  return (
    <ul className="flex flex-wrap gap-2 text-sm">
      {tags.map((tag) => (
        <li key={tag}>
          <Link href={`/tags/${tag}`} className="inline-block rounded bg-zinc-100 px-2 py-0.5 text-zinc-700 hover:underline dark:bg-zinc-800 dark:text-zinc-300">
            #{tag}
          </Link>
        </li>
      ))}
    </ul>
  )
}
