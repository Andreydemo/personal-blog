/**
 * Given the children of an MDX `<pre>`, returns the Mermaid source when the
 * child is a `<code className="language-mermaid">` element, else null.
 */
export function mermaidSource(node: unknown): string | null {
  if (!node || typeof node !== 'object') return null
  const props = (node as { props?: { className?: unknown; children?: unknown } }).props
  if (!props || typeof props.className !== 'string' || typeof props.children !== 'string') return null
  if (!props.className.split(/\s+/).includes('language-mermaid')) return null
  return props.children.replace(/\n$/, '')
}
