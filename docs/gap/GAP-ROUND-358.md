# GAP-ROUND-358 — advisory window: MCPA-2026-0090

## Window

- Authenticated GHSA/malware watch rerun surfaced 3 new VulDB-series MCP
  CVEs (last 8 days), each verified against the primary source:
  1. **CVE-2026-19339 / GHSA-jgm8-jqmm-5rc5 — ingested as MCPA-2026-0090.**
     `alibabacloud-dataworks-mcp-server` (npm): the ReadResource handler in
     `src/resources/initResources.ts` does `if (uri?.startsWith?.('http'))
     { const res = await fetch(uri); … }` and returns the body — no
     allowlist or network-range check (SSRF, CWE-918). Verified by
     unpacking the published npm tarball: the vulnerable code is still
     present in latest **1.0.45**, so recorded as `last_affected: 1.0.45`
     (upstream issue #27 open, no fixed release). CVSS 6.3 (medium) per
     GHSA.
  2. CVE-2026-19340 (ProjectHub-Mcp SSRF) — GitHub-only web app shipped as
     Docker images; `projecthub-mcp` not on npm/PyPI → watch-ignore.
  3. CVE-2026-19338 (MCPyATS path traversal) — GitHub-only project;
     `mcpyats`/`mcp-yats` not on npm/PyPI → watch-ignore.
- OSV exports: npm ETag unchanged since r353
  (`e31fe9a28baffdba3bc7ffea32444eec`); PyPI ETag changed but the MAL id
  set diff vs the r337 snapshot is 0 added / 0 removed.

## Database

103 → 104. Bundles regenerated (`api/src/data.json`,
`packages/core/src/advisories/data.ts`); e2e hit/silence pinned in
`advisories.test.ts` (1.0.45 confirmed, 9.9.9 silent); docs advisory count
gate updated (comparison.md).
