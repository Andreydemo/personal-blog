# Personal blog for Andrii Korkoshko — design spec

Date: 2026-09-09
Status: approved design, awaiting implementation plan
Primary URL: https://andrii.korkoshko.com
Redirected URL: https://korkoshko.com (and www) → primary, permanent redirect

## 1. Goal and success criteria

Build a personal blog that maximizes the author's visibility in both classic
search engines and AI answer engines (ChatGPT search, Perplexity, Claude,
Google AI Mode, Bing Copilot), on free infrastructure, with content the author
fully owns and controls.

Success looks like:

- Every page is complete, crawlable HTML with no JavaScript required to read it.
- The author is an unambiguous entity: one canonical "About" page with
  `Person` structured data linking to GitHub, LinkedIn and X.
- Every post is available as HTML and as a raw markdown twin, discoverable by
  URL suffix, `Accept: text/markdown` negotiation, `llms.txt` and feeds.
- New or changed posts are pushed to Bing/Yandex/Naver via IndexNow within
  minutes of deploy; Google receives a sitemap with `lastmod`.
- Zero recurring cost. Vercel Hobby plan, GoDaddy DNS already owned.
- Author writes MDX in the IDE, commits to `main`, and the site deploys.

## 2. Decisions and rationale

| Decision | Choice | Why |
|---|---|---|
| Framework | Next.js 16.3 (App Router, TypeScript) | Author's choice. Vercel-native, prerenders everything, Metadata API, `next/og`, header-conditional rewrites in `next.config`. |
| Starting point | `create-next-app`, not a fork of a starter | The popular Tailwind Next.js starter is Contentlayer-based (stalled) with unclear Next 16 support. We copy its good patterns instead of inheriting its opinions. |
| Content layer | Velite (Zod-typed MDX collections) | Maintained replacement for Contentlayer; build fails on bad frontmatter; emits raw markdown, HTML and compiled MDX from one source. |
| Styling | Tailwind CSS v4 + `@tailwindcss/typography` | Minimal, readable article typography with little custom CSS. |
| Toolchain | pnpm, Node 22 LTS, ESLint + Prettier, vitest | Matches Vercel's supported runtime; one lockfile committed. |
| Hosting | Vercel Hobby, Git integration on GitHub, production branch `main` | Free for personal non-commercial use; 100 GB bandwidth; preview deployments are `noindex` automatically. |
| Language | English only | Largest audience; Ukrainian can be added later as a locale. |
| Authoring | MDX files in `content/posts/`, published by committing to `main` | No CMS, no database, full history in git. |
| Database | Supabase deferred to phase 4 | Free tier pauses after 7 idle days; nothing on the read path may depend on it. |
| Comments | Giscus (GitHub Discussions), phase 2 | No database, developer-friendly, free. Requires a public GitHub repo with Discussions enabled. |
| Analytics | Vercel Web Analytics | Free on Hobby, no cookie banner needed. |
| DNS | Stays at GoDaddy, pointing directly at Vercel | Cloudflare now blocks AI training/agent crawlers by default for new zones. We do not proxy through Cloudflare. |

## 3. Constraints and assumptions

- Vercel Hobby is for non-commercial personal use. Ads or sponsorships would
  require the Pro plan. Cron jobs on Hobby run at most once per day.
- The GoDaddy Website Builder placeholder currently on `korkoshko.com` is
  replaced; repointing the apex A record takes it down. This is intended.
- The blog repository is public on GitHub (needed for Giscus and useful for
  footprint). If the author prefers a private repo, Giscus uses a separate
  public repo instead.
- The author is the only author. All topics (engineering, opinions, politics,
  other) live on one domain, distinguished by tags. AI summaries of the author
  will draw on everything published here.
- Post slugs never change after publication. Renames are done with a
  permanent redirect in `next.config`.

## 4. Architecture

### 4.1 Rendering model

Fully static. All pages are prerendered at build time via
`generateStaticParams`. Feeds, `llms.txt`, `llms-full.txt`, `robots.txt`,
`sitemap.xml` and the markdown twins are route handlers with
`dynamic = 'force-static'`. No code runs per request; only Vercel's routing
layer (rewrites, redirects, headers) is evaluated at the edge.

Velite runs as a separate step (`velite && next build`; `velite --watch`
alongside `next dev`) and writes typed JSON to `.velite/`, which the app
imports. `.velite/` is git-ignored.

