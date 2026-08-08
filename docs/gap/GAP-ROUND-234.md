# GAP-ROUND-234 — advisory sweep (2026-08-08)

Round type: routine advisory sweep (last: round 228). Source: GitHub Security Advisories (REST `/advisories`, published 2026-07-08..2026-08-08, MCP/agent keyword filter), each entry verified against the original vendor advisory before ingestion.

## Ingested (MCPA-2026-0028..0034, 41 → 48 records)

### mcp-atlassian (PyPI, sooperset/mcp-atlassian — widely deployed Jira/Confluence MCP server)

- **MCPA-2026-0028** — unauthenticated SSRF via `X-Atlassian-Jira-Url` / `X-Atlassian-Confluence-Url` headers (CVE-2026-27826, GHSA-7r34-79r5-rcc9, high 8.2, fixed 0.17.0). Older but previously uncovered; ingested so the two 2026-07 follow-ups have their anchor.
- **MCPA-2026-0029** — DNS-rebinding TOCTOU bypass of that SSRF fix: host validated once at middleware time, outbound request re-resolves with no IP pinning (GHSA-489g-7rxv-6c8q, medium 6.5, fixed 0.22.0). No CVE of its own — the CVE in the GHSA title refers to the bypassed fix.
- **MCPA-2026-0030 / 0031** — arbitrary server-side file read via client-supplied `file_path` in the Jira and Confluence attachment-upload tools (`open()` with no path validation; prompt-injection reachable) (GHSA-wm45-qh3g-v83f / GHSA-g5r6-gv6m-f5jv, high 7.7, both fixed 0.22.0).

### MCP Python SDK (PyPI `mcp`, modelcontextprotocol/python-sdk — foundational)

- **MCPA-2026-0032** — experimental task handlers act on tasks without checking the creating session; any client can read/cancel other clients' tasks (CVE-2026-52870, high 7.6, introduced 1.23.0, fixed 1.27.2).
- **MCPA-2026-0033** — SSE/Streamable HTTP transports route session requests by session ID only, without re-verifying the authenticated principal (CVE-2026-52869, high 7.1, fixed 1.27.2).
- **MCPA-2026-0034** — deprecated WebSocket server transport accepts handshakes with no Host/Origin validation (TransportSecuritySettings never wired in) (CVE-2026-59950, high, fixed 1.28.1).

## Verification

- `api` schema validation: 48/48 valid; api tests green.
- Core bundled DB rebuilt (`bundle-advisories.mjs`, 48 records); core suite 342 green.
- End-to-end version confirmation (offline CLI): `mcp-atlassian@0.16.0` → 4 hits, `@0.21.0` → 3 (0028 correctly cleared), `@0.22.0` → clean; `mcp@1.27.0` → 3 hits, `@1.28.0` → 1 (0034 only), `@1.28.1` → clean.

## Honest boundaries / not ingested this sweep (backlog for next advisory round)

- Already covered: n8n-mcp (0018/0019), Flowise CVE-2026-69263 npm_config_yes patch bypass (GHSA-xc48-889x-5qmw is the GHSA for the CVE ingested in round 12), Dynatrace batch, nanobot batch.
- Deferred candidates with package mappings: pip `meta-ads-mcp` ×2 (SSRF + token-reuse auth bypass), pip `langbot` (authenticated RCE via MCP config), pip `netlicensing-mcp`, npm `@andrea9293/mcp-documentation-server`, npm `mcp-memory-keeper`, npm `@jsonbored/gittensory-mcp`, pip `phantom-audio`, pip `praisonai`, npm `obsidian-local-rest-api`, low-sev Dynatrace notebook approval gap (GHSA-pc2w-4mq8-32qw).
- Out of DB scope: Go modules (terraform-mcp-server, consul-mcp-server, toolhive, mkp, yutu), rubygems `mcp` (Ruby SDK ×5) — schema ecosystems are npm/pypi/nuget; extending ecosystems is a product decision, recorded here rather than silently widening.
- VulDB low-sev entries without package mappings (godot-mcp, memory-bank-mcp, mastergo-magic-mcp, mcp-api, LudusMCP follow-ups, kicad-mcp, ssh-mcp-server, la-forge-mcp) remain excluded pending upstream package confirmation.
