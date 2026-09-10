---
name: blog-citations
description: Use when a post states facts, standards, numbers or quotes, when asked to add references, sources or citations to a post, or when a post needs a "cite this article" block
---

# Citations in posts

Every factual claim points at a primary source, and every post ends with a citable record of itself.

## Form

- **Inline link at first mention.** Link the phrase itself: `per [RFC 6598](https://www.rfc-editor.org/rfc/rfc6598)`. No `[1]`-style markers in the body.
- **`## References`** as a numbered list, one line each: author or organisation, linked title, year when known. Group closely related items on one line.
- **`## Cite this article`** as the last section:

````markdown
Korkoshko, A. (2026, September 10). *Post title.* andrii.korkoshko.com. https://andrii.korkoshko.com/posts/<slug>

```bibtex
@misc{korkoshko2026shortslug,
  author       = {Korkoshko, Andrii},
  title        = {Post title with {Acronyms} braced},
  year         = {2026},
  month        = sep,
  howpublished = {\url{https://andrii.korkoshko.com/posts/<slug>}},
  note         = {Blog post}
}
```
````

BibTeX key: `korkoshko<year><two or three words from the slug>`, lowercase, no separators.

## Choosing sources

| Claim about | Cite |
|---|---|
| Internet standards, address ranges, protocols | The RFC at `rfc-editor.org`, plus the IANA registry when one exists |
| Vulnerability classes | MITRE CWE entry, OWASP cheat sheet or Top 10 |
| Library or platform behaviour | The vendor's own docs for the version used |
| Decisions by bodies (ICANN, W3C) | The body's resolution or spec; Wikipedia only as a summary alongside it |

Fetch every URL before citing it and confirm it says what the sentence claims. A source that cannot be fetched is not cited.

## Common mistakes

- Citing a blog post that itself cites the RFC. Go to the RFC.
- Marker citations (`[3]`) with no inline link: readers and crawlers lose the link at the claim.
- Unbraced acronyms in BibTeX titles (`SSRF` becomes `ssrf` in some styles).
- A dated APA line that does not match `publishedAt`.
