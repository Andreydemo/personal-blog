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
