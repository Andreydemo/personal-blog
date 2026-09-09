# Personal Blog (Phases 1–2) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship `https://andrii.korkoshko.com` as a static Next.js 16 blog with an AI/search visibility layer (markdown twins, llms.txt, JSON-LD, feeds, robots, sitemap, IndexNow), and redirect `korkoshko.com` to it.

**Architecture:** Posts are MDX files in `content/posts/`, validated and compiled by Velite into `.velite/` at build time. Next.js App Router prerenders every page and every "route handler" (feeds, llms, markdown twins) as static output; the only request-time logic is Vercel routing (rewrites, redirects, headers). All business logic lives in pure functions under `src/lib/` that take plain data, so they are unit-tested without a build.

**Tech Stack:** Next.js 16.3.x, React 19, TypeScript 5.9.x, pnpm 9, Node 22, Tailwind CSS v4 + `@tailwindcss/typography`, Velite 0.4.x, `feed` 6, `schema-dts`, `@vercel/analytics`, `@giscus/react`, vitest 5, tsx, npm-run-all2, GitHub Actions, Vercel Hobby, GoDaddy DNS.

**Spec:** `docs/superpowers/specs/2026-09-09-personal-blog-design.md` — read it first; every task below cites the section it implements.

## Global Constraints

- Primary URL is `https://andrii.korkoshko.com`. Person `@id` is `https://andrii.korkoshko.com/about#person`. No trailing slashes anywhere; canonical URLs are absolute.
- Versions: `next@16.3.x`, `typescript@~5.9.3` (NOT TypeScript 7), `velite@0.4.x`, `vitest@5`, Node 22, pnpm 9. `package.json` carries `"packageManager": "pnpm@9.15.9"`.
- Frontmatter rules (spec §5.1): `title` 1–110 chars; `description` 50–160 chars; `publishedAt` ISO date; optional `updatedAt` ≥ `publishedAt`; `tags` 1–6 lowercase kebab-case; `draft` default false; slug = file name, kebab-case. Invalid content must fail the build (`velite --strict` in the build and typecheck scripts; dev watch stays lenient).
- Drafts (spec §5.2): excluded from listings, tag pages, feeds, sitemap, `llms*.txt` and IndexNow; still built at `/posts/<slug>` and `/posts/<slug>.md`, and marked `noindex`.
- Home shows the latest 10 published posts; feeds carry the newest 50 with full HTML.
- Crawler allow-list (spec §7.6), exact strings: `Googlebot, Bingbot, GPTBot, OAI-SearchBot, ChatGPT-User, ClaudeBot, Claude-SearchBot, Claude-User, anthropic-ai, PerplexityBot, Perplexity-User, Google-Extended, Applebot, Applebot-Extended, Amazonbot, CCBot, DuckAssistBot, Meta-ExternalAgent, YouBot`.
- All library code is pure and takes `site: SiteConfig` and post data as parameters; only `src/lib/content.ts` and files under `src/app/` import the Velite output (`#site/content`).
- Run commands from the repo root. Commit after every task. Every commit message ends with these two trailer lines:
  `Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>` and
  `Claude-Session: https://claude.ai/code/session_015aiFug8n6PdHYPbSkkZzTS`.
- Deviations from the spec tree, already agreed: the MDX component map lives at `src/components/mdx-components.tsx`; OG images are served by a route handler at `/posts/<slug>/og` instead of `opengraph-image.tsx`; breadcrumbs are Home → post title; an unknown slug returns Next's standard 404 page.

## File structure

| Path | Responsibility |
|---|---|
| `content/posts/*.mdx` | Posts. Slug = file name. |
| `content/README.md` | Editorial conventions for the author. |
| `velite.config.ts` | Post schema + output config. Exports `posts` collection for the fixture test. |
| `src/lib/types.ts` | `PostMeta`, `PostContent` — the shape every lib function accepts. |
| `src/lib/site.ts` | `SiteConfig` type, `site` value, `personId`, `sameAs`, `absoluteUrl`. |
| `src/lib/dates.ts` | `formatDate`, `isoDay`. |
| `src/lib/posts.ts` | Pure post queries: `publishedPosts`, `sortNewestFirst`, `postsByTag`, `allTags`, `findPost`, `lastModified`. |
| `src/lib/content.ts` | The only importer of `#site/content`; exports `allPosts`. |
| `src/lib/jsonld.ts` | JSON-LD builders. |
| `src/lib/metadata.ts` | `pageMetadata`, `postMetadata`, `feedAlternates`. |
| `src/lib/markdown.ts` | `markdownTwin`, `markdownTwinPath`. |
| `src/lib/feeds.ts` | `buildFeed`. |
| `src/lib/llms.ts` | `llmsTxt`, `llmsFullTxt`. |
| `src/lib/robots.ts` | `robotsRules`. |
| `src/lib/sitemap.ts` | `sitemapEntries`. |
| `src/components/*.tsx` | Presentational components (header, footer, post card/list, byline, tag list, MDX renderer, JSON-LD script, comments). |
| `src/app/**` | Routes (see spec §6). |
| `scripts/smoke.ts` | Post-build checks against `next start`. |
| `scripts/indexnow-lib.ts`, `scripts/indexnow.ts` | IndexNow pure helpers + CLI entry. |
| `tests/**/*.test.ts`, `tests/helpers.ts`, `tests/fixtures/invalid/**` | vitest suites and the malformed-content fixture. |
| `.github/workflows/ci.yml`, `.github/workflows/indexnow.yml` | CI and indexing push. |

---

## Phase 1 — live site

### Task 1: Scaffold Next.js 16, pin TypeScript 5, add vitest

**Files:**
- Create (via CLI): `package.json`, `tsconfig.json`, `next.config.ts`, `eslint.config.mjs`, `postcss.config.mjs`, `src/app/*`
- Create: `vitest.config.ts`, `src/lib/dates.ts`, `tests/dates.test.ts`, `README.md`, `.gitignore`
- Modify: `package.json` (scripts, packageManager), `eslint.config.mjs` (ignores)

**Interfaces:**
- Produces: `formatDate(iso: string): string` → `"Sep 9, 2026"`; `isoDay(iso: string): string` → `"2026-09-09"`. Test alias `@` → `src/`.

- [ ] **Step 1: Scaffold in place (the directory already holds `.git`, `.idea`, `docs`, `.gitignore`, which create-next-app tolerates)**

```bash
pnpm dlx create-next-app@16.3.4 . --ts --tailwind --eslint --app --src-dir --import-alias "@/*" --use-pnpm --disable-git --yes
```

Expected: a `src/app` tree, `package.json` with `next@16.3.4`, `pnpm-lock.yaml`. If it prompts for the React Compiler, answer No.

- [ ] **Step 2: Pin TypeScript 5 and add dev tooling**

```bash
pnpm add -D typescript@~5.9.3 vitest tsx npm-run-all2
pnpm pkg set packageManager=pnpm@9.15.9
node -e "console.log(require('./node_modules/typescript/package.json').version)"
```

Expected: prints `5.9.x`.

- [ ] **Step 3: Replace `.gitignore` with**

```gitignore
# dependencies
node_modules/
# next.js
.next/
out/
next-env.d.ts
# velite output (regenerated at build)
.velite/
public/static/
tests/fixtures/**/.velite/
tests/fixtures/**/static/
# env
.env*
!.env.example
# misc
.DS_Store
*.pem
npm-debug.log*
.vercel
.idea/
*.tsbuildinfo
```

- [ ] **Step 4: Set scripts in `package.json`** (replace the whole `"scripts"` block)

```json
"scripts": {
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "eslint .",
  "typecheck": "tsc --noEmit",
  "test": "vitest run"
}
```

- [ ] **Step 5: Add `.velite/**`, `public/static/**` and `tests/fixtures/**/.velite/**` to the ignore list in `eslint.config.mjs`.** The generated file ends with a `globalIgnores([...])` call listing `.next/**`, `out/**`, `build/**`, `next-env.d.ts`; append the three entries to that array.

- [ ] **Step 6: Create `vitest.config.ts`**

```ts
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  test: {
    include: ['tests/**/*.test.ts'],
    environment: 'node',
  },
})
```

- [ ] **Step 7: Write the failing test `tests/dates.test.ts`**

```ts
import { describe, expect, it } from 'vitest'
import { formatDate, isoDay } from '@/lib/dates'

describe('dates', () => {
  it('formats an ISO timestamp as a readable UTC date', () => {
    expect(formatDate('2026-09-09T00:00:00.000Z')).toBe('Sep 9, 2026')
  })

  it('keeps the calendar day stable regardless of local timezone', () => {
    expect(formatDate('2026-12-31T23:30:00.000Z')).toBe('Dec 31, 2026')
  })

  it('returns the YYYY-MM-DD part', () => {
    expect(isoDay('2026-09-09T00:00:00.000Z')).toBe('2026-09-09')
  })
})
```

- [ ] **Step 8: Run it to verify it fails**

Run: `pnpm test`
Expected: FAIL — cannot resolve `@/lib/dates`.

- [ ] **Step 9: Create `src/lib/dates.ts`**

```ts
const formatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
  timeZone: 'UTC',
})

/** "2026-09-09T00:00:00.000Z" → "Sep 9, 2026" (always UTC, so builds are deterministic). */
export function formatDate(iso: string): string {
  return formatter.format(new Date(iso))
}

/** "2026-09-09T00:00:00.000Z" → "2026-09-09" */
export function isoDay(iso: string): string {
  return iso.slice(0, 10)
}
```

- [ ] **Step 10: Run tests, lint, typecheck, build**

Run: `pnpm test && pnpm lint && pnpm typecheck && pnpm build`
Expected: 3 tests pass; lint clean; build succeeds and lists `/` as static.

- [ ] **Step 11: Replace `README.md`**

```markdown
# andrii.korkoshko.com

Personal blog of Andrii Korkoshko. Next.js 16, MDX in `content/posts/`, deployed on Vercel.

- `pnpm dev` — run locally
- `pnpm build` — production build (content is validated first)
- `pnpm test` — unit tests
- `pnpm smoke` — post-build checks against a local server

Design: `docs/superpowers/specs/2026-09-09-personal-blog-design.md`.
Writing guide: `content/README.md`.
```

- [ ] **Step 12: Commit**

```bash
git add -A
git commit -m "chore: scaffold Next.js 16 app with vitest and date helpers" -m "Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>" -m "Claude-Session: https://claude.ai/code/session_015aiFug8n6PdHYPbSkkZzTS"
```

---

### Task 2: Content layer — Velite schema, site config, post queries, seed posts

Implements spec §5 (content model, drafts, conventions) and the "posts.ts" and "content validation" tests in §10.

**Files:**
- Create: `velite.config.ts`, `src/lib/types.ts`, `src/lib/site.ts`, `src/lib/posts.ts`, `src/lib/content.ts`, `content/README.md`, `content/posts/hello-world.mdx`, `content/posts/how-this-blog-is-built-for-ai-crawlers.mdx`, `tests/helpers.ts`, `tests/posts.test.ts`, `tests/content-schema.test.ts`, `tests/fixtures/invalid/velite.config.ts`, `tests/fixtures/invalid/content/posts/bad-post.mdx`
- Modify: `tsconfig.json` (paths), `package.json` (scripts)

**Interfaces:**
- Produces:
  - `type PostMeta = { slug; title; description; publishedAt; updatedAt?; tags; draft; metadata: { readingTime; wordCount } }`, `type PostContent = PostMeta & { raw: string; html: string }`
  - `type SiteConfig`, `const site: SiteConfig`, `personId(site): string`, `sameAs(site): string[]`, `absoluteUrl(site, path): string`
  - `sortNewestFirst(posts)`, `publishedPosts(posts)`, `postsByTag(posts, tag)`, `allTags(posts): { tag: string; count: number }[]`, `findPost(posts, slug)`, `lastModified(post): string`
  - `allPosts` from `src/lib/content.ts` (Velite `Post[]`, structurally a `PostContent & { code: string; cover?: Image; toc }`)
  - `tests/helpers.ts`: `makePost(overrides?: Partial<PostContent>): PostContent`

- [ ] **Step 1: Install Velite**

```bash
pnpm add -D velite
```

- [ ] **Step 2: Create `velite.config.ts`**

```ts
import { defineCollection, defineConfig, s } from 'velite'

export const KEBAB = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

export const posts = defineCollection({
  name: 'Post',
  pattern: 'posts/**/*.mdx',
  schema: s
    .object({
      title: s.string().min(1).max(110),
      description: s.string().min(50).max(160),
      publishedAt: s.isodate(),
      updatedAt: s.isodate().optional(),
      tags: s
        .array(s.string().regex(KEBAB, 'tags must be lowercase kebab-case'))
        .min(1)
        .max(6),
      draft: s.boolean().default(false),
      cover: s.image().optional(),
      path: s.path(),
      metadata: s.metadata(),
      raw: s.raw(),
      html: s.markdown(),
      code: s.mdx(),
      toc: s.toc(),
    })
    .transform(({ path, ...data }) => ({ ...data, slug: path.replace(/^posts\//, '') }))
    .superRefine((post, ctx) => {
      if (!KEBAB.test(post.slug)) {
        ctx.addIssue({
          code: 'custom',
          message: `slug "${post.slug}" must be lowercase kebab-case; rename the file`,
        })
      }
      if (post.updatedAt && post.updatedAt < post.publishedAt) {
        ctx.addIssue({ code: 'custom', message: 'updatedAt must not be before publishedAt' })
      }
    }),
})

export default defineConfig({
  root: 'content',
  output: {
    data: '.velite',
    assets: 'public/static',
    base: '/static/',
    name: '[name]-[hash:6].[ext]',
    clean: true,
  },
  collections: { posts },
})
```

- [ ] **Step 3: Add the Velite path alias to `tsconfig.json`** — inside `compilerOptions.paths`, next to `"@/*"`:

```json
"#site/content": ["./.velite"]
```

- [ ] **Step 4: Update `package.json` scripts** (replace the block)

```json
"scripts": {
  "dev": "run-p dev:content dev:next",
  "dev:content": "velite --watch",
  "dev:next": "next dev",
  "build": "run-s build:content build:next",
  "build:content": "velite --clean --strict",
  "build:next": "next build",
  "start": "next start",
  "lint": "eslint .",
  "typecheck": "velite --strict && tsc --noEmit",
  "test": "vitest run"
}
```

