# Launch checklist and open items

Status as of 2026-09-10 (evening). Phases 1–2 of `docs/superpowers/specs/2026-09-09-personal-blog-design.md` are live at https://andrii.korkoshko.com. Tick items off here as they are done. Growth work (search, AI engines, syndication) is planned in `docs/traffic-plan.md`; what was built and when is in `docs/journal/`.

## Shipped since launch (2026-09-10)

- Three posts: SSRF (with the ssrf-guard library and Zenodo report DOI 10.5281/zenodo.22698040), agents as internal services (Zenodo report DOI 10.5281/zenodo.22698236), the prompting guide.
- Contents block with heading anchors on long posts; tag registry with sections and topics; `/posts` archive with search; `/tags` index with descriptions; Related posts; nav with Posts, active state and `/` search shortcut; skip link; code-block Copy buttons; reading time on cards; footer links.
- Accessibility: contrast and touch-target fixes (Lighthouse a11y 93 → 100); archive page in the sitemap; `@types/node` 22; schema fixtures for unknown tags, missing section, non-kebab slug and `updatedAt < publishedAt`; markdown twins quote YAML tag values.

## Do now (dashboards, your logins)

- [x] **Giscus app.** Install https://github.com/apps/giscus on `Andreydemo/personal-blog`. Until then every published post shows a giscus error box instead of comments. Discussions are enabled and the IDs are already in `src/lib/site.ts`.
- [x] **Google Search Console.** Add a *Domain* property for `korkoshko.com` (covers `andrii.korkoshko.com`), verify with the TXT record it gives you at GoDaddy (host `@`), submit `https://andrii.korkoshko.com/sitemap.xml`, then URL Inspection → request indexing for the two posts.
- [ ] **Bing Webmaster Tools.** Sign in → *Import from Google Search Console*. Check Sitemaps lists the sitemap and IndexNow shows the key `db3967001a5037a893f96d2a56d5c33a` as verified. (Bing feeds ChatGPT search and Copilot.)
- [x] **Vercel.** Domains: `www.korkoshko.com` now redirects straight to `andrii.korkoshko.com`. Firewall: confirm the "AI Bots" managed ruleset is off and Attack Challenge Mode is off. Analytics: confirm Web Analytics is enabled.
- [x] **Author inputs**: job title, employer and the scholar profile links are in `src/lib/site.ts`.
- [ ] **Still open in `site.ts`**: `author.image` (headshot in `public/images/`) and `social.x` if wanted.
- [ ] **ORCID**: set the nine employment entries to "Everyone"; enable Works → Add → Import from other services → DataCite (auto-adds future Zenodo records).
- [ ] **ORCID**: add the second report, DOI `10.5281/zenodo.22698236` (Works → Add → Add DOI), unless the DataCite import above has picked it up.
- [ ] **Syndicate the SSRF post**: Hacker News, Lobsters, r/netsec, dev.to (canonical link back).
- [ ] **Syndicate the agents post** (`/posts/agents-as-internal-services`): Hacker News, Lobsters, dev.to (canonical link back), LinkedIn.
- [ ] **Syndicate the prompting guide** (`/posts/how-to-prompt-chatgpt-and-claude`): LinkedIn, dev.to (canonical link back), r/ChatGPT and r/ClaudeAI if the mods allow guides.
- [ ] **Prompting guide, quarterly**: re-check the plan table against https://openai.com/chatgpt/pricing/ and https://claude.com/pricing and bump `updatedAt`.
- [ ] **Structured data check** (Lighthouse SEO is 100; this is the rich-results view): https://validator.schema.org/ on `/posts/hello-world` and `/about`; Google Rich Results Test on a post.

## Phase 3 — distribution (manual, ongoing; routine and targets in `docs/traffic-plan.md`)

- [ ] Weekly 10-minute check: Search Console Pages and Queries, Vercel Analytics referrers (see the plan).
- [ ] **Analytics**: Vercel Web Analytics is live (project → Analytics tab; 30-day window, 50k events/month on Hobby). Decided 2026-09-10: add Umami Cloud (free, 100k events, 6-month history) later, around month three, when comparing posts over time matters; needs a website ID from a free account.
- [ ] Link the site from the GitHub profile README, the LinkedIn website field, and any other profile bios.
- [ ] When syndicating a post to dev.to / Hashnode / Medium, set the canonical URL to the post on this site.
- [ ] Share new posts on LinkedIn and X; the markdown twin (`/posts/<slug>.md`) is handy for pasting into AI tools.
- [ ] Monthly AI-citation check: ask ChatGPT, Perplexity and Claude "who is Andrii Korkoshko" and two topic queries; note which sources they cite. Record results at the bottom of this file.
- [ ] After the first post edit or new post lands on `main`, check the IndexNow workflow run in GitHub Actions succeeded (HTTP 200/202).

## Deferred technical items (none block anything)

- [ ] Bump `actions/checkout`, `actions/setup-node` and `pnpm/action-setup` from v4 to v5 in both workflows (GitHub flags v4 as Node 20-based). Small PR; CI validates the tags.
- [x] Bump `@types/node` to `^22` to match Node 22 and vitest's peer range.
- [x] Footer: use `rel="alternate"` (not `rel="me"`) on the RSS link.
- [x] `markdownTwin`: quote YAML tag values.
- [x] Velite fixture: add cases for a non-kebab slug and `updatedAt < publishedAt`.
- [ ] IndexNow script: also wait for *modified* URLs to show the new `dateModified` before pinging.
- [ ] Mobile layout: check a long post at 375px with real device emulation (headless Chrome on macOS floors the window at ~500px, so screenshots at 400px are not evidence either way); the header nav may need to wrap.

## Later phases (each gets its own spec)

- Phase 4: Supabase-backed newsletter signups and reactions with a weekly keep-alive job.
- Phase 5: research and scholarly profile (ORCID hub, claimed Google Scholar / Semantic Scholar / OpenAlex, DOIs for old papers, `/research` section with `ScholarlyArticle` data and `citation_*` meta tags, citation counts at build time). Inputs needed: the PDFs plus title, venue, year and co-authors per paper.

## AI-citation log

| Date | Query | Engine | Cited this site? | Notes |
|---|---|---|---|---|
