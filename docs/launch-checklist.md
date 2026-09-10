# Launch checklist and open items

Status as of 2026-09-10. Phases 1–2 of `docs/superpowers/specs/2026-09-09-personal-blog-design.md` are live at https://andrii.korkoshko.com. Tick items off here as they are done.

## Do now (dashboards, your logins)

- [x] **Giscus app.** Install https://github.com/apps/giscus on `Andreydemo/personal-blog`. Until then every published post shows a giscus error box instead of comments. Discussions are enabled and the IDs are already in `src/lib/site.ts`.
- [x] **Google Search Console.** Add a *Domain* property for `korkoshko.com` (covers `andrii.korkoshko.com`), verify with the TXT record it gives you at GoDaddy (host `@`), submit `https://andrii.korkoshko.com/sitemap.xml`, then URL Inspection → request indexing for the two posts.
- [ ] **Bing Webmaster Tools.** Sign in → *Import from Google Search Console*. Check Sitemaps lists the sitemap and IndexNow shows the key `db3967001a5037a893f96d2a56d5c33a` as verified. (Bing feeds ChatGPT search and Copilot.)
- [x] **Vercel.** Domains: `www.korkoshko.com` now redirects straight to `andrii.korkoshko.com`. Firewall: confirm the "AI Bots" managed ruleset is off and Attack Challenge Mode is off. Analytics: confirm Web Analytics is enabled.
- [ ] **Author inputs** in `src/lib/site.ts`: `author.jobTitle` and `author.employer` worded exactly as on LinkedIn; `author.image` (drop a headshot in `public/images/` and set the path); `social.x` if wanted. Each is a one-line edit; commit to `main` deploys it.
- [ ] **Structured data check** after the above: https://validator.schema.org/ on `/posts/hello-world` and `/about`; Google Rich Results Test on a post.

## Phase 3 — distribution (manual, ongoing)

- [ ] Link the site from the GitHub profile README, the LinkedIn website field, and any other profile bios.
- [ ] When syndicating a post to dev.to / Hashnode / Medium, set the canonical URL to the post on this site.
- [ ] Share new posts on LinkedIn and X; the markdown twin (`/posts/<slug>.md`) is handy for pasting into AI tools.
- [ ] Monthly AI-citation check: ask ChatGPT, Perplexity and Claude "who is Andrii Korkoshko" and two topic queries; note which sources they cite. Record results at the bottom of this file.
- [ ] After the first post edit or new post lands on `main`, check the IndexNow workflow run in GitHub Actions succeeded (HTTP 200/202).

## Deferred technical items (none block anything)

- [ ] Bump `actions/checkout`, `actions/setup-node` and `pnpm/action-setup` from v4 to v5 in both workflows (GitHub flags v4 as Node 20-based). Small PR; CI validates the tags.
- [ ] Bump `@types/node` to `^22` to match Node 22 and vitest's peer range.
- [ ] Footer: use `rel="alternate"` (not `rel="me"`) on the RSS link.
- [ ] `markdownTwin`: quote YAML tag values; the schema's kebab-case rule keeps them safe today.
- [ ] Velite fixture: add cases for a non-kebab slug and `updatedAt < publishedAt`.
- [ ] IndexNow script: also wait for *modified* URLs to show the new `dateModified` before pinging.

## Later phases (each gets its own spec)

- Phase 4: Supabase-backed newsletter signups and reactions with a weekly keep-alive job.
- Phase 5: research and scholarly profile (ORCID hub, claimed Google Scholar / Semantic Scholar / OpenAlex, DOIs for old papers, `/research` section with `ScholarlyArticle` data and `citation_*` meta tags, citation counts at build time). Inputs needed: the PDFs plus title, venue, year and co-authors per paper.

## AI-citation log

| Date | Query | Engine | Cited this site? | Notes |
|---|---|---|---|---|