- [ ] **Step 5: Create `src/lib/types.ts`**

```ts
export type PostMeta = {
  slug: string
  title: string
  description: string
  /** ISO timestamp, e.g. "2026-09-09T00:00:00.000Z" */
  publishedAt: string
  updatedAt?: string
  tags: string[]
  draft: boolean
  metadata: { readingTime: number; wordCount: number }
}

export type PostContent = PostMeta & {
  /** Markdown source without frontmatter */
  raw: string
  /** Markdown compiled to HTML (used by feeds) */
  html: string
}
```

- [ ] **Step 6: Create `src/lib/site.ts`** (author fills the empty strings later; empty values are omitted everywhere they are used)

```ts
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
```

- [ ] **Step 7: Create `tests/helpers.ts`**

```ts
import type { PostContent } from '@/lib/types'

let counter = 0

export function makePost(overrides: Partial<PostContent> = {}): PostContent {
  counter += 1
  return {
    slug: `post-${counter}`,
    title: `Post ${counter}`,
    description: 'A description that is comfortably longer than fifty characters for schema.',
    publishedAt: '2026-01-01T00:00:00.000Z',
    tags: ['engineering'],
    draft: false,
    metadata: { readingTime: 3, wordCount: 600 },
    raw: `# Heading\n\nBody of post ${counter}.`,
    html: `<h1>Heading</h1>\n<p>Body of post ${counter}.</p>`,
    ...overrides,
  }
}
```

- [ ] **Step 8: Write the failing tests `tests/posts.test.ts`**

```ts
import { describe, expect, it } from 'vitest'
import { allTags, findPost, lastModified, postsByTag, publishedPosts, sortNewestFirst } from '@/lib/posts'
import { makePost } from './helpers'

const older = makePost({ slug: 'older', publishedAt: '2026-01-01T00:00:00.000Z', tags: ['engineering'] })
const newer = makePost({ slug: 'newer', publishedAt: '2026-03-01T00:00:00.000Z', tags: ['engineering', 'opinions'] })
const draft = makePost({ slug: 'draft', publishedAt: '2026-04-01T00:00:00.000Z', draft: true, tags: ['politics'] })
const all = [older, draft, newer]

describe('sortNewestFirst', () => {
  it('orders by publishedAt descending without mutating input', () => {
    const sorted = sortNewestFirst(all)
    expect(sorted.map((p) => p.slug)).toEqual(['draft', 'newer', 'older'])
    expect(all[0].slug).toBe('older')
  })

  it('breaks ties by slug for deterministic output', () => {
    const a = makePost({ slug: 'a', publishedAt: '2026-01-01T00:00:00.000Z' })
    const b = makePost({ slug: 'b', publishedAt: '2026-01-01T00:00:00.000Z' })
    expect(sortNewestFirst([b, a]).map((p) => p.slug)).toEqual(['a', 'b'])
  })
})

describe('publishedPosts', () => {
  it('drops drafts and sorts newest first', () => {
    expect(publishedPosts(all).map((p) => p.slug)).toEqual(['newer', 'older'])
  })
})

describe('postsByTag', () => {
  it('returns published posts carrying the tag', () => {
    expect(postsByTag(all, 'engineering').map((p) => p.slug)).toEqual(['newer', 'older'])
    expect(postsByTag(all, 'politics')).toEqual([])
  })
})

describe('allTags', () => {
  it('counts tags across published posts only, most used first then alphabetical', () => {
    expect(allTags(all)).toEqual([
      { tag: 'engineering', count: 2 },
      { tag: 'opinions', count: 1 },
    ])
  })
})

describe('findPost', () => {
  it('finds drafts too, because draft pages are still built', () => {
    expect(findPost(all, 'draft')?.slug).toBe('draft')
    expect(findPost(all, 'missing')).toBeUndefined()
  })
})

describe('lastModified', () => {
  it('prefers updatedAt over publishedAt', () => {
    expect(lastModified(makePost({ publishedAt: '2026-01-01T00:00:00.000Z' }))).toBe('2026-01-01T00:00:00.000Z')
    expect(
      lastModified(makePost({ publishedAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-02-01T00:00:00.000Z' })),
    ).toBe('2026-02-01T00:00:00.000Z')
  })
})
```

- [ ] **Step 9: Run to verify failure**

Run: `pnpm test`
Expected: FAIL — cannot resolve `@/lib/posts`.

- [ ] **Step 10: Create `src/lib/posts.ts`**

```ts
import type { PostMeta } from './types'

export function sortNewestFirst<T extends PostMeta>(posts: T[]): T[] {
  return [...posts].sort(
    (a, b) => b.publishedAt.localeCompare(a.publishedAt) || a.slug.localeCompare(b.slug),
  )
}

export function publishedPosts<T extends PostMeta>(posts: T[]): T[] {
  return sortNewestFirst(posts.filter((post) => !post.draft))
}

export function postsByTag<T extends PostMeta>(posts: T[], tag: string): T[] {
  return publishedPosts(posts).filter((post) => post.tags.includes(tag))
}

export function allTags(posts: PostMeta[]): { tag: string; count: number }[] {
  const counts = new Map<string, number>()
  for (const post of publishedPosts(posts)) {
    for (const tag of post.tags) counts.set(tag, (counts.get(tag) ?? 0) + 1)
  }
  return [...counts]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag))
}

export function findPost<T extends PostMeta>(posts: T[], slug: string): T | undefined {
  return posts.find((post) => post.slug === slug)
}

export function lastModified(post: PostMeta): string {
  return post.updatedAt ?? post.publishedAt
}
```

- [ ] **Step 11: Run tests**

Run: `pnpm test`
Expected: PASS (dates + posts suites).

- [ ] **Step 12: Create `content/README.md`**

````markdown
# Writing posts

One file per post in `content/posts/<slug>.mdx`. The file name is the URL slug and never changes after publishing (rename = add a redirect in `next.config.ts`).

## Frontmatter

```yaml
---
title: "Short, specific title"                # 1–110 chars
description: "The answer or thesis in one or two sentences."   # 50–160 chars; shown as the lead paragraph and meta description
publishedAt: "2026-09-09"
updatedAt: "2026-09-12"                        # optional, on or after publishedAt
tags: [engineering, opinions]                  # 1–6, lowercase kebab-case
draft: false                                   # true = built but unlisted and noindex
cover: ./cover.jpg                             # optional, relative to this file
---
```

The build fails on invalid frontmatter. Run `pnpm typecheck` to validate content without building the site.

## Conventions

- No `#` H1 in the body; the title is the H1. Use `##`/`###`, phrased as questions or claims where natural.
- Posts over ~1200 words open with a **Key takeaways** bullet list.
- Prefer plain markdown. Custom MDX components are the exception, because the raw source is also served as `/posts/<slug>.md`, in feeds and in `llms-full.txt`.
- Link to sources and to related posts here.
- Publish by committing to `main`. Preview a draft on a Vercel preview deployment (those are `noindex`).
````

- [ ] **Step 13: Create the seed posts**

`content/posts/hello-world.mdx`:

```mdx
---
title: "Hello, world: why I started this blog"
description: "Why I started writing at andrii.korkoshko.com, what I plan to cover, and how you can follow along by RSS, feeds, or raw markdown."
publishedAt: "2026-09-09"
tags: [opinions, meta]
---

I have spent years building software and forming opinions about how it should be built. Most of that thinking lived in chat threads and pull request reviews. This blog is where it goes now.

## What to expect

- **Engineering.** Notes from the work: systems, trade-offs, and the mistakes worth writing down.
- **Opinions.** On tech, on work, and occasionally on politics. Posts are tagged, so you can pick what to read.
- **Anything else.** If it is worth a page, it will show up here.

## How to follow

Every post is available as HTML and as plain markdown: append `.md` to a post URL, or request the page with `Accept: text/markdown`. There are RSS, Atom and JSON feeds, and an `llms.txt` index for agents.
```

`content/posts/how-this-blog-is-built-for-ai-crawlers.mdx`:

```mdx
---
title: "How this blog is built for AI crawlers and search engines"
description: "A walkthrough of the markdown twins, llms.txt, structured data and IndexNow pings that make this site easy for AI and search crawlers to read."
publishedAt: "2026-09-09"
tags: [engineering, seo, meta]
---

This site is a static Next.js build. Nothing on it needs JavaScript to read, and every post exists in two forms: HTML for people and markdown for machines.

## Why markdown twins?

Agents that fetch pages pay for every token. A post's markdown twin is a fraction of the size of its HTML and carries the same words. You get it two ways:

- Append `.md` to any post URL, for example `/posts/hello-world.md`.
- Send `Accept: text/markdown` when requesting the normal URL.

The twin starts with a small YAML block: title, description, author, canonical URL, dates and tags.

## What else is here for crawlers

- `/llms.txt` lists every post with a one-line description, and `/llms-full.txt` concatenates all of them.
- Every page carries JSON-LD: a `Person` record on the About page, `BlogPosting` on each post, `WebSite` on the home page.
- Full-content RSS, Atom and JSON feeds.
- A `robots.txt` that explicitly allows the major search and AI crawlers.
- New and changed posts are pushed to IndexNow within minutes of deploying.

## What is deliberately missing

No cookie banner, no client-side rendering of content, no paywall, no scripts required to read a post. Comments load lazily and never block the text.
```

- [ ] **Step 14: Build the content and inspect the output**

Run: `pnpm build:content && node -e "const p=require('./.velite/posts.json'); for (const x of p) console.log(x.slug, x.draft, JSON.stringify(x.raw.slice(0,30)), x.metadata)"`
Expected: two lines, slugs `hello-world` and `how-this-blog-is-built-for-ai-crawlers`, `draft false`, `raw` starting with the first body sentence (not with `---`), metadata with numeric `readingTime` and `wordCount`.

- [ ] **Step 15: Create `src/lib/content.ts`**

```ts
import { posts } from '#site/content'

/** Every post, drafts included. Filter with helpers from ./posts. */
export const allPosts = posts
```

- [ ] **Step 16: Create the malformed-content fixture**

`tests/fixtures/invalid/velite.config.ts`:

```ts
import { defineConfig } from 'velite'
import { posts } from '../../../velite.config'

export default defineConfig({
  root: 'tests/fixtures/invalid/content',
  output: {
    data: 'tests/fixtures/invalid/.velite',
    assets: 'tests/fixtures/invalid/static',
    base: '/static/',
    name: '[name]-[hash:6].[ext]',
    clean: true,
  },
  collections: { posts },
})
```

`tests/fixtures/invalid/content/posts/bad-post.mdx` (description too short, tag not kebab-case):

```mdx
---
title: "Bad post"
description: "Too short."
publishedAt: "2026-01-01"
tags: [Not Kebab]
---

Body.
```

- [ ] **Step 17: Write `tests/content-schema.test.ts`**

```ts
import { execFileSync } from 'node:child_process'
import { describe, expect, it } from 'vitest'

describe('content schema', () => {
  it('fails the content build when a post has invalid frontmatter', () => {
    expect(() =>
      execFileSync(
        'node_modules/.bin/velite',
        ['--config', 'tests/fixtures/invalid/velite.config.ts', '--strict', '--silent'],
        { stdio: 'pipe' },
      ),
    ).toThrow()
  })

  it('passes on the real content', () => {
    expect(() =>
      execFileSync('node_modules/.bin/velite', ['--strict', '--silent'], { stdio: 'pipe' }),
    ).not.toThrow()
  })
})
```

- [ ] **Step 18: Run everything**

Run: `pnpm test && pnpm typecheck && pnpm lint`
Expected: all suites pass (the invalid fixture exits non-zero; the real content passes); `tsc` resolves `#site/content`.

- [ ] **Step 19: Commit**

```bash
git add -A
git commit -m "feat: add Velite content layer, site config, post queries and seed posts" -m "Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>" -m "Claude-Session: https://claude.ai/code/session_015aiFug8n6PdHYPbSkkZzTS"
```

---

### Task 3: Layout, typography, MDX rendering, home and post pages

Implements spec §6 rows `/` and `/posts/<slug>`, and the visible byline/date conventions in §5.3.

**Files:**
- Modify: `src/app/globals.css`, `src/app/layout.tsx`, `src/app/page.tsx`
- Create: `src/app/posts/[slug]/page.tsx`, `src/app/not-found.tsx`, `src/components/site-header.tsx`, `src/components/site-footer.tsx`, `src/components/mdx-content.tsx`, `src/components/mdx-components.tsx`, `src/components/byline.tsx`, `src/components/post-card.tsx`, `src/components/post-list.tsx`, `src/components/tag-list.tsx`
- Delete: `src/app/favicon.ico` stays; remove `public/*.svg` sample assets from create-next-app.

**Interfaces:**
- Consumes: `allPosts`, `publishedPosts`, `findPost`, `formatDate`, `isoDay`, `site`.
- Produces: `<MDXContent code={string} />`, `<Byline post={PostMeta} />`, `<PostList posts={PostMeta[]} />`, `<TagList tags={string[]} />`, `<SiteHeader />`, `<SiteFooter />`.

- [ ] **Step 1: Install the typography plugin and remove sample assets**

```bash
pnpm add @tailwindcss/typography
rm -f public/*.svg
```

- [ ] **Step 2: Replace `src/app/globals.css`**

```css
@import "tailwindcss";
@plugin "@tailwindcss/typography";

:root {
  color-scheme: light dark;
}

body {
  @apply bg-white text-zinc-900 antialiased dark:bg-zinc-950 dark:text-zinc-100;
}

a {
  @apply underline-offset-4;
}
```

- [ ] **Step 3: Create `src/components/site-header.tsx`**

```tsx
import Link from 'next/link'
import { site } from '@/lib/site'

export function SiteHeader() {
  return (
    <header className="border-b border-zinc-200 dark:border-zinc-800">
      <nav className="mx-auto flex max-w-3xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-4">
        <Link href="/" className="font-semibold">
          {site.name}
        </Link>
        {site.featuredTags.map((tag) => (
          <Link key={tag} href={`/tags/${tag}`} className="text-sm capitalize text-zinc-600 hover:underline dark:text-zinc-400">
            {tag}
          </Link>
        ))}
        <Link href="/about" className="text-sm text-zinc-600 hover:underline dark:text-zinc-400">
          About
        </Link>
      </nav>
    </header>
  )
}
```

- [ ] **Step 4: Create `src/components/site-footer.tsx`**

```tsx
import { site } from '@/lib/site'

export function SiteFooter() {
  const links = [
    { label: 'GitHub', href: site.social.github },
    { label: 'LinkedIn', href: site.social.linkedin },
    { label: 'X', href: site.social.x },
    { label: 'RSS', href: '/feed.xml' },
  ].filter((link) => link.href.length > 0)

  return (
    <footer className="border-t border-zinc-200 dark:border-zinc-800">
      <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-4 px-4 py-6 text-sm text-zinc-600 dark:text-zinc-400">
        <span>
          © {new Date().getUTCFullYear()} {site.author.name}
        </span>
        <ul className="flex gap-4">
          {links.map((link) => (
            <li key={link.label}>
              <a href={link.href} rel="me" className="hover:underline">
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  )
}
```

- [ ] **Step 5: Create `src/components/mdx-components.tsx`**

```tsx
import Link from 'next/link'
import type { AnchorHTMLAttributes } from 'react'

function Anchor({ href = '', children, ...rest }: AnchorHTMLAttributes<HTMLAnchorElement>) {
  const internal = href.startsWith('/') || href.startsWith('#')
  if (internal) {
    return (
      <Link href={href} {...rest}>
        {children}
      </Link>
    )
  }
  return (
    <a href={href} rel="noopener" {...rest}>
      {children}
    </a>
  )
}

export const mdxComponents = {
  a: Anchor,
}
```

- [ ] **Step 6: Create `src/components/mdx-content.tsx`**

```tsx
import * as runtime from 'react/jsx-runtime'
import { mdxComponents } from './mdx-components'

/** Renders Velite's compiled MDX (a function body string). Runs at build time only. */
export function MDXContent({ code }: { code: string }) {
  const Component = new Function(code)({ ...runtime }).default
  return <Component components={mdxComponents} />
}
```

- [ ] **Step 7: Create `src/components/byline.tsx`**

```tsx
import Link from 'next/link'
import { formatDate, isoDay } from '@/lib/dates'
import { site } from '@/lib/site'
import type { PostMeta } from '@/lib/types'

export function Byline({ post }: { post: PostMeta }) {
  const minutes = Math.max(1, Math.round(post.metadata.readingTime))
  return (
    <p className="text-sm text-zinc-600 dark:text-zinc-400">
      <Link href="/about" rel="author" className="hover:underline">
        {site.author.name}
      </Link>
      {' · '}
      <time dateTime={isoDay(post.publishedAt)}>{formatDate(post.publishedAt)}</time>
      {post.updatedAt && (
        <>
          {' · updated '}
          <time dateTime={isoDay(post.updatedAt)}>{formatDate(post.updatedAt)}</time>
        </>
      )}
      {' · '}
      {minutes} min read
    </p>
  )
}
```

- [ ] **Step 8: Create `src/components/tag-list.tsx`, `src/components/post-card.tsx`, `src/components/post-list.tsx`**

`tag-list.tsx`:

```tsx
import Link from 'next/link'

export function TagList({ tags }: { tags: string[] }) {
  return (
    <ul className="flex flex-wrap gap-2 text-sm">
      {tags.map((tag) => (
        <li key={tag}>
          <Link href={`/tags/${tag}`} className="rounded bg-zinc-100 px-2 py-0.5 hover:underline dark:bg-zinc-800">
            #{tag}
          </Link>
        </li>
      ))}
    </ul>
  )
}
```

`post-card.tsx`:

```tsx
import Link from 'next/link'
import { formatDate, isoDay } from '@/lib/dates'
import type { PostMeta } from '@/lib/types'
import { TagList } from './tag-list'

export function PostCard({ post }: { post: PostMeta }) {
  return (
    <article className="space-y-2">
      <h3 className="text-xl font-semibold">
        <Link href={`/posts/${post.slug}`} className="hover:underline">
          {post.title}
        </Link>
      </h3>
      <p className="text-zinc-600 dark:text-zinc-400">{post.description}</p>
      <div className="flex flex-wrap items-center gap-3 text-sm text-zinc-500">
        <time dateTime={isoDay(post.publishedAt)}>{formatDate(post.publishedAt)}</time>
        <TagList tags={post.tags} />
      </div>
    </article>
  )
}
```

`post-list.tsx`:

```tsx
import type { PostMeta } from '@/lib/types'
import { PostCard } from './post-card'

export function PostList({ posts }: { posts: PostMeta[] }) {
  if (posts.length === 0) return <p className="text-zinc-500">Nothing published yet.</p>
  return (
    <ul className="space-y-10">
      {posts.map((post) => (
        <li key={post.slug}>
          <PostCard post={post} />
        </li>
      ))}
    </ul>
  )
}
```

- [ ] **Step 9: Replace `src/app/layout.tsx`** (drops the Geist font imports from the scaffold; system fonts are fine and avoid a network fetch at build)

```tsx
import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { SiteFooter } from '@/components/site-footer'
import { SiteHeader } from '@/components/site-header'
import { site } from '@/lib/site'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — ${site.tagline}`,
    template: `%s | ${site.name}`,
  },
  description: site.description,
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col">
        <SiteHeader />
        <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10">{children}</main>
        <SiteFooter />
      </body>
    </html>
  )
}
```

- [ ] **Step 10: Replace `src/app/page.tsx`**

```tsx
import { PostList } from '@/components/post-list'
import { allPosts } from '@/lib/content'
import { publishedPosts } from '@/lib/posts'
import { site } from '@/lib/site'

