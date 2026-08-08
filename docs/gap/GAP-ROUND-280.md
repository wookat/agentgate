# GAP-ROUND-280 — Data checkpoint (rounds 271–279)

Date: 2026-08-08. Documentation-only checkpoint round; all numbers below are
measured, not estimated.

## What shipped in this window (9 PRs, all merged)

| Round | PR | What |
| --- | --- | --- |
| 271 | #401 | Advisories MCPA-2026-0064/0065 — llm-interceptor MCP implant + agenttunnels remote-exec bridge (both still installable, tarballs unpacked and verified) |
| 272 | #403 | Website UX walkthrough (desktop+mobile, light/dark, 79 advisories) — homepage client-list drift fixed (Kilo Code) |
| 273 | #404 | CI gate: docs client lists must cover all discovery clients (parsed from discovery.ts; negative-tested) |
| 274 | #405 | Findings table shows the source config file for server-scoped findings (multi-client duplicate-server UX) |
| 275 | #407 | Cursor cloud-agent `.cursor/environment.json` surface (AG-SK-003 named keys) + `cp .env.example` classifier FP fix |
| 276 | #409 | Advisories MCPA-2026-0066/0067 — Mini Shai-Hulud compromised MCP servers + brave-search-mcp-server squat; 0009 alias backfill |
| 277 | #411 | Cursor environment corpus sweep (296 wild files, 18/18 TP, 0 FP) — dropped the duplicate curl|sh text warning on Cursor command surfaces |
| 278 | #413 | Competitor re-check — 4 tracked unchanged; new head-to-head: mcp-observatory (launches known-compromised servers with no advisory warning) |
| 279 | #414 | Dedupe extended to `.claude/settings(.local)?.json` after a ~800-repo sweep found exactly one wild duplicate pair |

Window highlights: the Cursor cloud-agent surface went from invisible to
corpus-validated (60 → 296 wild files) across rounds 275/277; two release
closeouts (v0.64.1, v0.65.1, v0.65.2 — manual npm publish by the owner);
the client-list CI gate turned a twice-recurred drift class into a red
build; and the competitor sweep surfaced mcp-observatory — 6,345 npm
downloads/month with a CI-gate/lockfile narrative, which sharpens the
distribution question.

## Measured data (2026-08-08)

- Tests: 442 → **445** on main (core 368, cli 48, config-convert 29). All
  suites, lint, typecheck, build green.
- Self-scan (dogfood): 207 source files, 21 findings (15 medium, 6 low),
  **0.81 s** wall clock.
- Advisories: **81** — repo `advisories/MCPA-*.json`, live API
  `/v1/advisories`, and website JSON feed all agree (three-way consistent;
  count enforced by the round-255 CI gate).
- Website: https://agentgate.zalize.com returns 200.
- npm last-month downloads: mcp-agentgate **3,124**, mcp-agentgate-core
  **3,355**, mcp-agentgate-config-convert **451**. The CLI number is flat
  for the fourteenth consecutive checkpoint — distribution remains the
  biggest gap, now with a faster-growing direct competitor
  (mcp-observatory at 6,345/month) as a benchmark.
- Releases in window: v0.64.1, v0.65.1, v0.65.2 (all manual npm publish —
  release-workflow credential gap unchanged, on the owner's external list).

## Open items carried forward

- npm trusted publisher / NPM_TOKEN for automated releases (owner,
  external).
- Distribution strategy (owner decision; mcp-observatory comparison data
  now available).
- npm security reports for still-live malware (owner external list).
