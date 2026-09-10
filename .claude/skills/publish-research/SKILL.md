---
name: publish-research
description: Use when a post or project should become a citable publication with a DOI, when asked to "publish on Zenodo", get a DOI, archive a release, or cross-link a paper with its code, CITATION.cff and the blog
---

# Publishing a post as a citable record

A blog post is not citable by the indexes. What is: a **publication record on Zenodo** whose file is the PDF, cross-linked to a **software record** for the code. Google Scholar and OpenAlex index the publication record; ORCID pulls it in via DataCite. The software record alone is a zip and reads as weak.

**REQUIRED SUB-SKILL:** tech-report (to produce the PDF). Token: `private/zenodo.token` (git-ignored; scopes `deposit:write`, `deposit:actions`).

## Order of operations

1. **Code first.** Public repo with `CITATION.cff` (`type: software`, author with `orcid: https://orcid.org/…`, `repository-code`, `license`). Enable the repo in Zenodo's GitHub page **before** tagging; only releases after that are archived. Create the GitHub release with the PDF attached. Zenodo mints the software DOI (version) and a concept DOI (all versions).
2. **Reserve the paper's DOI.** `POST https://zenodo.org/api/deposit/depositions` with `{}` → `id`, `links.bucket`, `metadata.prereserve_doi.doi`.
3. **Stamp and build the PDF** with that DOI on the title page (tech-report). Cite the software DOI inside the report's references.
4. **Upload:** `curl -X PUT "$BUCKET/report.pdf" --upload-file report.pdf -H "Authorization: Bearer $T"` — expect HTTP 201 with `key`/`size`; then `GET /api/deposit/depositions/{id}` must list the file. Publish fails with `files.enabled` if the upload silently failed.
5. **Metadata** (`PUT /api/deposit/depositions/{id}`), inside `{"metadata": {...}}`:
   - `upload_type: "publication"`, `publication_type: "report"` (valid values: `report`, `technicalnote`, `preprint`, `article`, `workingpaper`, `other`; `technicalreport` is rejected)
   - `title`, `description` (HTML abstract + companion links), `creators: [{name: "Last, First", orcid: "0000-…"}]`, `keywords`, `license: "cc-by-4.0"`, `access_right: "open"`, `version`, `publication_date`, `language: "eng"`
   - `prereserve_doi: true` (keeps the reserved DOI)
   - `related_identifiers`: paper **`isSupplementedBy`** the software DOI (`scheme: doi`, `resource_type: software`) and the release URL; paper **`isDerivedFrom`** the post URL. Direction matters: the paper is supplemented by the code, not the reverse.
6. **Publish:** `POST /api/deposit/depositions/{id}/actions/publish`; verify with `GET https://zenodo.org/api/records/{id}` (creators carry the ORCID, `files` has the PDF).
7. **Cross-link back:** `CITATION.cff` gains `doi` (software) and `preferred-citation` (`type: report`, the paper DOI); README gets both DOI badges (`https://zenodo.org/badge/DOI/<doi>.svg`); the post's cite-this block gets the report (APA line + `@techreport`) and the software (`@software`); the release asset is replaced with the stamped PDF (`gh release upload --clobber`).
8. **ORCID:** enable Works → Add → Import from other services → DataCite once; future records self-file. Otherwise "Add work with a DOI".

Do not edit the GitHub-archived software record's files (that mints a new version); metadata-only edits keep the DOI.

## What the report may claim

The evaluation section must describe only tests that exist in the archived artifact; tests run elsewhere are labelled as such. A DOI-archived document cannot be corrected silently.

## Common mistakes

- Publishing the software record and calling it the paper.
- Uploading with `--data-binary` and not checking the response; the deposition ends up empty.
- Relation direction reversed (`isSupplementTo` on the paper).
- Forgetting `prereserve_doi: true` in the metadata PUT, which can drop the reserved DOI.
- Storing the token anywhere but `private/`.