export default function HomePage() {
  const posts = publishedPosts(allPosts).slice(0, 10)
  return (
    <>
      <section className="mb-12">
        <h1 className="text-3xl font-bold tracking-tight">{site.name}</h1>
        <p className="mt-3 text-lg text-zinc-600 dark:text-zinc-400">{site.author.bio}</p>
      </section>
      <h2 className="mb-6 text-xl font-semibold">Latest posts</h2>
      <PostList posts={posts} />
    </>
  )
}
```

- [ ] **Step 11: Create `src/app/posts/[slug]/page.tsx`**

```tsx
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { Byline } from '@/components/byline'
import { MDXContent } from '@/components/mdx-content'
import { TagList } from '@/components/tag-list'
import { allPosts } from '@/lib/content'
import { findPost } from '@/lib/posts'

type Props = { params: Promise<{ slug: string }> }

export const dynamicParams = false

export function generateStaticParams() {
  return allPosts.map((post) => ({ slug: post.slug }))
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params
  const post = findPost(allPosts, slug)
  if (!post) notFound()

  return (
    <article>
      <header className="mb-8 space-y-3">
        {post.draft && (
          <p className="text-sm font-medium text-amber-600">Draft — not listed or indexed</p>
        )}
        <h1 className="text-3xl font-bold tracking-tight">{post.title}</h1>
        <p className="text-lg text-zinc-600 dark:text-zinc-400">{post.description}</p>
        <Byline post={post} />
        {post.cover && (
          <Image
            src={post.cover.src}
            width={post.cover.width}
            height={post.cover.height}
            placeholder="blur"
            blurDataURL={post.cover.blurDataURL}
            alt=""
            className="rounded"
            priority
          />
        )}
      </header>
      <div className="prose prose-zinc max-w-none dark:prose-invert">
        <MDXContent code={post.code} />
      </div>
      <footer className="mt-10">
        <TagList tags={post.tags} />
      </footer>
    </article>
  )
}
```

- [ ] **Step 12: Create `src/app/not-found.tsx`**

```tsx
import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">Page not found</h1>
      <p>
        Nothing lives at this address. Head back to the{' '}
        <Link href="/" className="underline">
          home page
        </Link>
        .
      </p>
    </div>
  )
}
```

- [ ] **Step 13: Build and check the rendered pages**

```bash
pnpm build
node_modules/.bin/next start -p 3999 & SERVER=$!
sleep 3
curl -s http://localhost:3999/ | grep -o '<h1[^>]*>[^<]*</h1>'
curl -s http://localhost:3999/posts/hello-world | grep -o '<h1[^>]*>[^<]*</h1>'
curl -s http://localhost:3999/posts/hello-world | grep -c '<time datetime="2026-09-09"'
curl -s -o /dev/null -w '%{http_code}\n' http://localhost:3999/posts/does-not-exist
kill $SERVER
```

Expected: build output marks `/`, `/posts/[slug]` as static (○/●) with both slugs listed; the home H1 is `Andrii Korkoshko`; the post H1 is the post title; the time count is ≥1; the unknown slug returns `404`.

- [ ] **Step 14: Lint, typecheck, commit**

```bash
pnpm lint && pnpm typecheck
git add -A
git commit -m "feat: layout, MDX rendering, home and post pages" -m "Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>" -m "Claude-Session: https://claude.ai/code/session_015aiFug8n6PdHYPbSkkZzTS"
```

---

### Task 4: Tag pages

Implements spec §6 rows `/tags` and `/tags/<tag>`.

**Files:**
- Create: `src/app/tags/page.tsx`, `src/app/tags/[tag]/page.tsx`

**Interfaces:**
- Consumes: `allTags`, `postsByTag`, `allPosts`, `<PostList />`.

- [ ] **Step 1: Create `src/app/tags/page.tsx`**

```tsx
import Link from 'next/link'
import { allPosts } from '@/lib/content'
import { allTags } from '@/lib/posts'

export const metadata = { title: 'Tags' }

export default function TagsPage() {
  const tags = allTags(allPosts)
  return (
    <>
      <h1 className="mb-6 text-3xl font-bold">Tags</h1>
      <ul className="flex flex-wrap gap-3">
        {tags.map(({ tag, count }) => (
          <li key={tag}>
            <Link href={`/tags/${tag}`} className="rounded bg-zinc-100 px-3 py-1 hover:underline dark:bg-zinc-800">
              #{tag} <span className="text-zinc-500">({count})</span>
            </Link>
          </li>
        ))}
      </ul>
    </>
  )
}
```

- [ ] **Step 2: Create `src/app/tags/[tag]/page.tsx`**

```tsx
import { notFound } from 'next/navigation'
import { PostList } from '@/components/post-list'
import { allPosts } from '@/lib/content'
import { allTags, postsByTag } from '@/lib/posts'

type Props = { params: Promise<{ tag: string }> }

export const dynamicParams = false

export function generateStaticParams() {
  return allTags(allPosts).map(({ tag }) => ({ tag }))
}

export async function generateMetadata({ params }: Props) {
  const { tag } = await params
  return { title: `#${tag}` }
}

export default async function TagPage({ params }: Props) {
  const { tag } = await params
  const posts = postsByTag(allPosts, tag)
  if (posts.length === 0) notFound()
  return (
    <>
      <h1 className="mb-6 text-3xl font-bold">#{tag}</h1>
      <PostList posts={posts} />
    </>
  )
}
```

- [ ] **Step 3: Build and check**

```bash
pnpm build
node_modules/.bin/next start -p 3999 & SERVER=$!
sleep 3
curl -s http://localhost:3999/tags | grep -o '#engineering'
curl -s http://localhost:3999/tags/engineering | grep -o 'How this blog is built[^<]*'
curl -s -o /dev/null -w '%{http_code}\n' http://localhost:3999/tags/nope
kill $SERVER
```

Expected: `#engineering` on the index, the second seed post title on the tag page, `404` for an unknown tag.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: tag index and tag pages" -m "Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>" -m "Claude-Session: https://claude.ai/code/session_015aiFug8n6PdHYPbSkkZzTS"
```

---

### Task 5: JSON-LD builders and the About entity page

Implements spec §7.2 and the `/about` row in §6.

**Files:**
- Create: `src/lib/jsonld.ts`, `tests/jsonld.test.ts`, `src/components/json-ld.tsx`, `src/app/about/page.tsx`
- Modify: `src/app/page.tsx` (WebSite), `src/app/posts/[slug]/page.tsx` (BlogPosting + BreadcrumbList)

**Interfaces:**
- Consumes: `SiteConfig`, `personId`, `sameAs`, `absoluteUrl`, `lastModified`, `PostMeta`.
- Produces: `person(site)`, `profilePage(site)`, `webSite(site)`, `blogPosting(site, post)`, `breadcrumbs(site, post)` — each returns a `WithContext<...>` object from `schema-dts`; `<JsonLd data={object} />`. Post image URL is `${site.url}/posts/${slug}/og` (served by Task 6).

- [ ] **Step 1: Install types**

```bash
pnpm add -D schema-dts
```

- [ ] **Step 2: Write the failing tests `tests/jsonld.test.ts`**

```ts
import { describe, expect, it } from 'vitest'
import { blogPosting, breadcrumbs, person, profilePage, webSite } from '@/lib/jsonld'
import { site as base, type SiteConfig } from '@/lib/site'
import { makePost } from './helpers'

const site: SiteConfig = {
  ...base,
  author: { ...base.author, jobTitle: 'Engineer', employer: 'Acme', image: '/images/me.jpg' },
  social: { github: 'https://github.com/x', linkedin: '', x: 'https://x.com/x' },
}
const PERSON_ID = 'https://andrii.korkoshko.com/about#person'

describe('person', () => {
  it('has the fixed @id, absolute urls and only non-empty sameAs links', () => {
    const p = person(site)
    expect(p['@context']).toBe('https://schema.org')
    expect(p['@type']).toBe('Person')
    expect(p['@id']).toBe(PERSON_ID)
    expect(p.url).toBe('https://andrii.korkoshko.com/about')
    expect(p.image).toBe('https://andrii.korkoshko.com/images/me.jpg')
    expect(p.sameAs).toEqual(['https://github.com/x', 'https://x.com/x'])
    expect(p.jobTitle).toBe('Engineer')
    expect(p.worksFor).toEqual({ '@type': 'Organization', name: 'Acme' })
  })

  it('omits empty optional fields', () => {
    const p = person({ ...site, author: { ...site.author, jobTitle: '', employer: '', image: '' } })
    expect(p).not.toHaveProperty('jobTitle')
    expect(p).not.toHaveProperty('worksFor')
    expect(p).not.toHaveProperty('image')
  })
})

describe('profilePage', () => {
  it('wraps the person as mainEntity', () => {
    const page = profilePage(site)
    expect(page['@type']).toBe('ProfilePage')
    expect(page.mainEntity).toMatchObject({ '@type': 'Person', '@id': PERSON_ID })
  })
})

