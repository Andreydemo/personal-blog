---
name: blog-diagrams
description: Use when a post needs a diagram, flow, sequence or architecture picture, or when asked to add or fix a diagram in content/posts
---

# Diagrams in posts

Diagrams are Mermaid in a fenced ```mermaid block. The site renders them to SVG in the browser and keeps the Mermaid source in the server HTML, the markdown twin, feeds and `llms-full.txt`, so crawlers and AI readers get the diagram as text. Never add images of diagrams.

## Choosing the type

| Showing | Use |
|---|---|
| Steps or data flow | `flowchart LR` (wide) or `flowchart TD` (tall) |
| Who talks to whom over time, attacks, handshakes | `sequenceDiagram` |
| Modes and transitions | `stateDiagram-v2` |

One diagram per idea. If it needs more than ~12 nodes or 10 messages, split it or cut it.

## Fitting the page

Content is 700px wide. Keep node labels to a few words, edge labels to two or three, and prefer `TD` when there are more than five nodes in a row. Quote labels that contain punctuation: `A["GET /posts/x (HTML)"]`. No HTML in labels; the renderer runs Mermaid in strict security mode and strips it.

## Placement

Introduce it with one sentence ("The sequence the DNS hook stops:"), then the fence, then continue. The prose must still make sense with the diagram removed.

## Verify

`pnpm build && pnpm smoke` includes a check that a post containing ```mermaid serves the source in its HTML. Open the page locally (`node_modules/.bin/next start -p 3999`) and confirm the SVG renders and fits without horizontal scrolling on a narrow window. A Mermaid syntax error shows the raw source instead of a picture; fix the syntax rather than removing the diagram.
