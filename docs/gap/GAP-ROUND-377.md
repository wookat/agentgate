# GAP-ROUND-377 — advisory round: two new VulDB SSRF CVEs (106 → 108)

Date: 2026-08-10. Advisory count after this round: 108.

## Watch window — nine candidates, two true hits

Authenticated GHSA watch returned nine hits in the 8-day window. Three were
already in `advisories/watch-ignore.json` (round 374). Six new candidates,
each mapped against the repo's actual published package name:

**True hits (added):**

- **MCPA-2026-0093** — KoboldCPP-MCP-Server SSRF (CVE-2026-19373,
  GHSA-m2hf-r4mh-rrq8, low 5.3). npm **server-koboldai@1.0.0** (author
  Phiality = PhialsBasement) — tarball unpacked: every tool accepts an
  `apiUrl` argument interpolated straight into `fetch()` URLs in
  `makeRequest` with no allowlist. No fixed release → last_affected 1.0.0.
- **MCPA-2026-0094** — article-scraper-mcp SSRF (CVE-2026-19375,
  GHSA-wmf6-8cmx-6fp6, medium 6.3). PyPI **article-scraper-mcp@1.0.0**
  (project_urls → dmitriiweb/article-scraper-mcp) — wheel unpacked:
  `fetch_article` validates `url` only against `^https?://.+` before
  `requests.get()`. No fixed release → last_affected 1.0.0.

**False positives (added to watch-ignore):**

- GHSA-g33v-9g6g-xm9p (adafap/api-mcp): commit-addressed GitHub-only; the
  npm `api-mcp@0.0.1` is an empty "Reserved for future use" placeholder.
- GHSA-pxv6-pv74-gcg3 (Handwriting-OCR): package.json name
  `handwriting-ocr` never published to npm.
- GHSA-g57q-682f-hr5f (Nikolaibibo/claude-comfyui-mcp): package.json name
  `comfyui-mcp` maps to artokun's different npm project (0.50.x).
- GHSA-w5g7-c885-pm69 (bartekke8it56w2/new-mcp): package.json name
  `@modelcontextprotocol/server-gemini-thinking` never published.

## Other windows

- OSV exports: npm ETag unchanged (e31fe9a2…), PyPI ETag unchanged
  (df798022…) since round 374.

## Validation

`node api/scripts/validate.mjs` (108 valid), bundle regenerated
(`packages/core/src/advisories/data.ts`, `api/src/data.json`),
comparison-page count 106 → 108, full `pnpm build/test/lint/typecheck`
green.