describe('webSite', () => {
  it('references the person by id', () => {
    const w = webSite(site)
    expect(w['@type']).toBe('WebSite')
    expect(w.url).toBe('https://andrii.korkoshko.com')
    expect(w.author).toEqual({ '@id': PERSON_ID })
    expect(w.publisher).toEqual({ '@id': PERSON_ID })
  })
})

describe('blogPosting', () => {
  const post = makePost({
    slug: 'hello',
    title: 'Hello',
    publishedAt: '2026-09-09T00:00:00.000Z',
    updatedAt: '2026-09-10T00:00:00.000Z',
    tags: ['a', 'b'],
    metadata: { readingTime: 2, wordCount: 321 },
  })

  it('fills the article fields from the post', () => {
    const b = blogPosting(site, post)
    expect(b['@type']).toBe('BlogPosting')
    expect(b.headline).toBe('Hello')
    expect(b.url).toBe('https://andrii.korkoshko.com/posts/hello')
    expect(b.mainEntityOfPage).toBe('https://andrii.korkoshko.com/posts/hello')
    expect(b.datePublished).toBe('2026-09-09T00:00:00.000Z')
    expect(b.dateModified).toBe('2026-09-10T00:00:00.000Z')
    expect(b.keywords).toEqual(['a', 'b'])
    expect(b.wordCount).toBe(321)
    expect(b.image).toBe('https://andrii.korkoshko.com/posts/hello/og')
    expect(b.author).toEqual({ '@id': PERSON_ID })
    expect(b.inLanguage).toBe('en')
  })

  it('falls back to publishedAt for dateModified', () => {
    expect(blogPosting(site, makePost({ publishedAt: '2026-01-01T00:00:00.000Z' })).dateModified).toBe(
      '2026-01-01T00:00:00.000Z',
    )
  })
})

describe('breadcrumbs', () => {
  it('lists Home then the post title', () => {
    const b = breadcrumbs(site, makePost({ slug: 'hello', title: 'Hello' }))
    expect(b['@type']).toBe('BreadcrumbList')
    expect(b.itemListElement).toEqual([
      { '@type': 'ListItem', position: 1, name: 'Home', item: { '@id': 'https://andrii.korkoshko.com' } },
      { '@type': 'ListItem', position: 2, name: 'Hello', item: { '@id': 'https://andrii.korkoshko.com/posts/hello' } },
    ])
  })
})
```

- [ ] **Step 3: Run to verify failure**

Run: `pnpm test tests/jsonld.test.ts`
Expected: FAIL — cannot resolve `@/lib/jsonld`.

- [ ] **Step 4: Create `src/lib/jsonld.ts`**

```ts
import type {
  BlogPosting,
  BreadcrumbList,
  Person,
  ProfilePage,
  WebSite,
  WithContext,
} from 'schema-dts'
import { lastModified } from './posts'
import { absoluteUrl, personId, sameAs, type SiteConfig } from './site'
import type { PostMeta } from './types'

const CONTEXT = 'https://schema.org' as const

function personNode(site: SiteConfig): Person {
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

export function person(site: SiteConfig): WithContext<Person> {
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
```

- [ ] **Step 5: Run tests**

Run: `pnpm test`
Expected: PASS.

- [ ] **Step 6: Create `src/components/json-ld.tsx`**

```tsx
/** Emits a JSON-LD script. `<` is escaped so content can never close the script tag. */
export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }}
    />
  )
}
```

- [ ] **Step 7: Create `src/app/about/page.tsx`**

```tsx
import Image from 'next/image'
import { JsonLd } from '@/components/json-ld'
import { person, profilePage } from '@/lib/jsonld'
import { site } from '@/lib/site'

export const metadata = {
  title: 'About',
  description: `${site.author.name}: ${site.author.bio}`,
  alternates: { canonical: '/about' },
}

export default function AboutPage() {
  const links = [
    { label: 'GitHub', href: site.social.github },
    { label: 'LinkedIn', href: site.social.linkedin },
    { label: 'X', href: site.social.x },
  ].filter((link) => link.href.length > 0)
  const role = [site.author.jobTitle, site.author.employer].filter(Boolean).join(' at ')

  return (
    <article className="prose prose-zinc max-w-none dark:prose-invert">
      <JsonLd data={person(site)} />
      <JsonLd data={profilePage(site)} />
      <h1>{site.author.name}</h1>
      {site.author.image && (
        <Image src={site.author.image} alt={site.author.name} width={160} height={160} className="rounded-full" />
      )}
      {role && <p className="lead">{role}</p>}
      <p>{site.author.bio}</p>
      <h2>Elsewhere</h2>
      <ul>
        {links.map((link) => (
          <li key={link.label}>
            <a href={link.href} rel="me">
              {link.label}
            </a>
          </li>
        ))}
      </ul>
      <h2>This site</h2>
      <p>
        Every post is also available as markdown (append <code>.md</code> to a post URL), through{' '}
        <a href="/feed.xml">RSS</a>, and in <a href="/llms.txt">llms.txt</a>.
      </p>
    </article>
  )
}
```

- [ ] **Step 8: Add WebSite JSON-LD to `src/app/page.tsx`** — import `JsonLd` and `webSite`, and render `<JsonLd data={webSite(site)} />` as the first child inside the fragment:

```tsx
import { JsonLd } from '@/components/json-ld'
import { webSite } from '@/lib/jsonld'
// ...inside the returned fragment, before <section>:
<JsonLd data={webSite(site)} />
```

- [ ] **Step 9: Add BlogPosting and BreadcrumbList to `src/app/posts/[slug]/page.tsx`** — import `JsonLd`, `blogPosting`, `breadcrumbs`, `site`, and render both as the first children of `<article>`:

```tsx
import { JsonLd } from '@/components/json-ld'
import { blogPosting, breadcrumbs } from '@/lib/jsonld'
import { site } from '@/lib/site'
// ...inside <article>, before <header>:
<JsonLd data={blogPosting(site, post)} />
<JsonLd data={breadcrumbs(site, post)} />
```

- [ ] **Step 10: Build and verify the JSON-LD is in the HTML**

```bash
pnpm build
node_modules/.bin/next start -p 3999 & SERVER=$!
sleep 3
curl -s http://localhost:3999/about | grep -o '"@id":"https://andrii.korkoshko.com/about#person"' | head -1
curl -s http://localhost:3999/posts/hello-world | grep -o '"@type":"BlogPosting"'
curl -s http://localhost:3999/ | grep -o '"@type":"WebSite"'
kill $SERVER
```

Expected: each grep prints its match once.

- [ ] **Step 11: Lint, typecheck, commit**

```bash
pnpm lint && pnpm typecheck && pnpm test
git add -A
git commit -m "feat: JSON-LD builders, About entity page, article structured data" -m "Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>" -m "Claude-Session: https://claude.ai/code/session_015aiFug8n6PdHYPbSkkZzTS"
```

---

### Task 6: Page metadata helpers and generated OG images

Implements spec §7.1 (canonical, Open Graph, Twitter, draft noindex) and the generated OG image (spec §5.1 "OG image is always generated from title").

**Files:**
- Create: `src/lib/metadata.ts`, `tests/metadata.test.ts`, `src/app/posts/[slug]/og/route.tsx`
- Modify: `src/app/page.tsx`, `src/app/about/page.tsx`, `src/app/tags/page.tsx`, `src/app/tags/[tag]/page.tsx`, `src/app/posts/[slug]/page.tsx`

**Interfaces:**
- Consumes: `site`, `absoluteUrl`, `lastModified`, `PostMeta`, `allPosts`, `findPost`, `formatDate`.
- Produces: `pageMetadata({ title?, description?, path }): Metadata`, `postMetadata(post): Metadata`, `OG_IMAGE = { width: 1200, height: 630 }`, and the route `GET /posts/<slug>/og` returning a PNG.

- [ ] **Step 1: Write the failing tests `tests/metadata.test.ts`**

```ts
import { describe, expect, it } from 'vitest'
import { pageMetadata, postMetadata } from '@/lib/metadata'
import { makePost } from './helpers'

describe('pageMetadata', () => {
  it('sets canonical path and website open graph', () => {
    const m = pageMetadata({ title: 'Tags', path: '/tags' })
    expect(m.title).toBe('Tags')
    expect(m.alternates?.canonical).toBe('/tags')
    expect(m.openGraph).toMatchObject({ type: 'website', url: 'https://andrii.korkoshko.com/tags', title: 'Tags' })
  })

  it('leaves title undefined so the layout default applies', () => {
    expect(pageMetadata({ path: '/' })).not.toHaveProperty('title')
  })
})

describe('postMetadata', () => {
  const post = makePost({
    slug: 'hello',
    title: 'Hello',
    publishedAt: '2026-09-09T00:00:00.000Z',
    updatedAt: '2026-09-10T00:00:00.000Z',
    tags: ['a'],
  })

  it('sets article open graph, canonical and the generated image', () => {
    const m = postMetadata(post)
    expect(m.title).toBe('Hello')
    expect(m.alternates?.canonical).toBe('/posts/hello')
    expect(m.openGraph).toMatchObject({
      type: 'article',
      url: 'https://andrii.korkoshko.com/posts/hello',
      publishedTime: '2026-09-09T00:00:00.000Z',
      modifiedTime: '2026-09-10T00:00:00.000Z',
      authors: ['https://andrii.korkoshko.com/about'],
      tags: ['a'],
      images: [{ url: '/posts/hello/og', width: 1200, height: 630, alt: 'Hello' }],
    })
    expect(m.twitter).toMatchObject({ card: 'summary_large_image', images: ['/posts/hello/og'] })
    expect(m).not.toHaveProperty('robots')
  })

  it('marks drafts noindex', () => {
    expect(postMetadata(makePost({ draft: true })).robots).toEqual({ index: false, follow: false })
  })
})
```

- [ ] **Step 2: Run to verify failure**

Run: `pnpm test tests/metadata.test.ts`
Expected: FAIL — cannot resolve `@/lib/metadata`.

- [ ] **Step 3: Create `src/lib/metadata.ts`**

```ts
import type { Metadata } from 'next'
import { lastModified } from './posts'
import { absoluteUrl, site } from './site'
import type { PostMeta } from './types'

export const OG_IMAGE = { width: 1200, height: 630 }

type PageInput = { title?: string; description?: string; path: string }

export function pageMetadata({ title, description, path }: PageInput): Metadata {
  const desc = description ?? site.description
  return {
    ...(title ? { title } : {}),
    description: desc,
    alternates: { canonical: path },
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
    alternates: { canonical: path },
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
```

- [ ] **Step 4: Run tests**

Run: `pnpm test`
Expected: PASS.

- [ ] **Step 5: Wire the helpers into the pages**

`src/app/page.tsx` — add:

```tsx
import { pageMetadata } from '@/lib/metadata'
export const metadata = pageMetadata({ path: '/' })
```

`src/app/about/page.tsx` — replace the existing `export const metadata = {...}` with:

```tsx
import { pageMetadata } from '@/lib/metadata'
export const metadata = pageMetadata({
  title: 'About',
  description: `${site.author.name}: ${site.author.bio}`,
  path: '/about',
})
```

`src/app/tags/page.tsx` — replace `export const metadata = { title: 'Tags' }` with:

```tsx
import { pageMetadata } from '@/lib/metadata'
export const metadata = pageMetadata({ title: 'Tags', path: '/tags' })
```

`src/app/tags/[tag]/page.tsx` — replace `generateMetadata` with:

```tsx
import { pageMetadata } from '@/lib/metadata'
export async function generateMetadata({ params }: Props) {
  const { tag } = await params
  return pageMetadata({ title: `#${tag}`, path: `/tags/${tag}` })
}
```

`src/app/posts/[slug]/page.tsx` — add:

```tsx
import type { Metadata } from 'next'
import { postMetadata } from '@/lib/metadata'

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const post = findPost(allPosts, slug)
  if (!post) notFound()
  return postMetadata(post)
}
```

- [ ] **Step 6: Create `src/app/posts/[slug]/og/route.tsx`**

```tsx
import { ImageResponse } from 'next/og'
import { allPosts } from '@/lib/content'
import { formatDate } from '@/lib/dates'
import { OG_IMAGE } from '@/lib/metadata'
import { findPost } from '@/lib/posts'
import { site } from '@/lib/site'

export const dynamic = 'force-static'
export const dynamicParams = false

export function generateStaticParams() {
  return allPosts.map((post) => ({ slug: post.slug }))
}

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = findPost(allPosts, slug)
  if (!post) return new Response('Not found', { status: 404 })

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: 64,
          background: '#09090b',
          color: '#fafafa',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ fontSize: 28, color: '#a1a1aa' }}>{site.url.replace('https://', '')}</div>
        <div style={{ fontSize: 64, fontWeight: 700, lineHeight: 1.1 }}>{post.title}</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 28, color: '#a1a1aa' }}>
          <span>{site.author.name}</span>
          <span>{formatDate(post.publishedAt)}</span>
        </div>
      </div>
    ),
    OG_IMAGE,
  )
}
```

- [ ] **Step 7: Build and verify**

```bash
pnpm build
node_modules/.bin/next start -p 3999 & SERVER=$!
sleep 3
curl -s http://localhost:3999/posts/hello-world | grep -o '<link rel="canonical" href="[^"]*"'
curl -s http://localhost:3999/posts/hello-world | grep -o '<meta property="og:image" content="[^"]*"'
curl -s -o /dev/null -w '%{content_type} %{size_download}\n' http://localhost:3999/posts/hello-world/og
kill $SERVER
```

Expected: canonical `https://andrii.korkoshko.com/posts/hello-world`; og:image `https://andrii.korkoshko.com/posts/hello-world/og`; the image request returns `image/png` with a non-zero size. The build output lists `/posts/[slug]/og` as static with both slugs.

- [ ] **Step 8: Lint, typecheck, commit**

```bash
pnpm lint && pnpm typecheck && pnpm test
git add -A
git commit -m "feat: page metadata helpers and generated OG images" -m "Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>" -m "Claude-Session: https://claude.ai/code/session_015aiFug8n6PdHYPbSkkZzTS"
```

---

### Task 7: Analytics, security headers, CI workflow

Implements spec §7.9 and the CI part of §10, plus Vercel Web Analytics from §2.

**Files:**
- Modify: `src/app/layout.tsx`, `next.config.ts`
- Create: `.github/workflows/ci.yml`

- [ ] **Step 1: Install analytics and add it to the layout**

```bash
pnpm add @vercel/analytics
```