### 4.2 Repository layout

```
content/posts/<slug>.mdx           one file per post; slug = file name
src/app/
  layout.tsx                       root layout: header, footer, analytics,
                                   WebSite JSON-LD, feed + markdown alternates
  page.tsx                         home: short intro, latest posts
  about/page.tsx                   entity home: bio, links, Person + ProfilePage JSON-LD
  posts/[slug]/page.tsx            post page: BlogPosting + BreadcrumbList JSON-LD
  posts/[slug]/og/route.tsx        generated OG image (title, date, author), static
  md/[slug]/route.ts               markdown twin, Content-Type text/markdown
  tags/page.tsx                    all tags with counts
  tags/[tag]/page.tsx              posts for one tag
  feed.xml/route.ts                RSS 2.0, full content
  atom.xml/route.ts                Atom 1.0, full content
  feed.json/route.ts               JSON Feed 1.1, full content
  llms.txt/route.ts                llms.txt index
  llms-full.txt/route.ts           all posts as markdown, concatenated
  robots.ts                        robots.txt
  sitemap.ts                       sitemap.xml
  not-found.tsx                    404 page
src/lib/
  site.ts                          site config: name, URL, bio, social URLs,
                                   featured tags, verification tokens, crawler list
  posts.ts                         accessors over Velite output (published, sorted, by tag)
  jsonld.ts                        builders for Person, WebSite, BlogPosting, BreadcrumbList, ProfilePage
  markdown.ts                      markdown-twin serializer (YAML front block + body)
  feeds.ts                         RSS/Atom/JSON feed builders
  llms.ts                          llms.txt / llms-full.txt builders
src/components/                    PostCard, PostList, Prose, TagList, Byline, Giscus (phase 2)
src/components/mdx-components.tsx  MDX component map (links)
velite.config.ts                   content schema
next.config.ts                     rewrites, redirects, headers
public/<indexnow-key>.txt          IndexNow key file (public by design)
scripts/smoke.ts                   post-build smoke checks
scripts/indexnow.ts                IndexNow submitter used by the workflow
tests/                             vitest unit tests
.github/workflows/ci.yml           typecheck, lint, test, build, smoke
.github/workflows/indexnow.yml     ping IndexNow on content changes to main
docs/superpowers/specs/            this spec
docs/superpowers/plans/            implementation plans
```

## 5. Content model

### 5.1 Frontmatter schema (Velite, Zod)

| Field | Type | Rules |
|---|---|---|
| `title` | string | required, 1–110 chars |
| `description` | string | required, 50–160 chars; doubles as the answer-first summary and meta description |
| `publishedAt` | ISO date | required |
| `updatedAt` | ISO date | optional; must be ≥ `publishedAt` |
| `tags` | string[] | required, 1–6 items, lowercase kebab-case |
| `draft` | boolean | default `false` |
| `cover` | image path | optional; shown at top of post; OG image is always generated from title |

Derived by Velite: `slug` (from file name, must be unique and kebab-case),
`readingTime` (words / 200), `raw` (source markdown), `html` (markdown
compiled to HTML for feeds), `code` (compiled MDX for the page), `toc`.

Build fails on: invalid frontmatter, duplicate slug, non-kebab slug or tag,
`updatedAt` before `publishedAt`.

### 5.2 Drafts

`draft: true` posts are excluded from listings, tag pages, feeds, sitemap,
`llms*.txt` and IndexNow. They are still built at `/posts/<slug>` so the author
can preview them on preview deployments (which Vercel marks `noindex`). Draft
pages also carry a `noindex, nofollow` robots meta tag.

### 5.3 Editorial conventions (documented in `content/README.md`)

- `description` states the post's answer or thesis in one or two sentences.
  It is rendered as the lead paragraph.
- No H1 in the body; the title is the H1. Section headings are H2/H3, phrased
  as questions or claims where natural.
- Posts longer than ~1200 words open with a "Key takeaways" bullet list.
- Visible byline linking to `/about`, visible published and updated dates in
  `<time datetime>`.
- Prefer plain markdown. Custom MDX components are the exception, because the
  markdown twin, feeds and `llms-full.txt` are produced from the raw source.
- Link to sources and to related posts on this site.

## 6. Routes

