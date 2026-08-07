# GAP-ROUND-106 — Homepage catch-up: OpenCode in hero list + remote servers in lock feature

Date: 2026-08-07 · Round type: website visual/copy walkthrough + routine sweeps

## What was found

- Homepage "Install" step listed 13 clients but omitted OpenCode — one of the
  original 6 supported clients (flagged as cosmetic remainder in
  GAP-ROUND-104).
- The `lock` feature card still described lockfile pinning without mentioning
  that 0.21.0 pins remote (hosted) server surfaces too — the flagship recent
  capability and a key differentiator vs. competitors (GAP-ROUND-101).

## Fix (copy only)

- Hero install copy now includes OpenCode (14 named clients).
- `lock` card: "…of stdio and remote (hosted) servers into agentgate.lock."

## Routine sweeps (real evidence, this round)

- Advisory watch: "No uncovered MCP-related advisories found." (31 advisories,
  repo/API/feed consistent.)
- Competitors: thynkQ mcp-scan 2.0.2, socket CLI 1.1.154,
  snyk-agent-scan 0.5.16 — no version movement.

## Verification

- `pnpm --filter website build` green (63 pages).

## Remaining

- Interactive OAuth for remote servers remains the biggest live-scan gap
  (static `headers` only) — needs a design round.
