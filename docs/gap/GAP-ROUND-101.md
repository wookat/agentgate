# GAP-ROUND-101 — Comparison page: remote live-scan differentiator (real re-test)

Date: 2026-08-07 · Round type: competitor research + docs

## What was tested (real runs)

Following round 99 (remote MCP live scanning, PR #172), re-tested thynkQ
`mcp-scan@2.0.2` against a remote `url` server config
(`{"mcpServers":{"deepwiki":{"url":"https://mcp.deepwiki.com/mcp"}}}`):

```
npx -y mcp-scan@2.0.2 scan -c mcp.json --json
```

Result: `scanDurationMs: 3` — it never connects to the server. The only
finding was the static heuristic `network-egress-unknown` ("Server contacts
unknown external endpoint"). No MCP handshake, no tool-surface analysis, no
lockfile: poisoned descriptions or rug-pulls on hosted servers are invisible
to it.

AgentGate with #172: `scan --live` fetched the deepwiki surface in 0.28 s
(accurate AG-AM-001), `lock` pinned 3 tools, `ci` gates remote drift.

snyk-agent-scan's remote behavior is unverifiable without a `SNYK_TOKEN`
account (consistent with previous rounds) — recorded as unknown, not claimed.

## Change

`website/src/content/docs/docs/comparison.md`:

- new feature-matrix row: remote (`url`) server live scanning + lockfile
  pinning ("yes since 0.21.0"; snyk column honestly "unknown").
- thynkQ note extended with the dated re-test result above.
- last-verified date bumped to 2026-08-07.

Docs-only; no code. The "since 0.21.0" wording assumes the round-99 changeset
ships in the next release — accurate once #172 is merged and released.

## Routine sweeps this round

- advisory watch: "No uncovered MCP-related advisories found."
- competitor versions: mcp-scan 2.0.2, socket 1.1.154 — both unchanged.
