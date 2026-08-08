# GAP-ROUND-278 — competitor re-check (last: round 252)

## Version sweep (verified 2026-08-08)

All four tracked competitors unchanged since the round-252 check:
snyk-agent-scan 0.5.16 (PyPI), thynkQ mcp-scan 2.0.2 (npm), socket CLI
1.1.155, osv-scanner v2.5.0. Existing dated claims on the comparison page
stand; only the "Last verified" line and one new entrant were updated.

## New-entrant sweep (npm "mcp security scanner")

Downloads/month checked for the top hits: @kryptosai/mcp-observatory 6,345,
mcp-guardian 1,415, correctover-scan 1,046 (SaaS-metered, 30 checks/month
free), mcp-security-scanner 120, veilguard 107, mcp-vulnerability-scanner
75. Only mcp-observatory clears the relevance bar for a head-to-head.

## Real run: @kryptosai/mcp-observatory 1.36.4

Fixture: `.cursor/mcp.json` with `mcp-echarts@0.8.1` (MCPA-2026-0066
compromised version), a filesystem server with a hardcoded secret-shaped
env value, and a poisoned `.claude/skills/evil/SKILL.md`.

- `scan` discovered both servers and **live-launched each by default**
  (stdio session; no consent step). It executed the known-compromised
  `mcp-echarts@0.8.1` with no malware/advisory warning — its checks are
  runtime-profile, schema-quality, and a "security-lite" pass (3 medium on
  the filesystem server).
- The poisoned SKILL.md produced zero findings (skills are not a surface).
- `lock`/`diff`/`watch` pin live tool schemas (genuine rug-pull overlap)
  but not config files; `audit` refused both a directory and an mcp.json —
  it requires a proprietary `mcp-observatory.target.json` (`targetId`).
- Strengths worth crediting: health scoring, score history, cassette
  replay/verify, `watch` alerting — ops monitoring AgentGate does not do.

Comparison page updated with a dated mcp-observatory section plus a
"competitors are stronger" bullet. mcp-agentgate npm downloads: 3,124/month
(13th consecutive flat checkpoint) — distribution remains the biggest gap.

## Boundary

mcp-guardian/correctover-scan not head-to-head tested this round (below the
download bar or SaaS-metered); revisit if they grow.
