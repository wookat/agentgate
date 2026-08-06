# GAP Report — Round 27 (advisory coverage data + routine intelligence sweep)

## 1. Advisory database data snapshot (before this round)

- 24 advisories; types: rce-vectors 8, malicious-package 8, path-traversal 4, ssrf 3,
  auth-missing 1; severity: critical 13, high 9, medium 2; package refs: npm 29,
  pypi 9, nuget 1; published range 2025-06-13 … 2026-08-04.
- Consistency check across public surfaces: website JSON feed 24, advisory API
  Worker `advisory_count` 24, repo 24 — all in sync.
- OSV spot-sweep of 11 more official-reference-server bare names
  (mcp-server-filesystem/-slack/-time/-memory/… ) returned no new malware entries
  beyond the MCPA-2026-0009 campaign.

## 2. New intelligence ingested

- **MCPA-2026-0011** — AWS Labs DocumentDB MCP Server (`awslabs.documentdb-mcp-server`,
  PyPI) read-only mode bypass via write-capable aggregation pipeline stages,
  CVE-2026-18954 / GHSA-w95p-h69m-853r, fixed in 1.0.12, medium (vendor CVSS 5.5).
  Sources: GHSA, AWS security bulletin 2026-076, awslabs/mcp release tag.
  Verified end-to-end: `uvx awslabs.documentdb-mcp-server==1.0.10` → AG-SC-003 medium;
  `==1.0.12` → clean. GHSA carries no machine-readable package range — ours does.

## 3. Reviewed and not ingested

- GHSA-q94p-g4rh-r9rf / CVE-2026-18991 (NanoClaw ≤2.0.64 path traversal in its MCP
  send_file tool): `nanoclaw` is not published on npm or PyPI, so package-runner
  scanning can never reference it; container-app CVE, out of scan's reach.

## Honest limits

- Coverage remains curated and non-exhaustive; the sweep window was
  2026-08-03..08-06 GHSA + OSV bare-name spot checks.
- Website/Worker will show 25 only after this PR merges and the (still manual,
  pending Cloudflare repo secrets) redeploy runs.
