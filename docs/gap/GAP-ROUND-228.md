# GAP-ROUND-228 — Advisory sweep: Dynatrace MCP Server + Flowise batch (6 entries)

Date: 2026-08-08
Round type: advisory routine sweep (last: round-223)

## Sweep

GitHub Security Advisories, last 30 days, MCP/agent-ecosystem filter. 6 uncovered advisories with actionable package mappings verified against original sources and ingested:

| MCPA | Alias | Package | Severity | Fixed |
| --- | --- | --- | --- | --- |
| MCPA-2026-0022 | GHSA-p7w7-4929-vpj5 | npm `@dynatrace-oss/dynatrace-mcp-server` | high | 2.0.0 |
| MCPA-2026-0023 | GHSA-xrmj-5g4g-8987 | npm `@dynatrace-oss/dynatrace-mcp-server` | medium | 2.0.0 |
| MCPA-2026-0024 | GHSA-pqh8-p93p-2rx7 | npm `@dynatrace-oss/dynatrace-mcp-server` | medium | 2.1.1 |
| MCPA-2026-0025 | CVE-2026-69253 / GHSA-wg86-r78f-74mp | npm `flowise`, `flowise-components` | critical | 3.1.3 |
| MCPA-2026-0026 | CVE-2026-69255 / GHSA-vmv7-4m6c-3cg5 | npm `flowise`, `flowise-components` | critical | 3.1.3 |
| MCPA-2026-0027 | CVE-2026-69257 / GHSA-c6xh-wv4j-ppv5 | npm `flowise` | high | 3.1.3 |

Details: Dynatrace MCP Server — unauthenticated HTTP-mode MCP tool invocation (no auth/session/origin checks; `execute_dql` reachable), Jinja2 workflow-template injection via `create_workflow_for_notification` (3 params), DQL injection through identifier-typed params bypassing readOnlyHint/field/time caps. Flowise ≤3.1.2 — nodevm JS sandbox escape to host RCE (elttam), CSV Agent Pyodide code injection with verified root shell, and SSRF deny-list bypass via un-normalized IPv4-mapped IPv6 (`::ffff:<ip>` + attacker AAAA record).

## Validation

- `api npm run validate`: 41 advisory file(s) valid.
- Bundled DB rebuilt (`bundle-advisories.mjs` → 41 entries), CI sync gate green.
- End-to-end CLI: `dynatrace-mcp-server@1.8.5` → 3 hits; `@2.0.0` → 1 (DQL only); `@2.1.1` → clean. `flowise@3.1.2` → 4 hits (incl. pre-existing 0006); `@3.1.3` → clean; `flowise-components@3.1.2` → 3 hits.
- Full checks green: 334/47/24 tests, lint, typecheck.
- Self-scan 19 → 20: +1 low is our own MCPA-2026-0027 JSON mentioning the metadata endpoint in a defensive context (honest dogfood signal, below CI gate).

## Honest boundaries / non-ingestions

- VulDB-sourced low-severity CVEs without package mappings (nanobot ExecTool trio CVE-2026-19243/45/46, godot-mcp, mcp-api, ssh-mcp-server, la-forge-mcp, poco-agent, OpenHands CVE-2026-19022) not ingested this round: no GHSA package mapping and no independent fix confirmation; candidates for a follow-up round after upstream verification.
- Langflow (IBM), ArcadeDB, better-auth, WordPress AI Engine: platform/server products not distributed as npm/pypi MCP packages agentgate can match from client configs; out of DB scope.
- Dynatrace GHSAs carry no CVE IDs yet; aliases record GHSA only, to be amended when CVEs are assigned.
