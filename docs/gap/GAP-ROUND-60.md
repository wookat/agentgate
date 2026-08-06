# GAP Report — Round 60 (data checkpoint, rounds 51–59)

All numbers measured 2026-08-07; nothing estimated.

## Shipping velocity (since round-50 checkpoint)

- 9 feature/fix PRs merged: #111, #112, #114, #115, #116, #118, #119, #121, #123.
- 3 versions published: 0.12.0 (9-client discovery + convert), 0.13.1
  (GHA annotations; 0.13.0 number was merged but superseded before publish),
  0.13.2 (AG-SK-001 masking FN fix). config-convert 0.2.0 shipped with 0.12.0.

## Capability deltas

- MCP client discovery: 6 → 9 families (Windsurf, Cline, Gemini CLI).
- `config convert`: 6 → 9 formats, both directions.
- Inline PR annotations for `scan`/`ci`/`deps` — zero-config differentiator
  vs SARIF-upload-only competitors.
- AG-SK-001 precision/recall both improved on real data: fenced-example FP
  class downgraded to `low` (round 55), first-match masking FN fixed
  (round 58).

## Data points

- Advisory DB: 28 records (production feed verified); advisory watch runs
  clean — no uncovered public MCP advisories this week.
- npm downloads, trailing 30 days (2026-07-07..08-07): mcp-agentgate 1,668;
  mcp-agentgate-core 1,751. Includes our own CI traffic — treat as an upper
  bound, same caveat as round 50.
- Performance: 148-finding scan of davila7/claude-code-templates
  (~133 skills) completes in 1.28s wall.
- Competitors (checked this week): socket 1.1.154, snyk-agent-scan 0.5.16,
  osv-scanner v2.4.0 — no releases since round 54.

## Open gaps carried forward

- Cloudflare secrets still missing in repo → deploy workflow skips; manual
  deploys each round (unchanged since round 25).
- npm trusted publisher not configured (unchanged).
- Real-world (non-CI) adoption signal still weak; no organic issue reports
  yet.
