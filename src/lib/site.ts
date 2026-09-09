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
    jobTitle: '',
    employer: '',
    image: '',
  },
  social: {
    github: 'https://github.com/Andreydemo',
    linkedin: '',
    x: '',
  },
  featuredTags: ['engineering', 'opinions', 'politics'],
  verification: { google: '', bing: '' },
  giscus: { repo: '', repoId: '', category: '', categoryId: '' },
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
  return Object.values(config.social).filter((url) => url.length > 0)
}

/** "/posts/x" → "https://andrii.korkoshko.com/posts/x" */
export function absoluteUrl(config: SiteConfig, path: string): string {
  return new URL(path, config.url).toString()
}
