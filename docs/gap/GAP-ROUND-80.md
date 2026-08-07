# GAP-ROUND-80 — data checkpoint (rounds 71–79)

Date: 2026-08-07. All numbers below are from real runs today; nothing estimated.

## Shipped since round 70

- PRs merged: #137 (LudusMCP advisories ×2), #138 (thynkQ head-to-head),
  #139 (rounds 73+74: Kiro/Roo/Zed discovery + convert), #141 (light-mode
  WCAG fixes), #142 (dark-mode contrast), plus release PR #140.
- Release: v0.15.0 (cli/core 0.15.0, config-convert 0.3.0), tagged, GitHub
  Release created, clean-env regression passed (Kiro/Roo/Zed discovery,
  zed→cursor convert, `lock --skills` drift gate).
- Open and CI-green at checkpoint time: #143 (code-block a11y),
  #144 (Continue.dev discovery), #145 (convert `continue`).

## Coverage

- Clients discovered: 9 → 13 across rounds 73/78 (Kiro, Roo Code, Zed,
  Continue.dev). `config convert`: 13 formats once #145 lands.
- Advisory DB: 31 records live (feed items = API count = 31); today's
  2-day GHSA watch returned 3 keyword matches, all non-MCP (FFmpeg ×2,
  Contiki-NG MQTT) — zero uncovered MCP advisories.
- Website: 7 sampled production pages audited 0 WCAG 2A/2AA violations in
  light mode; dark mode clean after #142 deploy (verified live on
  /docs/comparison/); one remaining live finding (#143's overflow code
  block) fixed pending merge.

## Performance

- Self-scan (repo mode, full checkout): 173 ms, 16 findings (baseline
  unchanged — all intentional Unicode test fixtures).

## Adoption (honest)

- npm last-month downloads: mcp-agentgate 1,668, core 1,751 — flat vs
  round 70 and still inflated by our own CI (upper bound, not organic).
- snyk-agent-scan npm lookup failed again today (registry error, second
  time); not recorded as a version change. socket 1.1.154, thynkQ
  mcp-scan 2.0.2, osv-scanner v2.4.0 — no competitor movement since
  round 72.

## Biggest remaining gaps (unchanged priorities)

1. Distribution/adoption: organic usage signal still weak; marketplace
   listing + announcement remain the top non-code gap.
2. Convert merge mode: Zed/Continue renders are "merge this yourself"
   documents.
3. thynkQ-covered clients without verifiable official conventions
   (Plandex, ChatGPT Desktop, Warp, Amp) still unsupported.