In `src/app/layout.tsx` add `import { Analytics } from '@vercel/analytics/next'` and render `<Analytics />` as the last child of `<body>`, after `<SiteFooter />`.

- [ ] **Step 2: Replace `next.config.ts`**

```ts
import type { NextConfig } from 'next'

const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
]

const nextConfig: NextConfig = {
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }]
  },
}

export default nextConfig
```

- [ ] **Step 3: Create `.github/workflows/ci.yml`**

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:

jobs:
  verify:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm typecheck
      - run: pnpm lint
      - run: pnpm test
      - run: pnpm build
```

- [ ] **Step 4: Verify locally**

```bash
pnpm build
node_modules/.bin/next start -p 3999 & SERVER=$!
sleep 3
curl -sI http://localhost:3999/ | grep -iE '^(x-content-type-options|referrer-policy|permissions-policy)'
curl -s http://localhost:3999/ | grep -c '/_vercel/insights/script.js'
kill $SERVER
```

Expected: the three headers print; the analytics script count is `1`.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: analytics, security headers and CI workflow" -m "Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>" -m "Claude-Session: https://claude.ai/code/session_015aiFug8n6PdHYPbSkkZzTS"
```

---

### Task 8: GitHub repository, Vercel project, domains and DNS

Implements spec §8. Mostly human steps in dashboards; each has a verification command. **Done when** `https://andrii.korkoshko.com` serves the site and `https://korkoshko.com` redirects to it.

**Files:** none (settings live in GitHub, Vercel and GoDaddy).

- [ ] **Step 1: Create the public GitHub repo and push `main`** (the `gh` CLI is authenticated as the `Andreydemo` account)

```bash
gh repo create Andreydemo/personal-blog --public --source=. --remote=origin --push
gh run list --limit 1
```

Expected: repo created, `main` pushed, and the CI workflow from Task 7 starts. Wait for it: `gh run watch` → success.

- [ ] **Step 2: Create the Vercel project** (human, in the Vercel dashboard)

1. vercel.com → Add New → Project → Import `Andreydemo/personal-blog`.
2. Framework preset: Next.js (auto-detected). Build command `pnpm build`, install command `pnpm install`, output default. Node.js version: 22.x (Settings → General after the first deploy if it is not the default).
3. Deploy. Expected: production deployment succeeds; the `*.vercel.app` URL renders the home page.
4. Settings → Firewall: leave defaults. Do NOT enable the "AI Bots" managed ruleset. Do NOT enable Attack Challenge Mode.
5. Settings → Analytics: enable Web Analytics.

- [ ] **Step 3: Add the domains in Vercel** (Project → Settings → Domains)

1. Add `andrii.korkoshko.com` → keep as the production domain (no redirect).
2. Add `korkoshko.com` → choose "Redirect to another domain" → `andrii.korkoshko.com`, permanent (308).
3. Add `www.korkoshko.com` → same redirect to `andrii.korkoshko.com`, permanent (308).
4. Note the DNS values Vercel shows for each (CNAME target `cname.vercel-dns.com`; an A record IP for the apex, currently `76.76.21.21`).

- [ ] **Step 4: Update DNS at GoDaddy** (My Products → korkoshko.com → DNS)

| Host | Type | Value | Action |
|---|---|---|---|
| `@` | A | Vercel apex IP from Step 3 | replace the two existing Website Builder A records |
| `www` | CNAME | `cname.vercel-dns.com` | replace the existing `www` CNAME |
| `andrii` | CNAME | `cname.vercel-dns.com` | add |

Leave MX/TXT records untouched. Do not enable GoDaddy "Forwarding" for the domain; Vercel performs the redirect.

- [ ] **Step 5: Verify DNS and TLS** (propagation can take up to an hour; retry until it matches)

```bash
dig +short andrii.korkoshko.com CNAME
dig +short korkoshko.com A
curl -sI https://andrii.korkoshko.com | head -1
curl -sI https://korkoshko.com/posts/hello-world | grep -iE '^(HTTP|location)'
curl -sI https://www.korkoshko.com | grep -iE '^(HTTP|location)'
curl -sI http://korkoshko.com | grep -iE '^(HTTP|location)'
```

Expected: CNAME `cname.vercel-dns.com.`; A = the Vercel IP; `HTTP/2 200` on the primary; `308` with `location: https://andrii.korkoshko.com/posts/hello-world` from the apex (path preserved); `308` from www; the plain-http request redirects to https. In Vercel, all three domains show "Valid Configuration".

- [ ] **Step 6: Record the outcome** — add a line to `README.md` under the title: `Live at https://andrii.korkoshko.com (korkoshko.com redirects here).` Commit and push:

```bash
git add README.md
git commit -m "docs: note production URL" -m "Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>" -m "Claude-Session: https://claude.ai/code/session_015aiFug8n6PdHYPbSkkZzTS"
git push
```

---

## Phase 2 — visibility layer

### Task 9: Markdown twins and `Accept: text/markdown` negotiation

Implements spec §7.3 and the `text/markdown` alternate link in §7.1.

**Files:**
- Create: `src/lib/markdown.ts`, `tests/markdown.test.ts`, `src/app/md/[slug]/route.ts`
- Modify: `next.config.ts` (rewrites), `src/lib/metadata.ts` (alternate type)

**Interfaces:**
- Consumes: `SiteConfig`, `absoluteUrl`, `isoDay`, `PostContent`, `allPosts`, `findPost`.
- Produces: `markdownTwin(site, post: PostContent): string`, `markdownTwinPath(slug): string` → `/posts/<slug>.md`; route `GET /md/<slug>` (public URLs `/posts/<slug>.md` and content-negotiated `/posts/<slug>`).

- [ ] **Step 1: Write the failing tests `tests/markdown.test.ts`**

```ts
import { describe, expect, it } from 'vitest'
import { markdownTwin, markdownTwinPath } from '@/lib/markdown'
import { site } from '@/lib/site'
import { makePost } from './helpers'

const post = makePost({
  slug: 'hello',
  title: 'Hello: a title with a colon',
  description: 'A description that is comfortably longer than fifty characters for schema.',
  publishedAt: '2026-09-09T00:00:00.000Z',
  tags: ['a', 'b'],
  raw: '\n\nBody **bold**.\n\n',
})

describe('markdownTwin', () => {
  it('starts with a YAML front block naming author, canonical and dates', () => {
    const out = markdownTwin(site, post)
    expect(out.startsWith('---\n')).toBe(true)
    expect(out).toContain('title: "Hello: a title with a colon"')
    expect(out).toContain('description: "A description that is comfortably longer than fifty characters for schema."')
    expect(out).toContain('author: "Andrii Korkoshko"')
    expect(out).toContain('author_url: https://andrii.korkoshko.com/about')
    expect(out).toContain('canonical: https://andrii.korkoshko.com/posts/hello')
    expect(out).toContain('published: 2026-09-09')
    expect(out).toContain('tags: [a, b]')
  })

  it('omits updated when there is no updatedAt', () => {
    expect(markdownTwin(site, post)).not.toContain('updated:')
  })

  it('includes updated when present', () => {
    expect(markdownTwin(site, { ...post, updatedAt: '2026-09-12T00:00:00.000Z' })).toContain('updated: 2026-09-12')
  })

  it('places the trimmed body after the block, separated by a blank line, ending with one newline', () => {
    expect(markdownTwin(site, post)).toMatch(/\n---\n\nBody \*\*bold\*\*\.\n$/)
  })
})

describe('markdownTwinPath', () => {
  it('appends .md to the post path', () => {
    expect(markdownTwinPath('hello')).toBe('/posts/hello.md')
  })
})
```

- [ ] **Step 2: Run to verify failure**

Run: `pnpm test tests/markdown.test.ts`
Expected: FAIL — cannot resolve `@/lib/markdown`.

- [ ] **Step 3: Create `src/lib/markdown.ts`**

```ts
import { isoDay } from './dates'
import { absoluteUrl, type SiteConfig } from './site'
import type { PostContent } from './types'

/** Double-quoted YAML scalar; JSON string escaping is valid YAML. */
const quote = (value: string) => JSON.stringify(value)

export function markdownTwinPath(slug: string): string {
  return `/posts/${slug}.md`
}

export function markdownTwin(site: SiteConfig, post: PostContent): string {
  const front = [
    '---',
    `title: ${quote(post.title)}`,
    `description: ${quote(post.description)}`,
    `author: ${quote(site.author.name)}`,
    `author_url: ${absoluteUrl(site, '/about')}`,
    `canonical: ${absoluteUrl(site, `/posts/${post.slug}`)}`,
    `published: ${isoDay(post.publishedAt)}`,
    ...(post.updatedAt ? [`updated: ${isoDay(post.updatedAt)}`] : []),
    `tags: [${post.tags.join(', ')}]`,
    '---',
  ]
  return `${front.join('\n')}\n\n${post.raw.trim()}\n`
}
```

- [ ] **Step 4: Run tests**

Run: `pnpm test`
Expected: PASS.

- [ ] **Step 5: Create `src/app/md/[slug]/route.ts`**

```ts
import { allPosts } from '@/lib/content'
import { markdownTwin } from '@/lib/markdown'
import { findPost } from '@/lib/posts'
import { site } from '@/lib/site'

export const dynamic = 'force-static'
export const dynamicParams = false

export function generateStaticParams() {
  return allPosts.map((post) => ({ slug: post.slug }))
}

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = findPost(allPosts, slug)
  if (!post) return new Response('Not found', { status: 404 })
  return new Response(markdownTwin(site, post), {
    headers: {
      'content-type': 'text/markdown; charset=utf-8',
      vary: 'Accept',
    },
  })
}
```

- [ ] **Step 6: Add the rewrites to `next.config.ts`** — inside `nextConfig`, next to `headers()`:

```ts
  async rewrites() {
    return {
      beforeFiles: [
        // /posts/<slug>.md → markdown twin
        { source: '/posts/:slug\\.md', destination: '/md/:slug' },
        // /posts/<slug> with Accept: text/markdown → markdown twin
        {
          source: '/posts/:slug',
          has: [{ type: 'header', key: 'accept', value: '.*text/markdown.*' }],
          destination: '/md/:slug',
        },
      ],
      afterFiles: [],
      fallback: [],
    }
  },
```

- [ ] **Step 7: Advertise the twin in post metadata** — in `src/lib/metadata.ts`, import `markdownTwinPath` and change the `alternates` line of `postMetadata` to:

```ts
    alternates: { canonical: path, types: { 'text/markdown': markdownTwinPath(post.slug) } },
```

Add to `tests/metadata.test.ts` inside the `postMetadata` describe:

```ts
  it('advertises the markdown twin as an alternate', () => {
    expect(postMetadata(post).alternates?.types).toEqual({ 'text/markdown': '/posts/hello.md' })
  })
```

Run: `pnpm test` → PASS.

- [ ] **Step 8: Build and verify negotiation locally**

```bash
pnpm build
node_modules/.bin/next start -p 3999 & SERVER=$!
sleep 3
curl -s http://localhost:3999/posts/hello-world.md | head -12
curl -sI http://localhost:3999/posts/hello-world.md | grep -i '^content-type'
curl -sI -H 'Accept: text/markdown' http://localhost:3999/posts/hello-world | grep -i '^content-type'
curl -sI -H 'Accept: text/html' http://localhost:3999/posts/hello-world | grep -i '^content-type'
curl -s http://localhost:3999/posts/hello-world | grep -o 'href="[^"]*hello-world\.md"'
curl -s -o /dev/null -w '%{http_code}\n' http://localhost:3999/posts/nope.md
kill $SERVER
```

Expected: the `.md` body starts with `---` and `title: "Hello, world: why I started this blog"`; content-type `text/markdown; charset=utf-8` for both the `.md` URL and the Accept-negotiated request; `text/html; charset=utf-8` for the HTML request; the alternate link href is `https://andrii.korkoshko.com/posts/hello-world.md`; unknown slug → `404`.

- [ ] **Step 9: Lint, typecheck, commit**

```bash
pnpm lint && pnpm typecheck
git add -A
git commit -m "feat: markdown twins with .md URLs and Accept negotiation" -m "Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>" -m "Claude-Session: https://claude.ai/code/session_015aiFug8n6PdHYPbSkkZzTS"
```

---

### Task 10: RSS, Atom and JSON feeds

Implements spec §7.4 and the feed alternates in §7.1.

**Files:**
- Create: `src/lib/feeds.ts`, `tests/feeds.test.ts`, `src/app/feed.xml/route.ts`, `src/app/atom.xml/route.ts`, `src/app/feed.json/route.ts`
- Modify: `src/lib/metadata.ts` (feed alternates on every page)

**Interfaces:**
- Consumes: `publishedPosts`, `lastModified`, `absoluteUrl`, `PostContent`, `allPosts`.
- Produces: `buildFeed(site, posts: PostContent[]): Feed` (from the `feed` package; call `.rss2()`, `.atom1()`, `.json1()`), `FEED_LIMIT = 50`, `feedAlternates` for `Metadata.alternates.types`.

- [ ] **Step 1: Install**

```bash
pnpm add feed
```

- [ ] **Step 2: Write the failing tests `tests/feeds.test.ts`**

