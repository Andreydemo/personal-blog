# Journal: tags, search and UX pass (10 September 2026, evening)

Three commits after the third post went live, all on `main`.

## Contents block (commit `175d845`)
`rehype-slug` gives every heading an id; Velite's `toc` (H2 only) renders as a numbered "Contents" nav on posts with five or more sections (`src/lib/toc.ts`, `src/components/table-of-contents.tsx`).

## Tag registry, archive search, related posts (commit `e6ca061`)
- `src/lib/tags.ts` is the only source of allowed tags: sections `engineering`, `ai`, `opinions`, `politics` (nav) and topics `security`, `seo`, `meta`, `agents`, `mcp`, `prompting`, `chatgpt`, `claude`, each with a description. The content schema rejects unknown tags and posts without a section (fixtures under `tests/fixtures/unknown-tag` and `no-section`).
- Renamed `ai-agents` → `agents`, dropped `llm`; permanent redirects for both old URLs in `next.config.ts`.
- `/posts`: archive with client-side search over title, description, tags and headings; the URL query string is the state (`useSyncExternalStore`, no effects), so the header search box can submit to it. `/tags` groups sections and topics with descriptions and counts; tag pages show their description. Posts end with "Tagged" and a Related block ranked by shared tags (`relatedPosts` in `src/lib/posts.ts`).

## UX pass (this commit)
- Nav: Engineering · AI · Opinions · Politics · Posts · About, active item marked with `aria-current`, search box with a `/` shortcut and a visible hint. Skip link to `#main`.
- Headings show a hover `#` anchor; fenced code blocks get a Copy button (`src/components/code-block.tsx`); Mermaid fences still render as diagrams.
- Post cards show reading time. Footer has site links and the correct `rel` values (`me` for profiles, `alternate` for RSS).
- Inline code no longer shows the typography plugin's decorative backticks.

## Verification
Unit tests 70 (registry, search, ranking, reading time, toc, two schema fixtures), lint, build, smoke (now 40+ checks incl. archive, tags index, redirect, nav, skip link, copy button, heading anchors), screenshots of the archive with a live query, tags index, tag page, code blocks and footer, and production checks after each deploy.

## Known gap
Phone layout at 375px is unverified: headless Chrome on this Mac floors the window at ~500px. Needs device emulation; the header nav may need to wrap differently. Tracked in `docs/launch-checklist.md`.
