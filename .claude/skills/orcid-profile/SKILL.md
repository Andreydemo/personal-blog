---
name: orcid-profile
description: Use when adding or fixing employment, education or works on the author's ORCID record (0000-0002-4567-5584), or when ORCID data must be entered in bulk from a CV or LinkedIn export
---

# Updating the ORCID record

The public API (`pub.orcid.org`) is read-only and the member API needs an institutional client, so writes go through ORCID's own web app endpoints using the author's logged-in browser session. This is an undocumented internal interface: keep runs small, create entries as **"only me"** (`PRIVATE`) and let the author verify and flip them public in the dashboard.

## Inputs

- Employment/education rows: `private/orcid-employment.md` (git-ignored) or a fresh LinkedIn export PDF (`pypdf` extracts the text: `PdfReader(...).pages[i].extract_text()`).
- Session: ask the author for any "Copy as cURL" request from orcid.org while logged in. Save the `-b` cookie string to `private/orcid-cookies.txt` (mode 600) and delete it when done. The CSRF header is `x-xsrf-token: <value of the XSRF-TOKEN cookie>`.

## Endpoints (session cookies + `accept: application/json`, `referer: https://orcid.org/my-orcid?orcid=…`, browser user-agent, `origin: https://orcid.org`)

| Purpose | Call |
|---|---|
| Empty form template | `GET https://orcid.org/affiliations/affiliation.json` |
| Create | `POST https://orcid.org/affiliations/affiliation.json` with the filled template as JSON |
| Read one back | `GET https://orcid.org/affiliations/affiliationDetails.json?id=<putCode>&type=employment` |
| Public record | `GET https://pub.orcid.org/v3.0/<orcid>/record` (`Accept: application/json`) — private entries are absent by design |

Fill the template's `{"value": …}` fields: `affiliationName`, `city`, `region` (US: state name; UA: oblast), `country` (ISO-2), `roleTitle`, `affiliationType` (`employment` | `education`), `url`, `departmentName` (may be empty); `startDate`/`endDate` as `{"year": "2024", "month": "08", "day": ""}` (empty end = present); `visibility.visibility = "PRIVATE"`. Organizations not found in ROR are entered by name; ROR-matched ones also carry `disambiguatedAffiliationSourceId` and `disambiguationSource: "ROR"`.

Success = response has `putCode.value` and every field's `errors` list is empty. Stop at the first failure; do not retry blindly.

## Works

Prefer the dashboard: Works → Add → "Add work with a DOI". Enable Works → Add → Import from other services → **DataCite** once so Zenodo records with the author's iD self-file. Crossref DOIs (journal papers) also import through "Search & link".

## Common mistakes

- Guessing the payload; always start from the template GET.
- Creating entries as public before the author has checked cities and dates.
- Leaving the cookie file on disk, or pasting cookies into chat or commits.
- Expecting private entries in the public API.
