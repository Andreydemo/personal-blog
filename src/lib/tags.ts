/**
 * The tag registry. Every tag a post may carry is listed here; the content
 * schema rejects anything else. Sections are broad and appear in the site nav;
 * topics are specific. A post needs at least one section.
 */
export type TagKind = 'section' | 'topic'
export type TagInfo = { tag: string; label: string; kind: TagKind; description: string }

export const TAGS: TagInfo[] = [
  { tag: 'engineering', label: 'Engineering', kind: 'section', description: 'Systems, code and the trade-offs behind them.' },
  { tag: 'ai', label: 'AI', kind: 'section', description: 'Working with language models: agents, prompting, tooling.' },
  { tag: 'opinions', label: 'Opinions', kind: 'section', description: 'Takes on tech, work and the industry.' },
  { tag: 'politics', label: 'Politics', kind: 'section', description: 'Civic and political writing, kept apart from the rest.' },
  { tag: 'security', label: 'Security', kind: 'topic', description: 'Vulnerabilities, guards and the mistakes behind them.' },
  { tag: 'seo', label: 'SEO', kind: 'topic', description: 'Search and AI-crawler visibility.' },
  { tag: 'meta', label: 'Meta', kind: 'topic', description: 'About this blog itself.' },
  { tag: 'agents', label: 'Agents', kind: 'topic', description: 'Agents as components: runtimes, tools, orchestration.' },
  { tag: 'mcp', label: 'MCP', kind: 'topic', description: 'Model Context Protocol: exposing tools to models.' },
  { tag: 'prompting', label: 'Prompting', kind: 'topic', description: 'Getting better answers out of a model.' },
  { tag: 'chatgpt', label: 'ChatGPT', kind: 'topic', description: "OpenAI's ChatGPT: models, plans, features." },
  { tag: 'claude', label: 'Claude', kind: 'topic', description: "Anthropic's Claude: models, plans, features." },
]

const byTag = new Map(TAGS.map((t) => [t.tag, t]))

export const sectionTags = TAGS.filter((t) => t.kind === 'section').map((t) => t.tag)
export const topicTags = TAGS.filter((t) => t.kind === 'topic').map((t) => t.tag)

export function tagInfo(tag: string): TagInfo | undefined {
  return byTag.get(tag)
}

export function isKnownTag(tag: string): boolean {
  return byTag.has(tag)
}

export function tagLabel(tag: string): string {
  return byTag.get(tag)?.label ?? tag
}

/** Problems with a post's tag list, as messages; empty when the list is valid. */
export function validateTags(tags: string[]): string[] {
  const problems = tags
    .filter((tag) => !isKnownTag(tag))
    .map((tag) => `unknown tag "${tag}"; add it to src/lib/tags.ts or pick an existing one`)
  if (problems.length === 0 && !tags.some((tag) => sectionTags.includes(tag))) {
    problems.push(`tags must include a section tag: ${sectionTags.join(', ')}`)
  }
  return problems
}
