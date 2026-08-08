# GAP-ROUND-310 — Data checkpoint (rounds 301–309)

Every ~10 rounds, a measurement round: real numbers only, no projections.
Previous checkpoint: GAP-ROUND-300.

## What shipped (rounds 301–309)

| Round | PR | Theme |
| --- | --- | --- |
| 301 | #442 | AG-DP-007 covers npm `overrides`/`resolutions`/`pnpm.overrides` redirections (+ honest OSV-export-unchanged advisory window) |
| 302 | #444 | Lockfile poisoning: package-lock.json / yarn.lock `resolved` remote sources |
| 303 | #445 | pnpm-lock.yaml v5/v6/v9 remote resolution + cnpm `/download/` mirror FP fix |
| 304 | #446 | Wild-corpus sweep of the lockfile surface (323 lockfiles, 42 hits verified) + pnpm nested peer-suffix FP fix |
| 305 | #447 | Copilot CLI extensions as startup exec surface (AG-RC-001) |
| 306 | #449 | Advisories MCPA-2026-0078..0081 — agent-hijack npm malware batch (91 → 95) |
| 307 | #450 | Automated GitHub-malware watch in `watch.mjs` + advisories MCPA-2026-0082..0085 (95 → 99) |
| 308 | #451 | Malware-sweep channel muting respects version-bounded MCPA records |
| 309 | #453 | Production deployment verification of the 99-advisory database (docs) |

Main line of the block: finishing the mutable-remote-source arc down into
lockfiles (301–304), then turning the advisory pipeline from manual window
review into an automated GitHub-malware watch (306–308).

## Measured data (2026-08-03, all real)

- **Tests**: 476 vitest (392 core / 54 cli / 30 config-convert) + 24 node
  API tests, all green. Round-300 checkpoint: 472 vitest.
- **Coverage** (core): 94.34% statements / 85.32% branches / 99% functions /
  97.21% lines (v8, enforced gate).
- **Self-scan**: 226 files, 21 findings, 0.80s wall (round-300: 218 files,
  0.78s — file growth, same performance envelope).
- **Advisory database**: 99 records (45 critical / 34 high / 15 medium /
  5 low); production API, feed, and website index all serve 99 (verified in
  round 309). Round-300: 91.
- **Advisory automation**: watch now sweeps GHSA vulnerabilities, the GitHub
  malware feed (MCP/agent vocabulary filter), and OSV live checks; ignore
  list carries per-id rationale; `--dry-run` clean.
- **Releases**: v0.67.3 published and verified in round 306; version PR #448
  merged → repo at 0.67.4 (cli/core; config-convert stays 0.14.0), npm
  publish pending the manual SOP.
- **Competitors** (re-checked this round): snyk-agent-scan 0.5.16, mcp-scan
  2.0.2, socket 1.1.155, osv-scanner v2.5.0, @kryptosai/mcp-observatory
  1.36.4 — all unchanged since round 298.
- **Adoption**: npm last-month downloads 3,124 (mcp-agentgate) / 3,355
  (mcp-agentgate-core) — the eighteenth consecutive flat checkpoint.
  Distribution remains the biggest gap and stays a leadership decision.

## Open threads carried forward

- OSV bulk exports byte-identical since r295: malware discovery now rides the
  GitHub malware feed; OSV export freshness must still be re-checked each
  advisory round before trusting snapshot diffs.
- GAP-303: lockfile integrity-hash verification needs network — out of scope
  for static scanning.
- GAP-305: `joinSession({tools,hooks})` static extraction from Copilot CLI
  extensions unimplemented; corpus shows onPreToolUse hooks are mostly
  guard/deny dispatchers, weak signal for an approve-detection rule so far.
- GAP-307/308: campaigns re-published under fresh GHSA ids on version-bounded
  channels resurface for triage by design; alias additions mute them.
