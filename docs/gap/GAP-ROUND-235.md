# GAP-ROUND-235 — advisory backlog sweep (2026-08-08)

Round type: ingest the package-mapped backlog recorded in GAP-ROUND-234. Each entry verified against the original vendor GHSA before ingestion. 48 → 58 records.

## Ingested (MCPA-2026-0035..0044)

- **0035 / 0036 — meta-ads-mcp (PyPI, fixed 1.0.115)**: `upload_ad_image` SSRF via unrestricted `image_url` fetch (CVE-2026-54549, high 8.3); `X-Pipeboard-Token` header auth bypass that reuses the operator's Meta token (CVE-2026-54547, high 7.4).
- **0037 — LangBot (PyPI `langbot` ≤ 4.10.5)**: authenticated RCE by adding an STDIO MCP server with an arbitrary command (CVE-2026-54449, high 8.8). No fixed release at publication — recorded as `last_affected: 4.10.5`.
- **0038 — netlicensing-mcp (PyPI, fixed 0.1.6)**: HTTP mode forwards unauthenticated requests and falls back to the server's own NetLicensing API key (CVE-2026-54446, high 8.1).
- **0039 — @andrea9293/mcp-documentation-server (npm, only 1.13.0 affected, fixed 1.13.1)**: Web UI on 0.0.0.0:3080 with no authentication (CVE-2026-54504, high 8.8).
- **0040 — mcp-memory-keeper (npm, fixed 0.13.0)**: `context_import` arbitrary local file read via unvalidated `filePath` (CVE-2026-54561, medium 6.2).
- **0041 — @jsonbored/gittensory-mcp (npm ≤ 0.1.0)**: missing contributor-scoped access check leaks miner financial data (no CVE; upstream commit fix, no fixed npm release — `last_affected: 0.1.0`).
- **0042 — Phantom (PyPI `phantom-audio`, fixed 1.3.1)**: arbitrary file write via unconfined MCP tool output paths + decode-bomb DoS (high 7.7).
- **0043 — PraisonAI (PyPI `praisonai`, fixed 4.6.78)**: MCP HTTP-stream transport unauthenticated by default (CVE-2026-61427, medium). The GHSA carries no package mapping — PyPI name verified independently and noted in the entry; 4.6.78 itself was never published to PyPI (4.6.77 → 4.6.155+), so semver "fixed" comparison is correct for all published versions.
- **0044 — @dynatrace-oss/dynatrace-mcp-server (npm, fixed 1.8.7)**: `create_dynatrace_notebook` missing the human-approval gate (low 3.7). Joins the round-228 Dynatrace batch.

## Verification

- Schema validation 58/58; api tests green; core bundled DB rebuilt (58 records).
- End-to-end version boundaries (offline CLI): all 12 probe versions hit/clear correctly (`meta-ads-mcp@1.0.114` → 2 / `@1.0.115` → 0; `netlicensing-mcp@0.1.5` → 1 / `@0.1.6` → 0; `mcp-documentation-server@1.13.0` → 1 / `@1.12.0` → 0; `praisonai@4.6.77` → 1 / `@4.6.160` → 0; etc.).

## Honest boundaries / not ingested

- `obsidian-local-rest-api` (authenticated path traversal, high): npm-published but an Obsidian plugin rather than an MCP server; deferred pending a decision on plugin-adjacent scope.
- Go/rubygems candidates (terraform-mcp-server, consul-mcp-server, toolhive, mkp, yutu, Ruby SDK ×5) still out of schema ecosystems (npm/pypi/nuget) — same product decision recorded in GAP-ROUND-234.
- VulDB low-sev entries without package mappings remain excluded pending upstream confirmation.
