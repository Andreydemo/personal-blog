---
name: blog-post
description: Use when writing, editing or publishing a post on this blog (content/posts/*.mdx), including turning notes or a draft into a post, or when asked to "publish" something here
---

# Writing and publishing a post

Posts are MDX files in `content/posts/<slug>.mdx`, validated by Velite at build time. The slug is the file name and never changes after publishing. **Every post is committed as a draft first and published in a second commit.**

**REQUIRED SUB-SKILLS:** blog-citations (any post that states facts or cites sources), blog-diagrams (any post with a diagram).

## Frontmatter contract

| Field | Rule |
|---|---|
| `title` | 1–110 chars, quoted |
| `description` | 50–160 chars; the post's thesis in one or two sentences. Rendered as the lead paragraph and meta description |
| `publishedAt` | `"YYYY-MM-DD"` quoted |
| `updatedAt` | optional, on or after `publishedAt`; set it when editing a published post |
| `tags` | 1–6, lowercase kebab-case. Featured tags: `engineering`, `opinions`, `politics` |
| `draft` | `true` on the first commit, always |
| `cover` | optional, relative image path |

## Shape of a post

1. Lead paragraph: the situation and the claim, no throat-clearing.
2. `**Key takeaways**` bullet list when the body exceeds ~1200 words.
3. `##` sections phrased as questions or claims. No `#` H1 in the body.
4. Code in fences with a language; diagrams per blog-diagrams.
5. `## References` then `## Cite this article` per blog-citations.
6. First person, plain, concrete. Link related posts on this site.

## Publish flow

1. Write with `draft: true`. Run `pnpm typecheck` (validates frontmatter without a build).
2. `pnpm build && pnpm smoke` — all lines `ok`.
3. Commit to `main` and push. The draft deploys unlisted with `noindex` at `https://andrii.korkoshko.com/posts/<slug>` for review; the IndexNow workflow skips drafts.
4. After the author approves: set `draft: false`, commit, push. That push deploys it, lists it, and the IndexNow workflow submits the URL.

Never set `draft: false` in the same commit that creates the post.

| Rationalization | Reality |
|---|---|
| "It's short, no review needed" | Draft-first is how the author sees the live rendering before it is indexed. |
| "The author asked to publish, so skip the draft" | "Publish" means the two-commit flow; the second commit is the publish. |
| "I validated locally, that is the review" | Validation checks the schema, not the writing. |

## Verify before reporting

`pnpm typecheck && pnpm lint && pnpm test && pnpm build && pnpm smoke`, then a `git status --short` that shows only the intended files (never `.velite/`, `public/static/`, `.next/`).
