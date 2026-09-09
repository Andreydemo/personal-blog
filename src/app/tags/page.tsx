import Link from 'next/link'
import { allPosts } from '@/lib/content'
import { allTags } from '@/lib/posts'

export const metadata = { title: 'Tags' }

export default function TagsPage() {
  const tags = allTags(allPosts)
  return (
    <>
      <h1 className="mb-6 text-3xl font-bold">Tags</h1>
      <ul className="flex flex-wrap gap-3">
        {tags.map(({ tag, count }) => (
          <li key={tag}>
            <Link href={`/tags/${tag}`} className="rounded bg-zinc-100 px-3 py-1 hover:underline dark:bg-zinc-800">
              #{tag} <span className="text-zinc-500">({count})</span>
            </Link>
          </li>
        ))}
      </ul>
    </>
  )
}