```ts
import { describe, expect, it } from 'vitest'
import { FEED_LIMIT, buildFeed } from '@/lib/feeds'
import { site } from '@/lib/site'
import { makePost } from './helpers'

describe('buildFeed', () => {
  it('lists published posts newest first with absolute links and full html', () => {
    const older = makePost({ slug: 'older', publishedAt: '2026-01-01T00:00:00.000Z', html: '<p>old</p>' })
    const newer = makePost({ slug: 'newer', publishedAt: '2026-02-01T00:00:00.000Z', html: '<p>new</p>' })
    const draft = makePost({ slug: 'draft', draft: true })
    const feed = buildFeed(site, [older, draft, newer])
    expect(feed.items.map((i) => i.link)).toEqual([
      'https://andrii.korkoshko.com/posts/newer',
      'https://andrii.korkoshko.com/posts/older',
    ])
    expect(feed.items[0].content).toBe('<p>new</p>')
    expect(feed.items[0].author).toEqual([{ name: 'Andrii Korkoshko', link: 'https://andrii.korkoshko.com/about' }])
  })

  it('caps at FEED_LIMIT items', () => {
    const many = Array.from({ length: FEED_LIMIT + 10 }, (_, i) =>
      makePost({ slug: `p${i}`, publishedAt: `2026-01-${String((i % 28) + 1).padStart(2, '0')}T00:00:00.000Z` }),
    )
    expect(buildFeed(site, many).items).toHaveLength(FEED_LIMIT)
  })

  it('uses the newest modification time as the feed updated time', () => {
    const a = makePost({ publishedAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-03-01T00:00:00.000Z' })
    const b = makePost({ publishedAt: '2026-02-01T00:00:00.000Z' })
    expect(buildFeed(site, [a, b]).options.updated?.toISOString()).toBe('2026-03-01T00:00:00.000Z')
  })

  it('renders all three formats', () => {
    const feed = buildFeed(site, [makePost({ slug: 'x' })])
    expect(feed.rss2()).toContain('<item>')
    expect(feed.rss2()).toContain('https://andrii.korkoshko.com/posts/x')
    expect(feed.atom1()).toContain('<entry>')
    expect(JSON.parse(feed.json1()).items[0].url).toBe('https://andrii.korkoshko.com/posts/x')
  })

  it('renders valid empty feeds when nothing is published', () => {
    const feed = buildFeed(site, [makePost({ draft: true })])
    expect(feed.items).toHaveLength(0)
    expect(feed.rss2()).toContain('<rss')
    expect(JSON.parse(feed.json1()).items).toEqual([])
  })
})
```

- [ ] **Step 3: Run to verify failure**

Run: `pnpm test tests/feeds.test.ts`
Expected: FAIL — cannot resolve `@/lib/feeds`.

- [ ] **Step 4: Create `src/lib/feeds.ts`**

```ts
import { Feed } from 'feed'
import { lastModified, publishedPosts } from './posts'
import { absoluteUrl, type SiteConfig } from './site'
import type { PostContent } from './types'

export const FEED_LIMIT = 50

export function buildFeed(site: SiteConfig, posts: PostContent[]): Feed {
  const items = publishedPosts(posts).slice(0, FEED_LIMIT)
  const author = { name: site.author.name, link: absoluteUrl(site, '/about') }
  const newest = items.map(lastModified).sort().at(-1)

  const feed = new Feed({
    id: site.url,
    link: site.url,
    title: site.name,
    description: site.description,
    language: 'en',
    copyright: `© ${new Date().getUTCFullYear()} ${site.author.name}`,
    generator: false,
    ...(newest ? { updated: new Date(newest) } : {}),
    feedLinks: {
      rss: absoluteUrl(site, '/feed.xml'),
      atom: absoluteUrl(site, '/atom.xml'),
      json: absoluteUrl(site, '/feed.json'),
    },
    author,
  })

  for (const post of items) {
    const url = absoluteUrl(site, `/posts/${post.slug}`)
    feed.addItem({
      title: post.title,
      id: url,
      link: url,
      description: post.description,
      content: post.html,
      author: [author],
      date: new Date(lastModified(post)),
      published: new Date(post.publishedAt),
      category: post.tags.map((name) => ({ name })),
    })
  }
  return feed
}
```

- [ ] **Step 5: Run tests**

Run: `pnpm test`
Expected: PASS.

- [ ] **Step 6: Create the three route handlers**

`src/app/feed.xml/route.ts`:

```ts
import { allPosts } from '@/lib/content'
import { buildFeed } from '@/lib/feeds'
import { site } from '@/lib/site'

export const dynamic = 'force-static'

export function GET() {
  return new Response(buildFeed(site, allPosts).rss2(), {
    headers: { 'content-type': 'application/rss+xml; charset=utf-8' },
  })
}
```

`src/app/atom.xml/route.ts`:

```ts
import { allPosts } from '@/lib/content'
import { buildFeed } from '@/lib/feeds'
import { site } from '@/lib/site'

export const dynamic = 'force-static'

export function GET() {
  return new Response(buildFeed(site, allPosts).atom1(), {
    headers: { 'content-type': 'application/atom+xml; charset=utf-8' },
  })
}
```

`src/app/feed.json/route.ts`:

```ts
import { allPosts } from '@/lib/content'
import { buildFeed } from '@/lib/feeds'
import { site } from '@/lib/site'

export const dynamic = 'force-static'

export function GET() {
  return new Response(buildFeed(site, allPosts).json1(), {
    headers: { 'content-type': 'application/feed+json; charset=utf-8' },
  })
}
```

- [ ] **Step 7: Advertise feeds on every page** — in `src/lib/metadata.ts` add the export and spread it into both `alternates.types`:

```ts
export const feedAlternates = {
  'application/rss+xml': [{ url: '/feed.xml', title: `${site.name} — RSS` }],
  'application/atom+xml': [{ url: '/atom.xml', title: `${site.name} — Atom` }],
  'application/feed+json': [{ url: '/feed.json', title: `${site.name} — JSON Feed` }],
}
```

In `pageMetadata`: `alternates: { canonical: path, types: { ...feedAlternates } },`
In `postMetadata`: `alternates: { canonical: path, types: { ...feedAlternates, 'text/markdown': markdownTwinPath(post.slug) } },`

Update the metadata tests: in `pageMetadata` add

```ts
  it('advertises the feeds', () => {
    expect(pageMetadata({ path: '/' }).alternates?.types).toMatchObject({
      'application/rss+xml': [{ url: '/feed.xml' }],
      'application/atom+xml': [{ url: '/atom.xml' }],
      'application/feed+json': [{ url: '/feed.json' }],
    })
  })
```

and change the markdown-alternate assertion in `postMetadata` to `expect(postMetadata(post).alternates?.types).toMatchObject({ 'text/markdown': '/posts/hello.md' })`.

Run: `pnpm test` → PASS.

- [ ] **Step 8: Build and verify**

```bash
pnpm build
node_modules/.bin/next start -p 3999 & SERVER=$!
sleep 3
curl -sI http://localhost:3999/feed.xml | grep -i '^content-type'
curl -s http://localhost:3999/feed.xml | grep -c '<item>'
curl -s http://localhost:3999/atom.xml | grep -c '<entry>'
curl -s http://localhost:3999/feed.json | node -e "let s='';process.stdin.on('data',d=>s+=d).on('end',()=>console.log(JSON.parse(s).items.length))"
curl -s http://localhost:3999/ | grep -o 'type="application/rss+xml"'
kill $SERVER
```

Expected: `application/rss+xml; charset=utf-8`; item and entry counts `2`; JSON item count `2`; the RSS discovery link is present on the home page.

- [ ] **Step 9: Lint, typecheck, commit**

```bash
pnpm lint && pnpm typecheck
git add -A
git commit -m "feat: full-content RSS, Atom and JSON feeds" -m "Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>" -m "Claude-Session: https://claude.ai/code/session_015aiFug8n6PdHYPbSkkZzTS"
```

---

### Task 11: llms.txt and llms-full.txt

Implements spec §7.5.

**Files:**
- Create: `src/lib/llms.ts`, `tests/llms.test.ts`, `src/app/llms.txt/route.ts`, `src/app/llms-full.txt/route.ts`

**Interfaces:**
- Consumes: `publishedPosts`, `markdownTwin`, `markdownTwinPath`, `absoluteUrl`.
- Produces: `llmsTxt(site, posts: PostMeta[]): string`, `llmsFullTxt(site, posts: PostContent[]): string`.

- [ ] **Step 1: Write the failing tests `tests/llms.test.ts`**

```ts
import { describe, expect, it } from 'vitest'
import { llmsFullTxt, llmsTxt } from '@/lib/llms'
import { site } from '@/lib/site'
import { makePost } from './helpers'

const older = makePost({ slug: 'older', title: 'Older', description: 'Older post description that is long enough to satisfy the schema.', publishedAt: '2026-01-01T00:00:00.000Z' })
const newer = makePost({ slug: 'newer', title: 'Newer', description: 'Newer post description that is long enough to satisfy the schema.', publishedAt: '2026-02-01T00:00:00.000Z', raw: 'Newer body.' })
const draft = makePost({ slug: 'draft', title: 'Draft', draft: true })

describe('llmsTxt', () => {
  const out = llmsTxt(site, [older, draft, newer])

  it('follows the llms.txt shape: H1, blockquote summary, sections', () => {
    expect(out.startsWith('# Andrii Korkoshko\n\n> ')).toBe(true)
    expect(out).toContain('\n## Posts\n')
    expect(out).toContain('\n## About\n')
    expect(out).toContain('\n## Feeds\n')
  })

  it('links each published post to its markdown twin, newest first, with its description', () => {
    const posts = out.split('## Posts')[1].split('## About')[0]
    expect(posts).toContain('- [Newer](https://andrii.korkoshko.com/posts/newer.md): Newer post description')
    expect(posts).toContain('- [Older](https://andrii.korkoshko.com/posts/older.md): Older post description')
    expect(posts.indexOf('Newer')).toBeLessThan(posts.indexOf('Older'))
    expect(out).not.toContain('Draft')
  })

  it('links about and the three feeds', () => {
    expect(out).toContain('(https://andrii.korkoshko.com/about)')
    expect(out).toContain('(https://andrii.korkoshko.com/feed.xml)')
    expect(out).toContain('(https://andrii.korkoshko.com/atom.xml)')
    expect(out).toContain('(https://andrii.korkoshko.com/feed.json)')
  })
})

describe('llmsFullTxt', () => {
  it('concatenates published markdown twins newest first, separated by a rule', () => {
    const out = llmsFullTxt(site, [older, draft, newer])
    expect(out.startsWith('---\ntitle: "Newer"')).toBe(true)
    expect(out).toContain('\n\n---\n\n---\ntitle: "Older"')
    expect(out).toContain('Newer body.')
    expect(out).not.toContain('title: "Draft"')
  })
})
```

- [ ] **Step 2: Run to verify failure**

Run: `pnpm test tests/llms.test.ts`
Expected: FAIL — cannot resolve `@/lib/llms`.

- [ ] **Step 3: Create `src/lib/llms.ts`**

```ts
import { markdownTwin, markdownTwinPath } from './markdown'
import { publishedPosts } from './posts'
import { absoluteUrl, type SiteConfig } from './site'
import type { PostContent, PostMeta } from './types'

export function llmsTxt(site: SiteConfig, posts: PostMeta[]): string {
  const lines = [
    `# ${site.name}`,
    '',
    `> ${site.description}`,
    '',
    `${site.author.bio} Every post is available as HTML and as raw markdown: append \`.md\` to a post URL or request it with \`Accept: text/markdown\`.`,
    '',
    '## Posts',
    '',
    ...publishedPosts(posts).map(
      (post) => `- [${post.title}](${absoluteUrl(site, markdownTwinPath(post.slug))}): ${post.description}`,
    ),
    '',
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
```

- [ ] **Step 4: Run tests**

Run: `pnpm test`
Expected: PASS.

- [ ] **Step 5: Create the routes**

`src/app/llms.txt/route.ts`:

```ts
import { allPosts } from '@/lib/content'
import { llmsTxt } from '@/lib/llms'
import { site } from '@/lib/site'

export const dynamic = 'force-static'

export function GET() {
  return new Response(llmsTxt(site, allPosts), {
    headers: { 'content-type': 'text/plain; charset=utf-8' },
  })
}
```

`src/app/llms-full.txt/route.ts`:

```ts
import { allPosts } from '@/lib/content'
import { llmsFullTxt } from '@/lib/llms'
import { site } from '@/lib/site'

export const dynamic = 'force-static'

export function GET() {
  return new Response(llmsFullTxt(site, allPosts), {
    headers: { 'content-type': 'text/plain; charset=utf-8' },
  })
}
```

- [ ] **Step 6: Build and verify**

```bash
pnpm build
node_modules/.bin/next start -p 3999 & SERVER=$!
sleep 3
curl -s http://localhost:3999/llms.txt | head -12
curl -s http://localhost:3999/llms-full.txt | grep -c '^title: '
kill $SERVER
```

Expected: `# Andrii Korkoshko`, the blockquote, and two post lines ending in `.md)`; the full file has `2` title lines.

- [ ] **Step 7: Lint, typecheck, commit**

```bash
pnpm lint && pnpm typecheck
git add -A
git commit -m "feat: llms.txt and llms-full.txt" -m "Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>" -m "Claude-Session: https://claude.ai/code/session_015aiFug8n6PdHYPbSkkZzTS"
```

---

### Task 12: robots.txt and sitemap.xml

Implements spec §7.6 and §7.7.

**Files:**
- Create: `src/lib/robots.ts`, `src/lib/sitemap.ts`, `tests/robots.test.ts`, `tests/sitemap.test.ts`, `src/app/robots.ts`, `src/app/sitemap.ts`

**Interfaces:**
- Consumes: `site.crawlers`, `publishedPosts`, `allTags`, `lastModified`, `absoluteUrl`.
- Produces: `robotsRules(site): MetadataRoute.Robots`, `sitemapEntries(site, posts: PostMeta[]): MetadataRoute.Sitemap`.

- [ ] **Step 1: Write the failing tests**

`tests/robots.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { robotsRules } from '@/lib/robots'
import { site } from '@/lib/site'

describe('robotsRules', () => {
  const robots = robotsRules(site)
  const rules = Array.isArray(robots.rules) ? robots.rules : [robots.rules]
  const agents = rules.flatMap((r) => (Array.isArray(r.userAgent) ? r.userAgent : [r.userAgent]))

  it('allows everyone and names every configured crawler explicitly', () => {
    expect(agents).toContain('*')
    for (const crawler of site.crawlers) expect(agents).toContain(crawler)
    for (const rule of rules) expect(rule.allow).toBe('/')
    for (const rule of rules) expect(rule).not.toHaveProperty('disallow')
  })

  it('points at the sitemap', () => {
    expect(robots.sitemap).toBe('https://andrii.korkoshko.com/sitemap.xml')
  })
})
```

