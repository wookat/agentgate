# GAP Report — Round 50 (mid-loop data checkpoint: coverage, performance, adoption)

Half-way through the 100-round loop. This round is a measurement round: real
numbers, no code change.

## Advisory coverage & freshness (2026-08-06)

- 28 advisories in production (website feed and Worker API agree).
- Latest: MCPA-2026-0014 (flyto-core callback SSRF batch, added round 32).
- advisory-watch (GHSA/OSV real runs, rounds 44/49): zero uncovered
  MCP-related advisories — coverage is current as of today.

## Performance (measured this round)

- `agentgate scan` on microsoft/TypeScript (full shallow clone): 1.1s wall.
  10 low AG-TP-001 findings — all intentional hidden-Unicode test fixtures
  (U+2028/U+FEFF in parser/sourcemap tests); correctly low severity, not FPs
  worth suppressing.
- Skill scanning adds no measurable overhead (markdown surface is walked in
  the same pass).

## Adoption (npm)

- mcp-agentgate: 1,668 downloads 2026-07-01..08-06, concentrated on
  2026-08-04/05 (248 + 1,420). Caveat: our own CI, regressions, and npx runs
  inflate this; treat as an upper bound, not organic demand.

## Website

- New skills guide verified on production, mobile (390px) and desktop
  (1440px), zero horizontal overflow.

## Loop health (rounds 26–50)

- 25 rounds → 21 merged PRs, 5 releases (0.7.x→0.11.1), advisory DB 24→28,
  rules 9→12, zero CI-red merges, one P0 caught-and-fixed in-loop
  (0.6.0 workspace:* publish, round 22 era).

## Candidates for the next rounds

1. Report-viewer support for skill findings (docs mention it; unverified).
2. Comparison/positioning page using the round-47 competitor evidence.
3. Advisory-watch: consider adding npm ecosystem MAL feed diffing.