| URL | Content | Notes |
|---|---|---|
| `/` | intro + latest 10 posts | WebSite JSON-LD |
| `/about` | bio, photo, roles, links | Person (`@id` = `/about#person`) + ProfilePage JSON-LD |
| `/posts/<slug>` | post | BlogPosting + BreadcrumbList; `link rel=alternate type=text/markdown` |
| `/posts/<slug>.md` | markdown twin | rewrite → `/md/<slug>` |
| `/posts/<slug>` + `Accept: text/markdown` | markdown twin | header-conditional rewrite → `/md/<slug>` |
| `/tags` | all tags | |
| `/tags/<tag>` | posts for a tag | featured tags linked from nav: `engineering`, `opinions`, `politics` |
| `/feed.xml`, `/atom.xml`, `/feed.json` | feeds, full content, newest 50 | advertised in `<head>` |
| `/llms.txt` | site index for agents | llmstxt.org format |
| `/llms-full.txt` | every published post as markdown | |
| `/robots.txt`, `/sitemap.xml` | | |
| `/<indexnow-key>.txt` | key file | static |
| anything else | 404 | |

No trailing slashes. Canonical URLs are always `https://andrii.korkoshko.com/...`.

## 7. Visibility layer

### 7.1 Metadata (Next Metadata API)

`metadataBase` = primary URL. Title template `%s | Andrii Korkoshko`; home
title is just the name plus tagline. Every page sets `description`,
`alternates.canonical`, Open Graph (`type: article` on posts with published
and modified times, authors, tags) and Twitter card. Root layout advertises
`alternates.types` for RSS, Atom and JSON Feed. Post pages add the
`text/markdown` alternate. Search Console and Bing verification tokens come
from `site.ts` and are emitted as `verification` metadata.

### 7.2 Structured data (JSON-LD, built in `jsonld.ts`)

- **Person** on `/about`: `@id` `https://andrii.korkoshko.com/about#person`,
  `name`, `url`, `image`, `jobTitle`, `worksFor`, `sameAs` (GitHub, LinkedIn,
  X). Wording of title and employer matches LinkedIn exactly.
- **ProfilePage** on `/about` with `mainEntity` → Person.
- **WebSite** on `/`: `name`, `url`, `author`/`publisher` → Person by `@id`.
- **BlogPosting** on each post: `headline`, `description`, `datePublished`,
  `dateModified`, `keywords`, `image` (`/posts/<slug>/og`), `mainEntityOfPage`,
  `author` → Person by `@id`, `wordCount`.
- **BreadcrumbList** on each post: Home → post title.

Rendered as `<script type="application/ld+json">` in the page. Builders are
typed with `schema-dts` and unit-tested.

### 7.3 Markdown twins and negotiation

`src/app/md/[slug]/route.ts` returns, for published and draft posts alike:

```
---
title: <title>
description: <description>
author: Andrii Korkoshko
author_url: https://andrii.korkoshko.com/about
canonical: https://andrii.korkoshko.com/posts/<slug>
published: <YYYY-MM-DD>
updated: <YYYY-MM-DD or omitted>
tags: [a, b]
---

<raw markdown body>
```

Headers: `Content-Type: text/markdown; charset=utf-8`, `Vary: Accept`.
Caching is Next's static-output default; no custom `Cache-Control`.
Unknown slug → 404.

`next.config.ts` rewrites, both in `beforeFiles`:

1. `source: '/posts/:slug\\.md'` → `destination: '/md/:slug'` (the dot is escaped for path-to-regexp)
2. `source: '/posts/:slug'`, `has: [{ type: 'header', key: 'accept', value: '.*text/markdown.*' }]` → `/md/:slug`

Vercel's CDN keys its cache on the `Accept` header by default, so HTML and
markdown variants never collide. The post-build smoke test asserts both paths.

### 7.4 Feeds

RSS 2.0 (`content:encoded`), Atom 1.0 (`content type="html"`), JSON Feed 1.1
(`content_html`). Full compiled HTML from Velite's `html`, absolute URLs,
newest 50 published posts, author name and link on every item, `lastBuildDate`
= newest `updatedAt`/`publishedAt`.

### 7.5 llms.txt and llms-full.txt

`/llms.txt`: `# Andrii Korkoshko`, blockquote summary from `site.ts`, a short
paragraph on who the author is and what the site covers, then sections
`## Posts` (each line `- [title](markdown twin URL): description`), `## About`
(link to `/about`), `## Feeds` (the three feed URLs).
`/llms-full.txt`: concatenation of every published markdown twin separated by
a horizontal rule, newest first.

