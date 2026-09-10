import { sectionTags } from './tags'
export type SiteConfig = {
  name: string
  url: string
  tagline: string
  description: string
  author: {
    name: string
    bio: string
    jobTitle: string
    employer: string
    /** Site-relative path under public/, e.g. "/images/andrii.jpg"; empty = none */
    image: string
  }
  social: { github: string; linkedin: string; x: string }
  /** Additional identity URLs: included in Person sameAs and listed on About. */
  profiles: { label: string; href: string }[]
  featuredTags: string[]
  verification: { google: string; bing: string }
  giscus: { repo: string; repoId: string; category: string; categoryId: string }
  crawlers: string[]
}

export const site: SiteConfig = {
  name: 'Andrii Korkoshko',
  url: 'https://andrii.korkoshko.com',
  tagline: 'Engineering, opinions, and the occasional detour',
  description:
    'Personal blog of Andrii Korkoshko: software engineering, opinions on tech and work, and anything else worth writing down.',
  author: {
    name: 'Andrii Korkoshko',
    bio: 'Software engineer. I write about building systems, working in tech, and whatever else is worth the words.',
    jobTitle: 'Member of Technical Staff',
    employer: 'Starbridge',
    image: '',
  },
  social: {
    github: 'https://github.com/Andreydemo',
    linkedin: 'https://www.linkedin.com/in/andrii-korkoshko/',
    x: '',
  },
  profiles: [
    { label: 'ORCID', href: 'https://orcid.org/0000-0002-4567-5584' },
    { label: 'Google Scholar', href: 'https://scholar.google.com/citations?user=dPLg93QAAAAJ' },
    { label: 'Semantic Scholar', href: 'https://www.semanticscholar.org/author/73742191' },
    { label: 'OpenAlex', href: 'https://openalex.org/A5051435817' },
    { label: 'AD Scientific Index', href: 'https://adscientificindex.com/scientist/andrii-korkoshko/5051663/' },
  ],
  featuredTags: sectionTags,
  verification: { google: '', bing: '' },
  giscus: {
    repo: 'Andreydemo/personal-blog',
    repoId: 'R_kgDOUT_xJA',
    category: 'Announcements',
    categoryId: 'DIC_kwDOUT_xJM4DFQ2L',
  },
  crawlers: [
    'Googlebot',
    'Bingbot',
    'GPTBot',
    'OAI-SearchBot',
    'ChatGPT-User',
    'ClaudeBot',
    'Claude-SearchBot',
    'Claude-User',
    'anthropic-ai',
    'PerplexityBot',
    'Perplexity-User',
    'Google-Extended',
    'Applebot',
    'Applebot-Extended',
    'Amazonbot',
    'CCBot',
    'DuckAssistBot',
    'Meta-ExternalAgent',
    'YouBot',
  ],
}

export function personId(config: SiteConfig): string {
  return `${config.url}/about#person`
}

export function sameAs(config: SiteConfig): string[] {
  return [
    ...Object.values(config.social).filter((url) => url.length > 0),
    ...config.profiles.map((p) => p.href),
  ]
}

/** "/posts/x" → "https://andrii.korkoshko.com/posts/x" */
export function absoluteUrl(config: SiteConfig, path: string): string {
  return new URL(path, config.url).toString()
}
