import { describe, expect, it } from 'vitest'
import { MIN_SECTIONS, showToc } from '../src/lib/toc'

const entry = (title: string) => ({ title, url: `#${title.toLowerCase().replace(/\s+/g, '-')}`, items: [] })

describe('showToc', () => {
  it('hides the contents block for short posts', () => {
    expect(showToc([entry('One'), entry('Two')])).toBe(false)
    expect(showToc([])).toBe(false)
  })

  it('shows the contents block at the section threshold', () => {
    const toc = Array.from({ length: MIN_SECTIONS }, (_, i) => entry(`Section ${i}`))
    expect(showToc(toc)).toBe(true)
    expect(showToc(toc.slice(1))).toBe(false)
  })

  it('counts only top-level sections, not nested headings', () => {
    const nested = { ...entry('Parent'), items: [entry('a'), entry('b'), entry('c'), entry('d'), entry('e')] }
    expect(showToc([nested])).toBe(false)
  })
})
