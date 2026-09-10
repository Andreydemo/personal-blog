@AGENTS.md

# Project orientation (personal blog)
- Design spec: `docs/superpowers/specs/2026-09-09-personal-blog-design.md`; what has been done and every identifier (DOIs, ORCID, profile IDs): `docs/journal/`; open items: `docs/launch-checklist.md`.
- Writing/publishing posts, citations, diagrams, papers with DOIs, PDF reports, ORCID updates: see the skills in `.claude/skills/` (`blog-post`, `blog-citations`, `blog-diagrams`, `publish-research`, `tech-report`, `orcid-profile`).
- Tags: the registry in `src/lib/tags.ts` (sections shown in the nav + topics, each with a description) is the only source of allowed tags; the content schema rejects unknown tags and posts without a section. Search lives at `/posts` (client-side over metadata).
- `private/` is git-ignored and holds local-only inputs (CV export, employment table, Zenodo token). Never commit it or paste its contents into commits.
- Companion library for the SSRF post: `~/development/side/ssrf-guard` (github.com/Andreydemo/ssrf-guard).
