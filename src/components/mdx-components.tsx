import Link from 'next/link'
import type { AnchorHTMLAttributes, HTMLAttributes } from 'react'
import { mermaidSource } from '@/lib/mermaid'
import { CodeBlock } from './code-block'
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

/** Fenced ```mermaid blocks become diagrams; every other fence gets a copy button. */
function Pre({ children, ...rest }: HTMLAttributes<HTMLPreElement>) {
  const source = mermaidSource(children)
  if (source !== null) return <MermaidDiagram code={source} />
  return <CodeBlock {...rest}>{children}</CodeBlock>
}

/** Headings carry ids from rehype-slug; add a hover anchor so readers can copy a section link. */
function heading(Tag: 'h2' | 'h3') {
  return function Heading({ id, children, ...rest }: HTMLAttributes<HTMLHeadingElement>) {
    return (
      <Tag id={id} className="group scroll-mt-4" {...rest}>
        {children}
        {id && (
          <a
            href={`#${id}`}
            aria-label="Link to this section"
            className="ml-2 font-normal text-zinc-400 no-underline opacity-0 transition-opacity group-hover:opacity-100 focus:opacity-100"
          >
            #
          </a>
        )}
      </Tag>
    )
  }
}

export const mdxComponents = {
  a: Anchor,
  pre: Pre,
  h2: heading('h2'),
  h3: heading('h3'),
}
