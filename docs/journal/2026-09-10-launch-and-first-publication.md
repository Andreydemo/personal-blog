# Journal: launch and first publication (9–10 September 2026)

What was built, decided and published across the first two days, with the identifiers that matter. Later entries go in this folder as `YYYY-MM-DD-<topic>.md`.

## 1. The blog (phases 1–2 of the spec)

- Spec: `docs/superpowers/specs/2026-09-09-personal-blog-design.md`; plan: `docs/superpowers/plans/2026-09-09-personal-blog-phases-1-2.md`. Executed as 16 tasks with a task review after each and a whole-branch review at the end (Next.js 16.3, Velite, Tailwind v4, vitest, pnpm).
- Live at https://andrii.korkoshko.com since 2026-09-09. `korkoshko.com` and `www` redirect there (301). DNS stays at GoDaddy with records pointing to Vercel (A `216.198.79.1` for the apex, CNAME `cname.vercel-dns.com` for `andrii` and `www`).
- Repo: https://github.com/Andreydemo/personal-blog (public). Deploys from `main` via Vercel; CI runs typecheck, lint, 55 tests, build and a 26-check smoke suite; a second workflow pings IndexNow for changed posts.
- Visibility layer: markdown twins (`/posts/<slug>.md`, `Accept: text/markdown`), RSS/Atom/JSON feeds, `llms.txt` and `llms-full.txt`, JSON-LD (Person `@id` `https://andrii.korkoshko.com/about#person`, BlogPosting with inlined author, WebSite, BreadcrumbList, ProfilePage), robots.txt allow-list for 19 crawlers, sitemap, generated OG images, security headers, Giscus comments (Discussions category "Announcements"), Mermaid diagrams rendered client-side with the source kept in HTML.
- Identity links in `src/lib/site.ts` (`social` + `profiles`, all in Person `sameAs`): GitHub, LinkedIn, ORCID, Google Scholar, Semantic Scholar, OpenAlex, AD Scientific Index. Title: "Member of Technical Staff", Starbridge.
- Google Search Console verified via DNS TXT; Bing Webmaster and the giscus app installed. Favicon: AK monogram (`src/app/icon.svg`, `favicon.ico`, `apple-icon.png`).

## 2. Posts

| Post | Status |
|---|---|
| `hello-world` | published 2026-09-09 |
| `how-this-blog-is-built-for-ai-crawlers` | published 2026-09-09 |
| `your-webhook-feature-is-an-ssrf-feature` | published 2026-09-10; 18 references, cite-this block with report + software + post entries, rebinding sequence diagram |

## 3. Companion library and technical report

- Library: https://github.com/Andreydemo/ssrf-guard (Kotlin/JVM, Apache-2.0, group `com.korkoshko`, 20 tests, CI, `CITATION.cff`, Maven publishing metadata, JitPack coordinates). Release `v0.1.0` with the report PDF attached.
- Zenodo software record (from the GitHub integration): DOI `10.5281/zenodo.22697765`, concept DOI `10.5281/zenodo.22697764`.
- Zenodo publication record (Report, CC BY 4.0, PDF as the file, ORCID on the creator, "is supplemented by" the software DOI, "is derived from" the post): DOI **`10.5281/zenodo.22698040`**, https://zenodo.org/records/22698040. This is the citable paper; `CITATION.cff` names it as `preferred-citation`.
- Report source `docs/report.md` in the library repo; PDF built by `docs/build-pdf.sh` (pandoc → HTML with `report.css` and a Mermaid script → headless Chrome → PDF). Title page carries author, ORCID and the DOI.
- Lesson recorded by the review: a report archived under a DOI must only claim tests that exist in the artifact it accompanies. §5 of the report was corrected before publication.

## 4. Scholar identity

- ORCID `0000-0002-4567-5584`: works = the 2016 KhPI paper (`10.20998/2411-0558.2016.44.15`) and the ssrf-guard software DOI (the report arrives via the DataCite import or "Add DOI"); education = NTU "KhPI" (added by the author); employment = nine entries from the LinkedIn export, created with visibility "only me" for verification (see `private/orcid-employment.md`, git-ignored).
- Google Scholar profile `dPLg93QAAAAJ`, Semantic Scholar author 73742191, OpenAlex `A5051435817`.

## 5. Skills in `.claude/skills/`

`blog-post`, `blog-citations`, `blog-diagrams` (writing and publishing posts); `publish-research`, `tech-report`, `orcid-profile` (paper + DOI workflow, PDF reports, ORCID updates). All built test-first with a baseline run and a verification run.

## 6. Open items

See `docs/launch-checklist.md`. Highest value next: flip the ORCID employment entries to "Everyone", enable the DataCite import on ORCID, add the headshot and X handle to `site.ts`, syndicate the SSRF post (Hacker News, Lobsters, r/netsec, dev.to with canonical), and start phase 5 (research section) once the PDFs of the university papers are at hand.
