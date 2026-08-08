---
title: Contributing advisories
description: How to submit a new MCP advisory to the public database via pull request.
---

The [advisory database](/advisories/) is community-maintained and PR-driven. Every entry must describe a **real, verifiable** incident or vulnerability in an MCP server/package — no speculative or unverifiable reports.

## What qualifies

- A CVE / GHSA affecting an MCP server, SDK, or MCP-adjacent package.
- A documented malicious package (e.g. a registry-removed backdoor) with public write-ups.
- A vendor security bulletin for an MCP integration.

Every advisory needs at least one **authoritative reference**: CVE/NVD record, GHSA, vendor bulletin, or the original researcher's disclosure. Blog spam or a lone social-media post is not sufficient.

## Steps

1. Fork the repo and create `advisories/MCPA-YYYY-NNNN.json` — take the next free number for the year of publication. The filename must equal the `id`.
2. Fill in the fields per the [advisory schema](/docs/spec/advisory-schema/): affected packages with OSV-style version ranges (`introduced` / `fixed` / `last_affected`), `severity`, `type`, `references`, `timeline`. Only state dates and versions your references actually support. When no fixed release exists (vendor hasn't patched, or the product is discontinued — e.g. post-sunset Flowise advisories), use `last_affected` rather than guessing a `fixed` version.
3. Validate locally:

   ```bash
   cd api
   npm install
   npm run validate    # schema check, unique IDs, filename == id
   ```

4. Open a PR using the **advisory template** (`.github/PULL_REQUEST_TEMPLATE/advisory.md` — append `?template=advisory.md` to the PR-creation URL). CI runs the same validation automatically.

## Review criteria

Maintainers check that:

- every claim (versions, dates, behavior) is backed by a linked reference;
- the version ranges match what the fix/announcement says;
- `severity` follows the source's CVSS where available, otherwise a justified judgment call;
- the summary is neutral and factual.

Once merged, the entry is automatically published to the website, the [JSON/RSS feeds](/advisories/), and the [query API](/docs/spec/advisory-api/) on the next deploy.
