import { markdownTwin, markdownTwinPath } from './markdown'
import { publishedPosts } from './posts'
import { absoluteUrl, type SiteConfig } from './site'
import type { PostContent, PostMeta } from './types'

export function llmsTxt(site: SiteConfig, posts: PostMeta[]): string {
  const postLines = publishedPosts(posts).map(
    (post) => `- [${post.title}](${absoluteUrl(site, markdownTwinPath(post.slug))}): ${post.description}`,
  )
  const lines = [
    `# ${site.name}`,
    '',
    `> ${site.description}`,
    '',
    `${site.author.bio} Every post is available as HTML and as raw markdown: append \`.md\` to a post URL or request it with \`Accept: text/markdown\`.`,
    '',
    '## Posts',
    '',
    ...(postLines.length > 0 ? [...postLines, ''] : []),
    '## About',
    '',
    `- [About ${site.author.name}](${absoluteUrl(site, '/about')}): bio, roles and links`,
    '',
    '## Feeds',
    '',
    `- [RSS](${absoluteUrl(site, '/feed.xml')})`,
    `- [Atom](${absoluteUrl(site, '/atom.xml')})`,
    `- [JSON Feed](${absoluteUrl(site, '/feed.json')})`,
    '',
  ]
  return lines.join('\n')
}

export function llmsFullTxt(site: SiteConfig, posts: PostContent[]): string {
  return publishedPosts(posts)
    .map((post) => markdownTwin(site, post).trimEnd())
    .join('\n\n---\n\n')
    .concat('\n')
}
