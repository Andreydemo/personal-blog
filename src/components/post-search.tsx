'use client'

import { useMemo, useSyncExternalStore } from 'react'
import { filterPosts, type SearchablePost } from '@/lib/search'
import { tagLabel } from '@/lib/tags'
import { PostCard } from './post-card'

type TagCount = { tag: string; count: number }

/** The URL query string is the single source of truth for the search state. */
const listeners = new Set<() => void>()
function subscribe(listener: () => void) {
  listeners.add(listener)
  window.addEventListener('popstate', listener)
  return () => {
    listeners.delete(listener)
    window.removeEventListener('popstate', listener)
  }
}
const getSnapshot = () => window.location.search
const getServerSnapshot = () => ''
function setSearch(update: (params: URLSearchParams) => void) {
  const params = new URLSearchParams(window.location.search)
  update(params)
  const query = params.toString()
  window.history.replaceState(null, '', query ? `?${query}` : window.location.pathname)
  for (const listener of listeners) listener()
}

export function PostSearch({ posts, tags }: { posts: SearchablePost[]; tags: TagCount[] }) {
  const search = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
  const params = new URLSearchParams(search)
  const q = params.get('q') ?? ''
  const tag = params.get('tag') ?? ''
  const results = useMemo(() => filterPosts(posts, { q, tag }), [posts, q, tag])

  const setParam = (key: 'q' | 'tag', value: string) =>
    setSearch((next) => (value ? next.set(key, value) : next.delete(key)))
  const chip = (active: boolean) =>
    `rounded px-2 py-0.5 text-sm ${active ? 'bg-zinc-800 text-white dark:bg-zinc-200 dark:text-zinc-900' : 'bg-zinc-100 hover:underline dark:bg-zinc-800'}`

  return (
    <div className="space-y-6">
      <input
        type="search"
        value={q}
        onChange={(event) => setParam('q', event.target.value)}
        placeholder="Search titles, summaries, tags and section headings"
        aria-label="Search posts"
        className="w-full rounded border border-zinc-300 bg-transparent px-3 py-2 focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:border-zinc-700"
      />
      <ul className="flex flex-wrap gap-2" aria-label="Filter by tag">
        <li>
          <button type="button" onClick={() => setParam('tag', '')} className={chip(tag === '')}>
            All
          </button>
        </li>
        {tags.map(({ tag: name, count }) => (
          <li key={name}>
            <button type="button" onClick={() => setParam('tag', name === tag ? '' : name)} className={chip(name === tag)}>
              #{name} <span className="opacity-60">{count}</span>
            </button>
          </li>
        ))}
      </ul>
      <p className="text-sm text-zinc-600 dark:text-zinc-400" aria-live="polite">
        {results.length === posts.length
          ? `${posts.length} posts`
          : `${results.length} of ${posts.length} posts${tag ? ` in ${tagLabel(tag)}` : ''}`}
      </p>
      {results.length === 0 ? (
        <p className="text-zinc-600 dark:text-zinc-400">No posts match. Try fewer words or clear the tag.</p>
      ) : (
        <ul className="space-y-10">
          {results.map((post) => (
            <li key={post.slug}>
              <PostCard post={post} />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
