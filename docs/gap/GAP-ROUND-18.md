# GAP-ROUND-18 — PyPI offline backstop + competitor re-check

Round type: maintenance (advisory database expansion).

## Competitor re-check (no movement)

- socket CLI: still v1.1.153 (same as round 1).
- osv-scanner: latest release still v2.4.0 (same as round 1).
- snyk-agent-scan: re-checked in round 13 (v0.5.16, unchanged behavior).

No new competitor capability to chase this round.

## New advisory

**MCPA-2026-0010** — June 2026 PyPI campaign impersonating popular AI
libraries as MCP servers: `openai-mcp`, `langchain-core-mcp`, `tiktoken-mcp`,
`instructor-mcp` (OSV MAL-2026-5317/5318/5320/5326, source amazon-inspector).
These are exactly the names an AI assistant would plausibly suggest launching
via `uvx`; none are published by the legitimate upstreams. Package-wide
critical — completes the round-16 offline backstop for the PyPI side.

Verified: `uvx openai-mcp` config reports AG-SC-003 critical offline.

Surveyed but not added: the timemcp*/timesmcp* PyPI cluster (2026-04/05,
low-download junk squats with no impersonated upstream), test/PoC packages
(ant-mcp-proxy-for-test, mcp-ci-runner-poc). The OSV online check still
covers all of these when the network is available.

## Remaining known gaps

Unchanged from GAP-ROUND-16 (curated offline coverage is a backstop, not
exhaustive; advisory API worker remains route B).
