import Link from 'next/link'
import type { AnchorHTMLAttributes } from 'react'

function Anchor({ href = '', children, ...rest }: AnchorHTMLAttributes<HTMLAnchorElement>) {
  const internal = href.startsWith('/') || href.startsWith('#')
  if (internal) {
    return (
      <Link href={href} {...rest}>
        {children}
      </Link>
    )
  }
  return (
    <a href={href} rel="noopener" {...rest}>
      {children}
    </a>
  )
}

export const mdxComponents = {
  a: Anchor,
}
