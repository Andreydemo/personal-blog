'use client'

import { useEffect, useId, useState } from 'react'

/**
 * Renders a Mermaid diagram in the browser. The server HTML (and the initial
 * client render) is the plain code block, so crawlers, feeds and no-JS readers
 * always get the text source; the SVG replaces it after mermaid loads.
 */
export function MermaidDiagram({ code }: { code: string }) {
  const id = useId().replace(/[^a-zA-Z0-9]/g, '')
  const [svg, setSvg] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    async function render() {
      const { default: mermaid } = await import('mermaid')
      const dark = window.matchMedia('(prefers-color-scheme: dark)').matches
      mermaid.initialize({ startOnLoad: false, theme: dark ? 'dark' : 'neutral', securityLevel: 'strict' })
      try {
        const result = await mermaid.render(`mermaid-${id}`, code)
        if (!cancelled) setSvg(result.svg)
      } catch (error) {
        console.error('Mermaid diagram failed to render; showing source instead.', error)
      }
    }
    void render()
    return () => {
      cancelled = true
    }
  }, [code, id])

  if (svg) {
    return (
      <figure
        className="my-6 overflow-x-auto [&_svg]:mx-auto [&_svg]:h-auto [&_svg]:max-w-full"
        dangerouslySetInnerHTML={{ __html: svg }}
      />
    )
  }
  return (
    <pre>
      <code className="language-mermaid">{code}</code>
    </pre>
  )
}
