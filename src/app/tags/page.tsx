import Link from 'next/link'
import { allPosts } from '@/lib/content'
import { pageMetadata } from '@/lib/metadata'
import { allTags } from '@/lib/posts'
import { TAGS, type TagInfo } from '@/lib/tags'

export const metadata = pageMetadata({
  title: 'Tags',
  description: 'Sections and topics on this site, with what each one covers.',
  path: '/tags',
})

function TagGroup({ title, tags, counts }: { title: string; tags: TagInfo[]; counts: Map<string, number> }) {
  if (tags.length === 0) return null
  return (
    <section>
      <h2 className="mb-3 text-xl font-semibold">{title}</h2>
      <ul className="space-y-2">
        {tags.map((t) => (
          <li key={t.tag} className="flex flex-wrap items-baseline gap-x-3">
            <Link href={`/tags/${t.tag}`} className="rounded bg-zinc-100 px-2 py-0.5 text-sm hover:underline dark:bg-zinc-800">
              #{t.tag}
            </Link>
            <span className="text-zinc-600 dark:text-zinc-400">{t.description}</span>
            <span className="text-sm text-zinc-500">{counts.get(t.tag) ?? 0}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}

export default function TagsPage() {
  const counts = new Map(allTags(allPosts).map(({ tag, count }) => [tag, count]))
  const sections = TAGS.filter((t) => t.kind === 'section')
  const topics = TAGS.filter((t) => t.kind === 'topic' && (counts.get(t.tag) ?? 0) > 0)
  return (
    <div className="space-y-10">
      <h1 className="text-3xl font-bold">Tags</h1>
      <TagGroup title="Sections" tags={sections} counts={counts} />
      <TagGroup title="Topics" tags={topics} counts={counts} />
      <p className="text-sm text-zinc-500">
        Every post carries one section and up to a few topics. <Link href="/posts" className="underline hover:no-underline">Search all posts</Link>.
      </p>
    </div>
  )
}
