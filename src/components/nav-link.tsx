'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'

export function NavLink({ href, children }: { href: string; children: ReactNode }) {
  const pathname = usePathname()
  const active = pathname === href || (href !== '/' && pathname.startsWith(`${href}/`))
  return (
    <Link
      href={href}
      aria-current={active ? 'page' : undefined}
      className={`text-sm hover:underline ${active ? 'font-medium text-zinc-900 underline dark:text-zinc-100' : 'text-zinc-600 dark:text-zinc-400'}`}
    >
      {children}
    </Link>
  )
}
