# Journal: second publication, "Agents as internal services" (10 September 2026)

Second post-plus-report cycle, run with the `blog-post`, `blog-citations`, `blog-diagrams`, `publish-research` and `tech-report` skills. Differences from the SSRF cycle are noted because they change the routine.

## What was published

| Artifact | Identifier |
|---|---|
| Post | https://andrii.korkoshko.com/posts/agents-as-internal-services (`content/posts/agents-as-internal-services.mdx`, tags engineering / ai-agents / llm / mcp) |
| Technical report (Zenodo, Report, CC BY 4.0, PDF, ORCID on creator, `isDerivedFrom` the post) | DOI **10.5281/zenodo.22698236**, https://zenodo.org/records/22698236 |
| Report source and PDF | `docs/reports/agents-as-internal-services/` (`report.md`, `report.css`, `mermaid-head.html`, `build-pdf.sh`, `report.pdf`, 11 pages) |

Source draft: `~/Desktop/agent-written-context-for-another-llm.md` (second version, domain-neutral). The first version was a story about one vendor guide and was rejected by the author as too domain-specific; the second states a reusable pattern (pinned mode, generated MCP tool gateway, generated context as a build artifact) and that is what made it a report rather than a war story.

## Decisions

- **No software record.** The system is proprietary, so the publication record relates only to the post. The `publish-research` skill's "code first" step is skipped when there is no public artifact; the report's limitations section says so explicitly.
- **Report source lives in the blog repo** under `docs/reports/<slug>/` when there is no companion repo. The pipeline files are copies of the ssrf-guard ones plus table CSS and a `pre.mermaid svg { max-height: 200mm }` cap so a tall diagram cannot overflow an A4 page.
- **Evidence kept, domain removed.** The author's rewrite dropped the three-run comparison table. The report carries a domain-neutral version (tool reachable, numeric parameters within the baseline range, record-derived rules, absence-as-directive, patterns found) so that the report has evidence without product numbers. The post does not carry the table; its "Technical report" section says the report adds it.
- **Diagrams.** The draft's `flowchart LR` with three subgraphs rendered 2300px wide; rebuilt as `flowchart TD` (764px). The five-participant sequence diagram stayed over 1100px wide however the labels were shortened, so the job path became a six-node `flowchart TD`; the bullets carry the detail. A `%%{init: {"flowchart": {"rankSpacing": …}}}%%` directive did not render at all in the pandoc → Chrome pipeline; do not rely on it.
- **Publish gate.** The author asked for the full flow ("let's go full train") after reading the assessment, so the Zenodo publish and the post publish ran without a second review stop.

## Verification run

`pnpm typecheck && pnpm lint && pnpm test && pnpm build && pnpm smoke` green (55 tests, all smoke checks including the Mermaid-source check on the new post). PDF: two inline SVG diagrams confirmed via `--dump-dom`, page 1 rendered with `sips`, full HTML screenshot reviewed for Figure 1, Figure 2 and Table 1; post page screenshot on `next start -p 3999` confirmed both diagrams render client-side and the draft carried `noindex`. Zenodo: bucket upload HTTP 201 with `key`/`size`, metadata PUT 200 with `prereserve_doi` intact, publish, then `GET /api/records/22698236` read back with creators, related identifiers and the PDF.

## Open items

- Add DOI 10.5281/zenodo.22698236 to ORCID (Works → Add → Add DOI), or enable the DataCite import once so future records self-file.
- Syndicate the post (Hacker News, Lobsters, dev.to with canonical).