### 7.6 Crawl policy (`robots.ts`)

Allow everything for `*`, plus explicit `Allow: /` groups for each agent in
`site.ts` `crawlers`: Googlebot, Bingbot, GPTBot, OAI-SearchBot, ChatGPT-User,
ClaudeBot, Claude-SearchBot, Claude-User, anthropic-ai, PerplexityBot,
Perplexity-User, Google-Extended, Applebot, Applebot-Extended, Amazonbot,
CCBot, DuckAssistBot, Meta-ExternalAgent, YouBot. `Sitemap:` line points to
`/sitemap.xml`. A unit test asserts every listed agent appears.

Vercel project settings: AI Bot managed ruleset stays disabled (or in log
mode); Attack Challenge Mode off. These are dashboard settings and are listed
in the phase 1 checklist.

### 7.7 Sitemap

`sitemap.ts` lists `/`, `/about`, `/tags`, each tag page and each published
post with `lastModified` = `updatedAt ?? publishedAt`. Markdown twins and
feeds are not listed.

### 7.8 Indexing pushes

`indexnow.yml` runs on `push` to `main` when paths under `content/posts/`
changed:

1. Checkout with `fetch-depth: 2`; `git diff --name-only HEAD~1 HEAD -- content/posts`
   → slugs (added, modified and deleted). Added or modified files whose
   frontmatter contains `draft: true` are skipped; deleted files cannot be
   inspected and are always submitted.
2. Map to `https://andrii.korkoshko.com/posts/<slug>`. Deleted files are
   submitted too so engines recrawl and drop them.
3. For added slugs, poll the production URL until it returns 200 (every 20 s,
   up to 10 min) so the ping does not race the Vercel deploy.
4. POST to `https://api.indexnow.org/indexnow` with `host`, `key`,
   `keyLocation` and `urlList`. The key is the file name in `public/`, read
   from the repo; no secret needed.
5. Non-2xx response fails the workflow visibly. It never affects the deploy.

Google: sitemap submitted once in Search Console (domain property for
`korkoshko.com`, verified by DNS TXT at GoDaddy, which covers the subdomain).
Bing Webmaster Tools imports the Search Console property.

### 7.9 Security headers (`next.config.ts` `headers`)

`X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`,
`Permissions-Policy` minimal. HSTS is added by Vercel. No CSP in v1 (Giscus
iframe and analytics would need allow-listing; revisit later).

## 8. Domains and DNS

Vercel project domains:

| Domain | Role |
|---|---|
| `andrii.korkoshko.com` | primary (production) |
| `korkoshko.com` | redirect to primary, permanent (308) |
| `www.korkoshko.com` | redirect to primary, permanent (308) |

GoDaddy DNS records:

| Host | Type | Value |
|---|---|---|
| `andrii` | CNAME | `cname.vercel-dns.com` |
| `www` | CNAME | `cname.vercel-dns.com` |
| `@` | A | Vercel's apex IP as shown in the Vercel domain dialog (currently `76.76.21.21`) |

Remove the GoDaddy Website Builder A records for `@` and the existing `www`
CNAME. Vercel issues TLS for all three hosts. HTTP → HTTPS is handled by
Vercel. Path is preserved on redirect (`korkoshko.com/posts/x` →
`andrii.korkoshko.com/posts/x`).

## 9. Error handling and edge cases

- Invalid content fails `velite` and therefore the build; Vercel keeps the
  previous deployment live.
- Unknown post slug on `/posts/...`, `/posts/....md` or `/md/...` → 404 page.
- `Accept: text/markdown` on non-post routes is ignored (rewrite is scoped to
  `/posts/:slug`).
- Trailing-slash URLs are redirected by Next.js defaults to the canonical form.
- A post with no `cover` still gets a generated OG image.
- Feeds and llms endpoints with zero published posts render valid, empty
  documents (build must not fail on an empty site).
- IndexNow API failure surfaces as a failed workflow run; content is still live.
- Giscus outage or ad-blocker only removes the comments block.

## 10. Testing

Unit (vitest, `tests/`):

- `markdown.ts`: front block fields, omission of `updated` when absent, body
  passthrough, deterministic output.
