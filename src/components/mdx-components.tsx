import Link from 'next/link'
import type { AnchorHTMLAttributes, HTMLAttributes } from 'react'
import { mermaidSource } from '@/lib/mermaid'
import { MermaidDiagram } from './mermaid-diagram'

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

/** Fenced ```mermaid blocks become diagrams; every other fence stays a normal <pre>. */
function Pre({ children, ...rest }: HTMLAttributes<HTMLPreElement>) {
  const source = mermaidSource(children)
  if (source !== null) return <MermaidDiagram code={source} />
  return <pre {...rest}>{children}</pre>
}

export const mdxComponents = {
  a: Anchor,
  pre: Pre,
}