`tests/sitemap.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { site } from '@/lib/site'
import { sitemapEntries } from '@/lib/sitemap'
import { makePost } from './helpers'

const older = makePost({ slug: 'older', publishedAt: '2026-01-01T00:00:00.000Z', tags: ['engineering'] })
const newer = makePost({
  slug: 'newer',
  publishedAt: '2026-02-01T00:00:00.000Z',
  updatedAt: '2026-02-05T00:00:00.000Z',
  tags: ['engineering', 'opinions'],
})
const draft = makePost({ slug: 'draft', draft: true, tags: ['politics'] })
const entries = sitemapEntries(site, [older, draft, newer])
const urls = entries.map((e) => e.url)

describe('sitemapEntries', () => {
  it('lists home, about, tags index, tag pages and published posts', () => {
    expect(urls).toEqual([
      'https://andrii.korkoshko.com',
      'https://andrii.korkoshko.com/about',
      'https://andrii.korkoshko.com/tags',
      'https://andrii.korkoshko.com/tags/engineering',
      'https://andrii.korkoshko.com/tags/opinions',
      'https://andrii.korkoshko.com/posts/newer',
      'https://andrii.korkoshko.com/posts/older',
    ])
  })

  it('excludes drafts, markdown twins and feeds', () => {
    expect(urls.some((u) => u.includes('draft') || u.endsWith('.md') || u.includes('feed'))).toBe(false)
  })

  it('uses updatedAt (or publishedAt) as lastModified for posts and the newest for aggregate pages', () => {
    const byUrl = Object.fromEntries(entries.map((e) => [e.url, e.lastModified]))
    expect(byUrl['https://andrii.korkoshko.com/posts/newer']).toEqual(new Date('2026-02-05T00:00:00.000Z'))
    expect(byUrl['https://andrii.korkoshko.com/posts/older']).toEqual(new Date('2026-01-01T00:00:00.000Z'))
    expect(byUrl['https://andrii.korkoshko.com']).toEqual(new Date('2026-02-05T00:00:00.000Z'))
    expect(byUrl['https://andrii.korkoshko.com/tags/engineering']).toEqual(new Date('2026-02-05T00:00:00.000Z'))
  })
})
```

- [ ] **Step 2: Run to verify failure**

Run: `pnpm test tests/robots.test.ts tests/sitemap.test.ts`
Expected: FAIL — modules not found.

- [ ] **Step 3: Create `src/lib/robots.ts`**

```ts
import type { MetadataRoute } from 'next'
import { absoluteUrl, type SiteConfig } from './site'

export function robotsRules(site: SiteConfig): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: '/' },
      { userAgent: [...site.crawlers], allow: '/' },
    ],
    sitemap: absoluteUrl(site, '/sitemap.xml'),
  }
}
```

- [ ] **Step 4: Create `src/lib/sitemap.ts`**

```ts
import type { MetadataRoute } from 'next'
import { allTags, lastModified, postsByTag, publishedPosts } from './posts'
import { absoluteUrl, type SiteConfig } from './site'
import type { PostMeta } from './types'

function newestChange(posts: PostMeta[]): Date {
  const newest = posts.map(lastModified).sort().at(-1)
  return newest ? new Date(newest) : new Date()
}

export function sitemapEntries(site: SiteConfig, posts: PostMeta[]): MetadataRoute.Sitemap {
  const published = publishedPosts(posts)
  const siteWide = newestChange(published)
  return [
    { url: site.url, lastModified: siteWide },
    { url: absoluteUrl(site, '/about'), lastModified: siteWide },
    { url: absoluteUrl(site, '/tags'), lastModified: siteWide },
    ...allTags(posts).map(({ tag }) => ({
      url: absoluteUrl(site, `/tags/${tag}`),
      lastModified: newestChange(postsByTag(posts, tag)),
    })),
    ...published.map((post) => ({
      url: absoluteUrl(site, `/posts/${post.slug}`),
      lastModified: new Date(lastModified(post)),
    })),
  ]
}
```

- [ ] **Step 5: Run tests**

Run: `pnpm test`
Expected: PASS.

- [ ] **Step 6: Create the app routes**

`src/app/robots.ts`:

```ts
import type { MetadataRoute } from 'next'
import { robotsRules } from '@/lib/robots'
import { site } from '@/lib/site'

export default function robots(): MetadataRoute.Robots {
  return robotsRules(site)
}
```

`src/app/sitemap.ts`:

```ts
import type { MetadataRoute } from 'next'
import { allPosts } from '@/lib/content'
import { site } from '@/lib/site'
import { sitemapEntries } from '@/lib/sitemap'

export default function sitemap(): MetadataRoute.Sitemap {
  return sitemapEntries(site, allPosts)
}
```

- [ ] **Step 7: Build and verify**

```bash
pnpm build
node_modules/.bin/next start -p 3999 & SERVER=$!
sleep 3
curl -s http://localhost:3999/robots.txt
curl -s http://localhost:3999/sitemap.xml | grep -o '<loc>[^<]*</loc>'
kill $SERVER
```

Expected: robots.txt has a `User-Agent: *` group, a group listing every crawler from `site.crawlers` (one `User-Agent:` line each), `Allow: /` in both, and `Sitemap: https://andrii.korkoshko.com/sitemap.xml`; the sitemap lists home, about, tags, the tag pages and both posts, with no `.md` URLs.

- [ ] **Step 8: Lint, typecheck, commit**

```bash
pnpm lint && pnpm typecheck
git add -A
git commit -m "feat: robots.txt with explicit crawler allow-list and sitemap" -m "Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>" -m "Claude-Session: https://claude.ai/code/session_015aiFug8n6PdHYPbSkkZzTS"
```

---

### Task 13: Post-build smoke script wired into CI

Implements the "Smoke" list in spec §10.

**Files:**
- Create: `scripts/smoke.ts`
- Modify: `package.json` (add `smoke` script), `.github/workflows/ci.yml` (run it after build)

**Interfaces:**
- Consumes: the built site (`pnpm build` must have run; reads `.velite/posts.json` for slugs), `node_modules/.bin/next start`.
- Produces: exit code 0 when every check passes, 1 otherwise, with one line per check.

- [ ] **Step 1: Create `scripts/smoke.ts`**

```ts
import { spawn } from 'node:child_process'
import { readFileSync } from 'node:fs'

const PORT = 3999
const BASE = `http://localhost:${PORT}`
const SITEMAP_URL = 'https://andrii.korkoshko.com/sitemap.xml'

type Post = { slug: string; draft: boolean }
type JsonLd = { '@type'?: string; '@id'?: string; author?: { '@id'?: string } }

const posts: Post[] = JSON.parse(readFileSync('.velite/posts.json', 'utf8'))
const published = posts.find((post) => !post.draft)
if (!published) {
  console.error('smoke: need at least one published post')
  process.exit(1)
}
const seed = published.slug
const failures: string[] = []

