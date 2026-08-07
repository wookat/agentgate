# GAP-ROUND-100 — Data checkpoint (rounds 91–99)

Date: 2026-08-07 · Round type: data checkpoint (no code changes)

## Shipped since the last checkpoint (round 90)

| Round | PR | What |
|---|---|---|
| 91 | #162 | Warp MCP configs discovered + converted (incl. generic `.agents/.mcp.json`) — clients 14→15 |
| 92 | #163 | `includeTools` on skill-declared servers interpreted (AG-OP-001 low when absent) |
| 93 | #164 | `deps` gates by default (`--fail-on high`, `never` opt-out) |
| 94 | #165 | Triage commands for GHSA-mirrored OSV hits in advisory-watch issues |
| 95 | #167 | `scan --live` correlates `includeTools` against the live tool surface |
| 96 | #168 | `scan`/`ci` accept `--fail-on never` (ci gates on drift only) |
| 97 | #170 | Deno/JSR import-map false positives fixed (3 critical FPs on honojs/hono) |
| 98 | #171 | Python import-name→PyPI-distribution mapping (3 critical FPs on tiangolo/fastapi) |
| 99 | #172 | Remote MCP servers live-scanned + locked (Streamable HTTP + SSE fallback) |

Releases: v0.19.0 (cli/core 0.19.0, config-convert 0.6.0), v0.20.0 (cli/core
0.20.0). Pending changesets: round-97 patch, round-98 patch, round-99 minor →
next release 0.21.0.

## Data (measured 2026-08-07)

- **Advisories**: 31 everywhere — local repo (31 MCPA files), live API
  `/v1/advisories`, and website feed all agree. `watch.mjs`: "No uncovered
  MCP-related advisories found."
- **Self-scan baseline**: 0.20 s, 16 findings, 148 scanned files — unchanged.
- **npm 30-day downloads** (2026-07-07 → 2026-08-05): mcp-agentgate 1,668;
  mcp-agentgate-core 1,751; config-convert 200. Flat vs round 90 — note these
  figures are an upper bound that includes our own CI traffic.
- **Competitors**: mcp-scan 2.0.2 (unchanged), socket 1.1.154 (unchanged);
  snyk-agent-scan is PyPI-only (npm 404 expected); no new entrants observed.

## False-positive posture (rounds 97–99 sweeps)

Real-repo `deps` sweeps now clean: hono 0, fastify 0, got 3 true positives
(Shai-Hulud MAL advisories), fastapi 0, httpx 0, flask 5 low (runtime-generated
test fixtures, below the default gate — documented, not suppressed).

## Biggest remaining gaps

1. **Distribution / organic adoption** (non-code, needs owner decision):
   downloads flat for 3 checkpoints; Marketplace listing and launch posts remain
   the highest-leverage moves we cannot ship from here.
2. **Remote auth**: OAuth-flow remote servers (GitHub MCP) can't be live-scanned
   yet — static `headers` only (GAP-ROUND-99).
3. **Cloudflare deploy token** still missing (`CLOUDFLARE_API_TOKEN`), website/API
   deploys remain manual.
