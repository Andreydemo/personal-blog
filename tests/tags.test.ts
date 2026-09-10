import { describe, expect, it } from 'vitest'
import { KEBAB } from '../velite.config'
import { TAGS, isKnownTag, sectionTags, tagInfo, tagLabel, topicTags, validateTags } from '@/lib/tags'

describe('tag registry', () => {
  it('lists the four sections and only kebab-case tags with descriptions', () => {
    expect(sectionTags).toEqual(['engineering', 'ai', 'opinions', 'politics'])
    for (const t of TAGS) {
      expect(t.tag).toMatch(KEBAB)
      expect(t.description.length).toBeGreaterThan(10)
      expect(['section', 'topic']).toContain(t.kind)
    }
    expect(topicTags).toContain('security')
    expect(topicTags).not.toContain('engineering')
  })

  it('knows its tags and labels them', () => {
    expect(isKnownTag('ai')).toBe(true)
    expect(isKnownTag('llm')).toBe(false)
    expect(tagLabel('ai')).toBe('AI')
    expect(tagLabel('mcp')).toBe('MCP')
    expect(tagLabel('unknown-thing')).toBe('unknown-thing')
    expect(tagInfo('security')?.kind).toBe('topic')
  })

  it('validates a post tag list: known tags and at least one section', () => {
    expect(validateTags(['engineering', 'security'])).toEqual([])
    expect(validateTags(['security'])).toEqual(['tags must include a section tag: engineering, ai, opinions, politics'])
    expect(validateTags(['engineering', 'llm'])).toEqual(['unknown tag "llm"; add it to src/lib/tags.ts or pick an existing one'])
  })
})
