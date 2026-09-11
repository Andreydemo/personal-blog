'use client'

import { useEffect, useRef } from 'react'

/** Header search. Submits to the archive; the "/" key focuses it from anywhere on the page. */
export function SearchBox() {
  const ref = useRef<HTMLInputElement>(null)

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== '/' || event.metaKey || event.ctrlKey || event.altKey) return
      const target = event.target as HTMLElement | null
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) return
      event.preventDefault()
      ref.current?.focus()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  return (
    <form action="/posts" role="search" className="relative ml-auto">
      <input
        ref={ref}
        type="search"
        name="q"
        placeholder="Search"
        aria-label="Search posts"
        className="peer w-28 rounded border border-zinc-300 bg-transparent py-1 pl-2 pr-7 text-sm transition-[width] focus:w-48 focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:border-zinc-700"
      />
      <kbd
        aria-hidden="true"
        className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 rounded border border-zinc-300 px-1 font-sans text-[10px] text-zinc-500 peer-focus:hidden dark:border-zinc-700"
      >
        /
      </kbd>
    </form>
  )
}
