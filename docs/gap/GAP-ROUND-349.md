# GAP-ROUND-349 — advisory batch: MCPA-2026-0088/0089 (101 → 103)

## Watch window

Authenticated GHSA watch surfaced 8 new candidates (all VulDB-sourced CVEs published
2026-08-09). OSV npm/PyPI export ETags unchanged (npm `e31fe9a2…`, PyPI `c18a1fdc…`).

## Added (2) — npm-mapped, sources verified

- **MCPA-2026-0088** — `@pimzino/spec-workflow-mcp` approvals `categoryName` path
  traversal (CVE-2026-19336 / GHSA-xgwr-j735-3wg4, medium). Verified: public PoC
  issue #220 (filePath is sanitized but categoryName is joined unsanitized under
  the approvals dir before `fs.writeFile`), fix PR #222 merged to main
  (validateSimplePathSegment/safeJoin, repo version 2.2.7) but **npm latest is
  still 2.2.5** — recorded as `last_affected: 2.2.5`; range updates to `fixed`
  when a fixed build ships.
- **MCPA-2026-0089** — `@adenot/mcp-google-search` `read_webpage` SSRF
  (CVE-2026-19337 / GHSA-jg2j-2qmx-58vq, low). Verified in source: tool passes
  caller-controlled `url` straight to `axios.get` with string-only validation
  (src/index.ts); upstream issue #11 open, no fix — `last_affected: 0.3.1`.

Package identity confirmed by cloning both upstream repos and matching
`package.json` names (`@pimzino/spec-workflow-mcp`, `@adenot/mcp-google-search`).

## Ignored (6) — no npm/PyPI mapping (mapping bar, rationale in watch-ignore.json)

CVE-2026-19333 (NightTrek/Supabase-MCP), 19331 (bazylhorsey/obsidian-mcp-server),
19330 (advanced-reasoning-mcp), 19332 (MCP4EDA), 19334 (NightTrek/Ollama-mcp),
19329 (codex_mcp): commit-addressed or unpublished GitHub-only projects. The npm
packages with similar names (`supabase-mcp`, `obsidian-mcp-server`, `ollama-mcp`,
`codex-mcp`) belong to different owners/projects and must not be mismapped.

## Validation

Watch re-run after the batch: `No uncovered MCP-related advisories found.`
Bundle regenerated (core data.ts + api data.json, 103), e2e hit/silence regression
added, `pnpm build/test/lint/typecheck`, schema validate (103 valid), advisory-count
(103 consistent), client-lists checks all green.
