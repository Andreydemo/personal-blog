import type {
  BlogPosting,
  BreadcrumbList,
  PersonLeaf,
  ProfilePage,
  WebSite,
  WithContext,
} from 'schema-dts'
import { lastModified } from './posts'
import { absoluteUrl, personId, sameAs, type SiteConfig } from './site'
import type { PostMeta } from './types'

const CONTEXT = 'https://schema.org' as const

function personNode(site: SiteConfig): PersonLeaf {
  const { author } = site
  return {
    '@type': 'Person',
    '@id': personId(site),
    name: author.name,
    url: absoluteUrl(site, '/about'),
    ...(author.image ? { image: absoluteUrl(site, author.image) } : {}),
    ...(author.jobTitle ? { jobTitle: author.jobTitle } : {}),
    ...(author.employer ? { worksFor: { '@type': 'Organization', name: author.employer } } : {}),
    sameAs: sameAs(site),
  }
}

export function person(site: SiteConfig): WithContext<PersonLeaf> {
  return { '@context': CONTEXT, ...personNode(site) }
}

export function profilePage(site: SiteConfig): WithContext<ProfilePage> {
  return { '@context': CONTEXT, '@type': 'ProfilePage', mainEntity: personNode(site) }
}

export function webSite(site: SiteConfig): WithContext<WebSite> {
  return {
    '@context': CONTEXT,
    '@type': 'WebSite',
    name: site.name,
    url: site.url,
    description: site.description,
    inLanguage: 'en',
    author: { '@id': personId(site) },
    publisher: { '@id': personId(site) },
  }
}

export function postUrl(site: SiteConfig, post: PostMeta): string {
  return absoluteUrl(site, `/posts/${post.slug}`)
}

export function blogPosting(site: SiteConfig, post: PostMeta): WithContext<BlogPosting> {
  const url = postUrl(site, post)
  return {
    '@context': CONTEXT,
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.description,
    url,
    mainEntityOfPage: url,
    datePublished: post.publishedAt,
    dateModified: lastModified(post),
    keywords: post.tags,
    wordCount: post.metadata.wordCount,
    image: `${url}/og`,
    inLanguage: 'en',
    author: { '@id': personId(site) },
    publisher: { '@id': personId(site) },
  }
}

export function breadcrumbs(site: SiteConfig, post: PostMeta): WithContext<BreadcrumbList> {
  return {
    '@context': CONTEXT,
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: { '@id': site.url } },
      { '@type': 'ListItem', position: 2, name: post.title, item: { '@id': postUrl(site, post) } },
    ],
  }
}
