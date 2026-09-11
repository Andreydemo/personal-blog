# Traffic plan: search, AI engines and distribution

Written 2026-09-10 after the technical SEO audit. Review monthly; log results at the bottom.

## Where we stand

Lighthouse on the live prompting guide, mobile emulation, 2026-09-10:

| Category | Score |
|---|---|
| SEO | 100 |
| Performance | 98 |
| Best practices | 100 |
| Accessibility | 93 → fixed to 100 the same day (contrast, touch targets) |

Everything technical is in place: canonical URLs, titles and descriptions, BlogPosting and Person JSON-LD with `sameAs`, breadcrumbs, OG images, sitemap with `lastmod` (archive, tag pages, posts), robots allow-list for 19 crawlers, RSS/Atom/JSON feeds, markdown twins, `llms.txt`, IndexNow on every publish, Google Search Console and Bing. More technical work will not move traffic. Content and links will.

## The three levers

### 1. Write for queries (one post in three)

- Pick the query first. Sources: Search Console → Performance → Queries with impressions but no clicks; "how to", "vs", "checklist", "example" phrasings around what we already wrote; questions readers ask in comments or at work.
- On the page: the query phrase in the title, the first sentence and the slug; question-style H2s (they match "People also ask"); a Key takeaways list; 1,500–2,500 words with worked examples; a source for every claim (the `blog-citations` skill).
- Internal links: two or three inline links to other posts with descriptive anchor text, in the body, not only the Related block. Add them to older posts when a new one lands.
- Freshness: guides get an `updatedAt` bump when facts change (the plan table in the prompting guide is on a quarterly re-check).

Candidate query-shaped posts, in rough priority:

| Working title | Query it targets | Builds on |
|---|---|---|
| SSRF protection checklist for webhooks (Java/Kotlin) | "ssrf webhook", "ssrf protection java" | SSRF post, ssrf-guard |
| How to turn an OpenAPI spec into MCP tools | "openapi to mcp", "mcp server from openapi" | Agents post |
| Claude vs ChatGPT for coding in 2026 | "claude vs chatgpt coding" | Prompting guide |
| How to get a DOI for a blog post or report (Zenodo) | "doi for blog post", "zenodo doi report" | publish-research skill |
| Add a table of contents to a Next.js MDX blog | "next.js mdx table of contents" | This site's code |
| How to make a blog readable by AI crawlers (llms.txt, markdown twins) | "llms.txt example", "blog ai crawlers" | Crawlers post (refresh it) |

### 2. Links from places we control

| Link | Status |
|---|---|
| ssrf-guard README → SSRF post | done |
| Zenodo records → posts | done (two records) |
| GitHub profile README → site | open |
| LinkedIn website field → site | open |
| ORCID "websites" field → site | open |
| X bio → site | open (no handle on the site yet) |
| Google Scholar / Semantic Scholar homepage fields → site | open |

### 3. Syndication routine, per post

| When | Where | How |
|---|---|---|
| Day 0 | LinkedIn, X | Two-sentence hook plus the link; reply to comments for 48 h |
| Day 1 | dev.to (and Medium import if wanted) | Full text, canonical URL set to the post here |
| Day 1–3 | Hacker News, Lobsters (technical posts only) | Plain title, no marketing; be around to answer |
| Day 1–3 | Subreddits that allow guides (r/netsec, r/ChatGPT, r/ClaudeAI, r/ExperiencedDevs) | Follow each sub's self-promotion rule; skip if it does not fit |
| Any time | Answer questions on Stack Overflow / GitHub issues where a post is the honest answer | Link once, with context |

## Measurement

- Weekly, 10 minutes: Search Console → Pages (indexed count, any "Discovered, not indexed"), Queries (impressions by query, position); Vercel Analytics → top pages and referrers.
- Per publish: request indexing in Search Console (URL Inspection); confirm the IndexNow workflow returned 200/202.
- Monthly: the AI-citation check in `docs/launch-checklist.md` (ask ChatGPT, Perplexity and Claude "who is Andrii Korkoshko" plus two topic queries; record who cites what).

Targets for the first quarter (a new domain; Google is slow at first):

| By | Target |
|---|---|
| 2 weeks | All published posts indexed in Google and Bing |
| 30 days | First impressions on a non-brand query |
| 90 days | 100 organic sessions/month; one post ranking on page 1 for its query |

## Not doing

FAQ rich results (Google no longer shows them for sites like this), keyword stuffing, padding posts to a word count, paid or exchanged links, AI-written filler. Nothing that would make the posts worse for a human reader.

## Log

| Date | What changed | Result |
|---|---|---|
| 2026-09-10 | Audit; a11y fixes; archive added to sitemap | Lighthouse SEO 100 / perf 98 |
