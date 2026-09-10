import { describe, expect, it } from 'vitest'
import { mermaidSource } from '@/lib/mermaid'

const code = (className: string, children: unknown) => ({ props: { className, children } })

describe('mermaidSource', () => {
  it('returns the source of a mermaid code block', () => {
    expect(mermaidSource(code('language-mermaid', 'graph TD\n  A-->B'))).toBe('graph TD\n  A-->B')
  })

  it('trims a trailing newline that MDX leaves on fenced code', () => {
    expect(mermaidSource(code('language-mermaid', 'graph TD\n'))).toBe('graph TD')
  })

  it('ignores other languages, plain pre blocks and non-elements', () => {
    expect(mermaidSource(code('language-kotlin', 'val x = 1'))).toBeNull()
    expect(mermaidSource(code('language-mermaid', ['not', 'a', 'string']))).toBeNull()
    expect(mermaidSource('just text')).toBeNull()
    expect(mermaidSource(null)).toBeNull()
    expect(mermaidSource({ props: {} })).toBeNull()
  })
})