function check(name: string, ok: boolean, detail = '') {
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${name}${ok || !detail ? '' : ` (${detail})`}`)
  if (!ok) failures.push(name)
}

const contentType = (res: Response) => res.headers.get('content-type') ?? ''

function jsonLdBlocks(html: string): JsonLd[] {
  return [...html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs)].map((m) => JSON.parse(m[1]))
}

async function waitForServer() {
  for (let attempt = 0; attempt < 60; attempt++) {
    try {
      if ((await fetch(BASE)).ok) return
    } catch {
      // not up yet
    }
    await new Promise((resolve) => setTimeout(resolve, 1000))
  }
  throw new Error('smoke: server did not start within 60s')
}

async function run() {
  const robots = await (await fetch(`${BASE}/robots.txt`)).text()
  check('robots.txt allows GPTBot', /user-agent: GPTBot/i.test(robots))
  check('robots.txt names the sitemap', robots.includes(`Sitemap: ${SITEMAP_URL}`))

  const sitemap = await (await fetch(`${BASE}/sitemap.xml`)).text()
  check('sitemap lists the published post', sitemap.includes(`/posts/${seed}</loc>`))
  for (const draft of posts.filter((post) => post.draft)) {
    check(`sitemap hides draft ${draft.slug}`, !sitemap.includes(`/posts/${draft.slug}</loc>`))
  }
  check('sitemap has no markdown twins', !sitemap.includes('.md</loc>'))

  for (const path of ['/llms.txt', '/llms-full.txt']) {
    const res = await fetch(`${BASE}${path}`)
    check(`${path} is 200 text/plain`, res.ok && contentType(res).startsWith('text/plain'), contentType(res))
  }

  const twin = await fetch(`${BASE}/posts/${seed}.md`)
  const twinText = await twin.text()
  check('.md twin is text/markdown', twin.ok && contentType(twin).startsWith('text/markdown'), contentType(twin))
  check('.md twin starts with the front block', twinText.startsWith('---\ntitle: '))

  const negotiated = await fetch(`${BASE}/posts/${seed}`, { headers: { accept: 'text/markdown' } })
  check('Accept: text/markdown returns markdown', contentType(negotiated).startsWith('text/markdown'), contentType(negotiated))
  const twinIgnoringAccept = await fetch(`${BASE}/posts/${seed}.md`, { headers: { accept: 'text/html' } })
  check('.md twin ignores Accept', contentType(twinIgnoringAccept).startsWith('text/markdown'))

  const page = await fetch(`${BASE}/posts/${seed}`, { headers: { accept: 'text/html' } })
  const html = await page.text()
  check('Accept: text/html returns html', contentType(page).startsWith('text/html'), contentType(page))
  check(
    'post links its markdown alternate',
    html.includes('type="text/markdown"') && html.includes(`href="https://andrii.korkoshko.com/posts/${seed}.md"`),
  )

  const article = jsonLdBlocks(html).find((block) => block['@type'] === 'BlogPosting')
  check('post carries BlogPosting JSON-LD', article !== undefined)
  const aboutHtml = await (await fetch(`${BASE}/about`)).text()
  const person = jsonLdBlocks(aboutHtml).find((block) => block['@type'] === 'Person')
  check('About carries Person JSON-LD', person !== undefined)
  check(
    'BlogPosting author @id matches the Person @id',
    article?.author?.['@id'] !== undefined && article.author['@id'] === person?.['@id'],
    `${article?.author?.['@id']} vs ${person?.['@id']}`,
  )

  const rss = await (await fetch(`${BASE}/feed.xml`)).text()
  check('feed.xml has the seed post', rss.includes('<item>') && rss.includes(`/posts/${seed}`))
  const atom = await (await fetch(`${BASE}/atom.xml`)).text()
  check('atom.xml has the seed post', atom.includes('<entry>') && atom.includes(`/posts/${seed}`))
  const json = JSON.parse(await (await fetch(`${BASE}/feed.json`)).text()) as { items: { url: string }[] }
  check('feed.json has the seed post', json.items.some((item) => item.url.endsWith(`/posts/${seed}`)))

  check('unknown post is 404', (await fetch(`${BASE}/posts/definitely-missing`)).status === 404)
  check('unknown twin is 404', (await fetch(`${BASE}/posts/definitely-missing.md`)).status === 404)
}

async function main() {
  const server = spawn('node_modules/.bin/next', ['start', '-p', String(PORT)], { stdio: 'ignore' })
  try {
    await waitForServer()
    await run()
  } finally {
    server.kill()
  }
  if (failures.length > 0) {
    console.error(`\n${failures.length} smoke check(s) failed`)
    process.exit(1)
  }
  console.log('\nall smoke checks passed')
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
```

- [ ] **Step 2: Add the script** — in `package.json` scripts add `"smoke": "tsx scripts/smoke.ts"`.

- [ ] **Step 3: Run it against a fresh build**

Run: `pnpm build && pnpm smoke`
Expected: every line starts with `ok`, ending with `all smoke checks passed`. If a line says `FAIL`, fix the feature it names (Tasks 9–12), not the check.

- [ ] **Step 4: Prove it fails when something is wrong** — temporarily comment out the two rewrites in `next.config.ts`, run `pnpm build && pnpm smoke`, confirm `FAIL Accept: text/markdown returns markdown` and a non-zero exit, then restore the file (`git checkout next.config.ts`).

- [ ] **Step 5: Add to CI** — in `.github/workflows/ci.yml` append after `- run: pnpm build`:

```yaml
      - run: pnpm smoke
```

- [ ] **Step 6: Lint, typecheck, commit, push, watch CI**

```bash
pnpm lint && pnpm typecheck
git add -A
git commit -m "test: post-build smoke checks in CI" -m "Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>" -m "Claude-Session: https://claude.ai/code/session_015aiFug8n6PdHYPbSkkZzTS"
git push
gh run watch
```

Expected: the CI run passes including the smoke step.

---

### Task 14: IndexNow key and push workflow

Implements spec §7.8.

**Files:**
- Create: `public/<key>.txt`, `scripts/indexnow-lib.ts`, `scripts/indexnow.ts`, `tests/indexnow.test.ts`, `.github/workflows/indexnow.yml`

**Interfaces:**
- Consumes: `site.url`.
- Produces: `parseNameStatus(output): Change[]`, `slugFromFile(file): string | null`, `isDraftSource(source): boolean`, `findIndexNowKey(files): string | null`, `collectUrls(changes, baseUrl, readSource): { urls: string[]; added: string[] }`.

- [ ] **Step 1: Generate the key file** (the key is public by design; it only proves you control the host)

```bash
KEY=$(openssl rand -hex 16); printf '%s' "$KEY" > "public/$KEY.txt"; echo "$KEY"; ls public/*.txt
```

- [ ] **Step 2: Write the failing tests `tests/indexnow.test.ts`**

```ts
import { describe, expect, it } from 'vitest'
import { collectUrls, findIndexNowKey, isDraftSource, parseNameStatus, slugFromFile } from '../scripts/indexnow-lib'

describe('parseNameStatus', () => {
  it('parses A/M/D and expands renames into delete + add', () => {
    const out = 'A\tcontent/posts/a.mdx\nM\tcontent/posts/b.mdx\nD\tcontent/posts/c.mdx\nR100\tcontent/posts/old.mdx\tcontent/posts/new.mdx\n'
    expect(parseNameStatus(out)).toEqual([
      { status: 'A', file: 'content/posts/a.mdx' },
      { status: 'M', file: 'content/posts/b.mdx' },
      { status: 'D', file: 'content/posts/c.mdx' },
      { status: 'D', file: 'content/posts/old.mdx' },
      { status: 'A', file: 'content/posts/new.mdx' },
    ])
  })

  it('returns nothing for empty output', () => {
    expect(parseNameStatus('')).toEqual([])
  })
})

describe('slugFromFile', () => {
  it('maps post files to slugs and ignores everything else', () => {
    expect(slugFromFile('content/posts/hello-world.mdx')).toBe('hello-world')
    expect(slugFromFile('content/README.md')).toBeNull()
    expect(slugFromFile('content/posts/nested/x.mdx')).toBeNull()
  })
})

describe('isDraftSource', () => {
  it('detects draft: true inside the frontmatter only', () => {
    expect(isDraftSource('---\ntitle: "x"\ndraft: true\n---\nbody')).toBe(true)
    expect(isDraftSource('---\ntitle: "x"\ndraft: false\n---\nbody')).toBe(false)
    expect(isDraftSource('---\ntitle: "x"\n---\nbody')).toBe(false)
    expect(isDraftSource('---\ntitle: "x"\n---\ndraft: true')).toBe(false)
  })
})

describe('findIndexNowKey', () => {
  it('finds the 32-hex key file name', () => {
    const key = 'a'.repeat(32)
    expect(findIndexNowKey(['favicon.ico', `${key}.txt`, 'robots.txt'])).toBe(key)
    expect(findIndexNowKey(['favicon.ico'])).toBeNull()
  })
})

describe('collectUrls', () => {
  const sources: Record<string, string> = {
    'content/posts/added.mdx': '---\ntitle: "a"\n---\n',
    'content/posts/changed.mdx': '---\ntitle: "c"\n---\n',
    'content/posts/secret.mdx': '---\ntitle: "s"\ndraft: true\n---\n',
  }
  const read = (file: string) => sources[file]

  it('builds urls for published changes, skips drafts, keeps deletions, tracks additions', () => {
    const changes = parseNameStatus(
      'A\tcontent/posts/added.mdx\nM\tcontent/posts/changed.mdx\nA\tcontent/posts/secret.mdx\nD\tcontent/posts/gone.mdx\nM\tcontent/README.md\n',
    )
    expect(collectUrls(changes, 'https://andrii.korkoshko.com', read)).toEqual({
      urls: [
        'https://andrii.korkoshko.com/posts/added',
        'https://andrii.korkoshko.com/posts/changed',
        'https://andrii.korkoshko.com/posts/gone',
      ],
      added: ['https://andrii.korkoshko.com/posts/added'],
    })
  })
})
```

- [ ] **Step 3: Run to verify failure**

Run: `pnpm test tests/indexnow.test.ts`
Expected: FAIL — cannot resolve `../scripts/indexnow-lib`.

- [ ] **Step 4: Create `scripts/indexnow-lib.ts`**

```ts
export type Change = { status: 'A' | 'M' | 'D'; file: string }

/** Parses `git diff --name-status` output. A rename becomes a delete of the old path plus an add of the new one. */
export function parseNameStatus(output: string): Change[] {
  const changes: Change[] = []
  for (const line of output.split('\n')) {
    if (line.trim() === '') continue
    const [status, ...paths] = line.split('\t')
    const kind = status[0]
    if (kind === 'R') {
      changes.push({ status: 'D', file: paths[0] }, { status: 'A', file: paths[1] })
    } else if (kind === 'A' || kind === 'M' || kind === 'D') {
      changes.push({ status: kind, file: paths[0] })
    }
  }
  return changes
}

export function slugFromFile(file: string): string | null {
  const match = /^content\/posts\/([^/]+)\.mdx$/.exec(file)
  return match ? match[1] : null
}

/** True when the frontmatter block (between the first two `---` lines) contains `draft: true`. */
export function isDraftSource(source: string): boolean {
  const match = /^---\n([\s\S]*?)\n---/.exec(source)
  return match ? /^draft:\s*true\s*$/m.test(match[1]) : false
}

export function findIndexNowKey(files: string[]): string | null {
  const file = files.find((name) => /^[a-f0-9]{32}\.txt$/.test(name))
  return file ? file.slice(0, -'.txt'.length) : null
}

export function collectUrls(
  changes: Change[],
  baseUrl: string,
  readSource: (file: string) => string,
): { urls: string[]; added: string[] } {
  const urls: string[] = []
  const added: string[] = []
  for (const change of changes) {
    const slug = slugFromFile(change.file)
    if (!slug) continue
    if (change.status !== 'D' && isDraftSource(readSource(change.file))) continue
    const url = `${baseUrl}/posts/${slug}`
    if (!urls.includes(url)) urls.push(url)
    if (change.status === 'A') added.push(url)
  }
  return { urls, added }
}
```

- [ ] **Step 5: Run tests**

Run: `pnpm test`
Expected: PASS.

- [ ] **Step 6: Create `scripts/indexnow.ts`**

```ts
import { execFileSync } from 'node:child_process'
import { readdirSync, readFileSync } from 'node:fs'
import { site } from '../src/lib/site'
import { collectUrls, findIndexNowKey, parseNameStatus } from './indexnow-lib'

const ENDPOINT = 'https://api.indexnow.org/indexnow'

async function waitUntilLive(url: string) {
  for (let attempt = 0; attempt < 30; attempt++) {
    const res = await fetch(url, { method: 'HEAD', redirect: 'manual' }).catch(() => null)
    if (res?.status === 200) return
    await new Promise((resolve) => setTimeout(resolve, 20_000))
  }
  throw new Error(`indexnow: ${url} not live after 10 minutes`)
}

async function main() {
  const beforeEnv = process.env.BEFORE_SHA ?? ''
  const before = beforeEnv && !/^0+$/.test(beforeEnv) ? beforeEnv : 'HEAD~1'
  const after = process.env.AFTER_SHA || 'HEAD'

  const diff = execFileSync('git', ['diff', '--name-status', before, after, '--', 'content/posts'], {
    encoding: 'utf8',
  })
  const { urls, added } = collectUrls(parseNameStatus(diff), site.url, (file) => readFileSync(file, 'utf8'))
  if (urls.length === 0) {
    console.log('indexnow: no published post changes')
    return
  }

  const key = findIndexNowKey(readdirSync('public'))
  if (!key) throw new Error('indexnow: no <key>.txt in public/')

  for (const url of added) await waitUntilLive(url)

  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'content-type': 'application/json; charset=utf-8' },
    body: JSON.stringify({
      host: new URL(site.url).host,
      key,
      keyLocation: `${site.url}/${key}.txt`,
      urlList: urls,
    }),
  })
  console.log(`indexnow: HTTP ${res.status} for ${urls.length} url(s)\n${urls.join('\n')}`)
  if (!res.ok) throw new Error(`indexnow: ${res.status} ${await res.text()}`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
```

- [ ] **Step 7: Dry-run the script locally against the seed posts' commit range** (this really pings IndexNow; the site must be live from Task 8)

```bash
BEFORE_SHA=$(git log --format=%H --diff-filter=A -- content/posts/hello-world.mdx | tail -1)~1 AFTER_SHA=HEAD pnpm tsx scripts/indexnow.ts
```

Expected: `indexnow: HTTP 200` (or `202`) followed by the two post URLs.

- [ ] **Step 8: Create `.github/workflows/indexnow.yml`**

```yaml
name: IndexNow

on:
  push:
    branches: [main]
    paths:
      - 'content/posts/**'

jobs:
  ping:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 2
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm tsx scripts/indexnow.ts
        env:
          BEFORE_SHA: ${{ github.event.before }}
          AFTER_SHA: ${{ github.sha }}
```

- [ ] **Step 9: Lint, typecheck, commit, push**

```bash
pnpm lint && pnpm typecheck
git add -A
git commit -m "feat: IndexNow key and push-triggered submission workflow" -m "Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>" -m "Claude-Session: https://claude.ai/code/session_015aiFug8n6PdHYPbSkkZzTS"
git push
```

- [ ] **Step 10: Verify end to end** — after the deploy is live, `curl -s https://andrii.korkoshko.com/$(ls public/*.txt | xargs -n1 basename)` prints the key. Then make a trivial edit to `content/posts/hello-world.mdx` (add a sentence), commit, push, and `gh run list --workflow IndexNow --limit 1` → the run succeeds with `HTTP 200`.

---

### Task 15: Comments via Giscus

Implements the Giscus item in spec §2 and phase 2.

**Files:**
- Create: `src/components/comments.tsx`
- Modify: `src/app/posts/[slug]/page.tsx`, `src/lib/site.ts` (values)

- [ ] **Step 1: Enable Discussions and install the giscus app** (human)

```bash
gh api -X PATCH repos/Andreydemo/personal-blog -f has_discussions=true
```

Then install https://github.com/apps/giscus on `Andreydemo/personal-blog`, open https://giscus.app, enter the repo, pick the "General" category (or create "Comments" under repo → Discussions → Categories, type Announcements), and copy the generated `data-repo-id` and `data-category-id`.

- [ ] **Step 2: Fill `site.giscus` in `src/lib/site.ts`**

```ts
  giscus: {
    repo: 'Andreydemo/personal-blog',
    repoId: '<data-repo-id from giscus.app>',
    category: 'General',
    categoryId: '<data-category-id from giscus.app>',
  },
```

- [ ] **Step 3: Install and create `src/components/comments.tsx`**

```bash
pnpm add @giscus/react
```

```tsx
'use client'

import Giscus from '@giscus/react'
import { site } from '@/lib/site'

export function Comments() {
  const { repo, repoId, category, categoryId } = site.giscus
  if (!repoId || !repo.includes('/')) return null
  return (
    <section className="mt-16">
      <Giscus
        repo={repo as `${string}/${string}`}
        repoId={repoId}
        category={category}
        categoryId={categoryId}
        mapping="pathname"
        strict="1"
        reactionsEnabled="1"
        emitMetadata="0"
        inputPosition="top"
        theme="preferred_color_scheme"
        lang="en"
        loading="lazy"
      />
    </section>
  )
}
```

- [ ] **Step 4: Render it** — in `src/app/posts/[slug]/page.tsx` import `Comments` and add `<Comments />` after the closing `</footer>` inside `<article>`, only for published posts:

```tsx
      {!post.draft && <Comments />}
```

- [ ] **Step 5: Verify**

```bash
pnpm build
node_modules/.bin/next start -p 3999 & SERVER=$!
sleep 3
curl -s http://localhost:3999/posts/hello-world | grep -c 'giscus'
kill $SERVER
```

Expected: count ≥ 1. Open the deployed post in a browser after push: the comment box loads below the tags.

- [ ] **Step 6: Lint, typecheck, commit, push**

```bash
pnpm lint && pnpm typecheck && pnpm test
git add -A
git commit -m "feat: Giscus comments on published posts" -m "Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>" -m "Claude-Session: https://claude.ai/code/session_015aiFug8n6PdHYPbSkkZzTS"
git push
```

---

### Task 16: Search Console, Bing Webmaster Tools and production verification

Implements the indexing setup in spec §7.8, the verification tokens in §7.1, and the "post-deploy manual checklist" in §10. **Phase 2 is done when** every command below returns the expected value on production and both consoles show the sitemap.

**Files:**
- Modify: `src/app/layout.tsx` (verification metadata), `src/lib/site.ts` (tokens, only if using meta-tag verification)

- [ ] **Step 1: Support meta-tag verification** — in `src/app/layout.tsx` add to `metadata`:

```tsx
  verification: {
    ...(site.verification.google ? { google: site.verification.google } : {}),
    ...(site.verification.bing ? { other: { 'msvalidate.01': site.verification.bing } } : {}),
  },
```

Empty tokens render nothing; the DNS route in Step 2 does not need them.

- [ ] **Step 2: Google Search Console** (human)

1. https://search.google.com/search-console → Add property → **Domain** → `korkoshko.com` (a domain property covers `andrii.korkoshko.com` too).
2. Copy the `google-site-verification=...` value and add it at GoDaddy as a TXT record, host `@`.
3. Verify (may need up to an hour for DNS). Then Sitemaps → add `https://andrii.korkoshko.com/sitemap.xml`.
4. URL Inspection → `https://andrii.korkoshko.com/posts/hello-world` → Request indexing.

- [ ] **Step 3: Bing Webmaster Tools** (human)

1. https://www.bing.com/webmasters → Sign in → **Import from Google Search Console** → pick the property.
2. Sitemaps → confirm `https://andrii.korkoshko.com/sitemap.xml` is listed.
3. IndexNow (left menu) → confirm the key from Task 14 is recognised (it verifies `https://andrii.korkoshko.com/<key>.txt`).

- [ ] **Step 4: Confirm Vercel settings** (human) — Project → Settings → Firewall: the "AI Bots" managed ruleset is off (or "Log"), Attack Challenge Mode is off. Deployment Protection: Production is public; preview deployments keep Vercel's default `noindex` header.

- [ ] **Step 5: Production checks**

```bash
P=https://andrii.korkoshko.com
curl -sI https://korkoshko.com/posts/hello-world | grep -iE '^(HTTP|location)'
curl -sI -H 'Accept: text/markdown' $P/posts/hello-world | grep -iE '^(HTTP|content-type)'
curl -s $P/posts/hello-world.md | head -3
curl -s $P/robots.txt | grep -c 'User-Agent'
curl -s $P/llms.txt | head -3
curl -sI $P/feed.xml | grep -i '^content-type'
curl -s $P/sitemap.xml | grep -c '<loc>'
curl -s $P/posts/hello-world | grep -o '"@type":"BlogPosting"'
```

Expected: `308` + location on the primary; `HTTP/2 200` with `content-type: text/markdown; charset=utf-8`; the twin starts with `---`; ≥ 20 `User-Agent` lines; the llms header; `application/rss+xml; charset=utf-8`; ≥ 7 `<loc>` entries; the BlogPosting match.

- [ ] **Step 6: Structured-data check** — run https://validator.schema.org/ on `https://andrii.korkoshko.com/posts/hello-world` and on `/about`. Expected: no errors; `BlogPosting.author` resolves to the `Person` by `@id` (a warning that the referenced entity is not on the same page is acceptable).

- [ ] **Step 7: Commit and push**

```bash
pnpm lint && pnpm typecheck && pnpm test
git add -A
git commit -m "feat: search console and bing verification metadata" -m "Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>" -m "Claude-Session: https://claude.ai/code/session_015aiFug8n6PdHYPbSkkZzTS"
git push
```

---

## Author inputs (fill any time before Task 8's DNS switch; empty values are omitted safely)

In `src/lib/site.ts`: `social.linkedin`, `social.x`, `author.jobTitle` and `author.employer` (worded exactly as on LinkedIn), `author.image` (drop the file in `public/images/` and set the path), `author.bio`, `tagline`, `description`.

## Not in this plan

Phase 3 (profile links, syndication procedure, monthly AI-citation checklist) is a manual procedure; phase 4 (Supabase newsletter/reactions) needs its own spec. Site search, Ukrainian locale, CSP and Lighthouse CI are out of scope per spec §12.
