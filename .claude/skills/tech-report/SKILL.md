---
name: tech-report
description: Use when a post or notes must become a print-quality PDF (technical report, whitepaper, preprint) on this machine, with rendered Mermaid diagrams and a title page carrying author, ORCID and DOI
---

# Building a PDF technical report

Pipeline (no LaTeX needed): Markdown → pandoc standalone HTML with print CSS and a Mermaid script → headless Google Chrome → PDF. Diagrams stay vector SVG. A working copy of every file lives in `~/development/side/ssrf-guard/docs/` (`report.md`, `report.css`, `mermaid-head.html`, `build-pdf.sh`); copy those rather than re-deriving them.

## Source shape (`report.md` front matter)

```yaml
title: "…"
subtitle: "Technical report, version 1.0. DOI: https://doi.org/10.5281/zenodo.NNN. Code: https://github.com/…"
author: "Andrii Korkoshko ([ORCID 0000-0002-4567-5584](https://orcid.org/0000-0002-4567-5584))"
date: "10 September 2026"
abstract: |
  One paragraph.
keywords: [a, b]
lang: en
```

Body: numbered `#` sections (Introduction, Threat model/Background, Design, Implementation notes, Evaluation, Related work, Conclusion, References). References as a numbered list with URLs; cite inline as `[n]`. Keep ```mermaid fences as in the post; add an italic *Figure n.* caption line after each.

## Build

```bash
pandoc report.md -s --css report.css --embed-resources --include-in-header mermaid-head.html \
  --metadata pagetitle="…" -o report.html
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --disable-gpu \
  --no-pdf-header-footer --virtual-time-budget=10000 --run-all-compositor-stages-before-draw \
  --print-to-pdf="$PWD/report.pdf" "file://$PWD/report.html"
```

`mermaid-head.html` loads Mermaid as an ES module from jsdelivr, runs it on `pre.mermaid`, and sets `data-mermaid-done` on the root; the virtual-time budget lets that finish before printing. `report.css` sets `@page` A4 with margins, serif body at 11pt, sans headings, wrapped `pre`, and `pre.mermaid svg { max-width: 100% }`.

## Verify (no PDF rasteriser is installed)

- `chrome --headless=new --dump-dom file://…/report.html | grep -c '<pre class="mermaid"[^>]*><svg'` → 1 per diagram.
- `sips -s format png -Z 1400 report.pdf --out p1.png` renders page 1; view it to check the title block.
- Page count: `python3 -c "import re;print(len(re.findall(rb'/Type\s*/Page[^s]',open('report.pdf','rb').read())))"`.

## Common mistakes

- Rasterising diagrams to PNG: blurry and larger; the inline SVG route works.
- Building before the DOI is reserved, then re-uploading a different PDF than the one archived.
- Claiming evaluation results that are not in the accompanying artifact (see publish-research).
- Leaving `report.html` in the repo; the build script deletes it.
