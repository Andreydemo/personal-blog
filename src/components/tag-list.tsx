import Link from 'next/link'

export function TagList({ tags }: { tags: string[] }) {
  return (
    <ul className="flex flex-wrap gap-2 text-sm">
      {tags.map((tag) => (
        <li key={tag}>
          <Link href={`/tags/${tag}`} className="rounded bg-zinc-100 px-2 py-0.5 hover:underline dark:bg-zinc-800">
            #{tag}
          </Link>
        </li>
      ))}
    </ul>
  )
}