- `jsonld.ts`: each builder produces the expected `@type`, `@id` references and
  ISO dates; snapshot per builder.
- `robots.ts` output includes every configured crawler and the sitemap URL.
- `feeds.ts`/`llms.ts`: exclude drafts, sort newest first, cap at 50, absolute URLs.
- `posts.ts`: draft filtering, tag grouping, sorting.

Content validation: Velite schema runs on every build; a fixture-based test
asserts that a malformed post fails.

Smoke (`scripts/smoke.ts`, run in CI after `next build` against `next start`):

- `/robots.txt` contains `GPTBot` and the sitemap line.
- `/sitemap.xml` lists every published post and no draft.
- `/llms.txt` and `/llms-full.txt` return 200 with `text/plain`.
- `/posts/<seed>.md` returns `text/markdown` with the front block.
- `/posts/<seed>` with `Accept: text/markdown` returns markdown; with
  `Accept: text/html` returns HTML; `/posts/<seed>.md` with either Accept
  value returns markdown.
- Post page contains a parseable `BlogPosting` JSON-LD block whose `author.@id`
  matches the About page's Person `@id`.
- `/feed.xml`, `/atom.xml`, `/feed.json` parse and contain the seed post.
- Unknown slug returns 404 on both HTML and markdown routes.

CI (`ci.yml`): `pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm build`,
`pnpm smoke` on every push and pull request.

Post-deploy manual checklist (phase 1 and 2): curl the redirect from
`korkoshko.com`, curl the markdown negotiation on production, run the Rich
Results test on a post, confirm Search Console and Bing see the sitemap.

## 11. Phases and deliverables

**Phase 1 — live site.** Scaffold, Velite schema, layout and typography,
home, post page, tags, About with Person JSON-LD, two seed posts, GitHub repo,
Vercel project, DNS, redirects, analytics, CI. Done when
`https://andrii.korkoshko.com` serves the site and `https://korkoshko.com`
redirects to it.

**Phase 2 — visibility layer.** Markdown twins and negotiation, feeds,
`llms*.txt`, robots, sitemap, full JSON-LD set, OG images, security headers,
IndexNow workflow, Search Console and Bing setup, Giscus. Done when the smoke
suite passes in CI and on production.

**Phase 3 — distribution.** Site linked from GitHub profile README, LinkedIn
website field and X bio; syndication procedure for dev.to/Hashnode/Medium with
canonical links; a monthly AI-citation check documented in
`docs/visibility-checklist.md` (ask ChatGPT, Perplexity and Claude "who is
Andrii Korkoshko" and two topic queries; record which sources are cited).

The implementation plan written from this spec covers phases 1 and 2.
Phase 3 is a procedure plus one checklist document. Phase 4 gets its own spec.

**Phase 4 — dynamic extras (Supabase).** Newsletter signups and reactions in
Supabase with a weekly GitHub Actions keep-alive ping; optional Resend for
sending. Separate spec.

**Phase 5 — Research and scholarly profile (future, own spec).** The author
has university-era research papers and a public scholar profile at
https://adscientificindex.com/scientist/andrii-korkoshko/5051663/ and wants
a large expansion of that side of the public profile. Expected shape, to be
brainstormed when the phase starts: a `content/papers/` Velite collection
(title, authors, venue, year, DOI, abstract, PDF, tags) rendered at
`/research` and `/research/<slug>` with `ScholarlyArticle` JSON-LD linked to
the Person `@id`; self-hosted PDFs with `citation_*` meta tags so Google
Scholar indexes them; a downloadable BibTeX per paper; ORCID, Google Scholar,
Semantic Scholar and AD Scientific Index URLs added to the Person `sameAs`
list; a research section in `llms.txt` and the sitemap. Adding the AD
Scientific Index URL to `sameAs` is done in phase 2 already.

## 12. Out of scope for this spec

Site search UI, Ukrainian locale, Keystatic or any web editor, Supabase and
newsletter, CSP, Lighthouse CI, ads or monetization.

## 13. Inputs required from the author before phase 1 ships

Values for `src/lib/site.ts`: GitHub profile URL, LinkedIn profile URL, X
handle (optional), headshot image, 2–3 sentence bio, job title and employer
worded exactly as on LinkedIn, one-line tagline. Defaults are placeholders
that the author replaces; the build does not depend on them.
