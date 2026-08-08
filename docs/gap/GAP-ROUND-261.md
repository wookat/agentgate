# GAP-ROUND-261 — Advisory sweep (window 2026-08-08..08-09)

Date: 2026-08-08. Routine advisory sweep (previous: round 251, window
through 08-09 publications; this round covers the 27 GHSA reviewed advisories
plus 36 malware advisories published 08-08..08-09).

## Added (73 → 74)

- **MCPA-2026-0060** — mcp-ui-probe (npm) ≤0.2.0 journey-storage path
  traversal (CVE-2026-19270 / GHSA-h8jj-pqww-5m4w, low, CVSS 5.3).
  npm-published MCP UI-testing server; `journeyId`/`filename` arguments reach
  filesystem paths unsanitized. Maintainer unresponsive to the public issue,
  no fixed release → `last_affected: 0.2.0` per policy (round 245).
  End-to-end verified: `advisory check mcp-ui-probe@0.2.0` hits (exit 1),
  `@0.3.0` clears.

## Rejected (mapping bar, recorded honestly)

- **GHSA-c8c4-xf97-vvc8** (CVE-2026-19263) — INQUIRELAB mcp-bridge-api
  command injection: rolling release, not published to npm/PyPI (both 404).
  No package mapping → out, same precedent as ssh-mcp-server (round 251).
- **GHSA-gjfv-xm8w-qq69** — WordPress "AI Copilot" plugin authorization
  bypass: WordPress plugin, not an AgentGate scan surface.

## Malware window

36 GHSA malware advisories published 08-08..08-09: none in the MCP/agent
namespace (no mcp/agent/claude/copilot-named npm or PyPI packages).

## State

74 entries schema-valid (`npm run validate` in /api), bundled data rebuilt,
comparison-page count 73 → 74 (round-255 CI gate enforces). Self-scan 21
findings unchanged.
