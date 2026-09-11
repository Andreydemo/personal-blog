'use client'

import { useRef, useState, type HTMLAttributes } from 'react'

/** A fenced code block with a copy button. The <pre> itself is server-rendered; only the button needs the client. */
export function CodeBlock({ children, ...rest }: HTMLAttributes<HTMLPreElement>) {
  const ref = useRef<HTMLPreElement>(null)
  const [copied, setCopied] = useState(false)

  async function copy() {
    const text = ref.current?.innerText ?? ''
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // Clipboard unavailable (insecure context or permission denied); the text is still selectable.
    }
  }

  return (
    <div className="relative [&_pre]:pr-16">
      <pre ref={ref} {...rest}>
        {children}
      </pre>
      <button
        type="button"
        onClick={copy}
        aria-label="Copy code"
        className="absolute right-2 top-2 rounded border border-zinc-500/40 bg-zinc-800/80 px-2 py-0.5 text-xs text-zinc-200 opacity-70 hover:opacity-100 focus:opacity-100"
      >
        {copied ? 'Copied' : 'Copy'}
      </button>
    </div>
  )
}
