import type { Metadata } from 'next'
import { markdownTwinPath } from './markdown'
import { lastModified } from './posts'
import { absoluteUrl, site } from './site'
import type { PostMeta } from './types'

export const OG_IMAGE = { width: 1200, height: 630 }

export const feedAlternates = {
  'application/rss+xml': [{ url: '/feed.xml', title: `${site.name} — RSS` }],
  'application/atom+xml': [{ url: '/atom.xml', title: `${site.name} — Atom` }],
  'application/feed+json': [{ url: '/feed.json', title: `${site.name} — JSON Feed` }],
}

type PageInput = { title?: string; description?: string; path: string }

export function pageMetadata({ title, description, path }: PageInput): Metadata {
  const desc = description ?? site.description
  return {
    ...(title ? { title } : {}),
    description: desc,
    alternates: { canonical: path, types: { ...feedAlternates } },
    openGraph: {
      type: 'website',
      url: absoluteUrl(site, path),
      siteName: site.name,
      title: title ?? site.name,
      description: desc,
    },
    twitter: { card: 'summary', title: title ?? site.name, description: desc },
  }
}

export function postMetadata(post: PostMeta): Metadata {
  const path = `/posts/${post.slug}`
  const image = { url: `${path}/og`, ...OG_IMAGE, alt: post.title }
  return {
    title: post.title,
    description: post.description,
    alternates: {
      canonical: path,
      types: { ...feedAlternates, 'text/markdown': markdownTwinPath(post.slug) },
    },
    openGraph: {
      type: 'article',
      url: absoluteUrl(site, path),
      siteName: site.name,
      title: post.title,
      description: post.description,
      publishedTime: post.publishedAt,
      modifiedTime: lastModified(post),
      authors: [absoluteUrl(site, '/about')],
      tags: post.tags,
      images: [image],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.description,
      images: [image.url],
    },
    ...(post.draft ? { robots: { index: false, follow: false } } : {}),
  }
}
