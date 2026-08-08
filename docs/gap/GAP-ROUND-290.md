# GAP-ROUND-290 — Data checkpoint (rounds 281–289)

Date: 2026-08-03. Documentation-only checkpoint round; all numbers below are
measured, not estimated.

## What shipped in this window (9 PRs, all merged)

| Round | PR | What |
| --- | --- | --- |
| 281 | #417 | Advisories MCPA-2026-0068/0069 — mcp-pdf-vision command injection + opencode-engos-ai malicious binary drop (still installable, tarball unpacked and verified) |
| 282 | #419 | Roo Code `.roo/commands/*.md` + Kilo `.kilo/commands/*.md` project slash commands scanned (AG-SK-001/003) |
| 283 | #420 | Inert `allowed-tools` frontmatter skipped in Roo/Kilo command files (53/54 wild hits were FPs; upstream source verified the field is ignored) — landed on main via #422 |
| 284 | #422 | Kilo CLI (OpenCode fork) project tree — `kilo.json(c)` discovery/permissions/plugins, agents/modes markdown, startup plugin files (311 wild repos, 1,179 previously-invisible hits) |
| 285 | #423 | `config convert` supports the Kilo CLI (`kilo` target, OpenCode-schema adapter, JSONC-tolerant) |
| 286 | #424 | Advisories MCPA-2026-0070..0073 — Claude-targeting npm malware batch (three still installable, all tarballs unpacked and verified) |
| 287 | #425 | New-surface check (Claude Code `archive` plugin source already covered by round-191) + 87-advisory website walkthrough (docs only) |
| 288 | #426 | GitHub Actions annotations capped at 10 per level (GitHub display limit) with a summary annotation naming the omitted count |
| 289 | #428 | Codex Agent Plugins repo surface — `.codex-plugin`/`.cursor-plugin` manifests (camelCase `mcpServers`, inline hooks-file lists), `.agents/plugins/marketplace.json` repo marketplaces, plugin skill trees (9 wild repos, 10 previously-invisible hits, 0 FP) |

Window highlights: two client-surface arcs went from invisible to
corpus-validated — Kilo CLI (rounds 282–285: slash commands → FP sweep →
full project tree → converter) and Codex Agent Plugins (round 289); two
advisory batches added six entries with every still-installable package
unpacked and verified; and round 288 fixed a real CI-visibility defect
(372+ findings silently dropped by GitHub's 10-annotations-per-step limit).

## Measured data (2026-08-03)

- Tests: 445 → **460** on main (core 376, cli 54, config-convert 30). All
  suites, lint, typecheck, build green.
- Self-scan (dogfood): 214 source files, 21 findings (15 medium, 6 low),
  **0.82 s** wall clock.
- Advisories: **87** — repo `advisories/MCPA-*.json`, live API
  `/v1/advisories`, and website JSON feed all agree (three-way consistent;
  count enforced by the round-255 CI gate).
- Website: https://agentgate.zalize.com returns 200.
- npm last-month downloads: mcp-agentgate **3,124**, mcp-agentgate-core
  **3,355**, mcp-agentgate-config-convert **451**. The CLI number is flat
  for the fifteenth consecutive checkpoint — distribution remains the
  biggest gap (owner decision pending; mcp-observatory comparison data from
  round 278 still stands).
- Releases in window: v0.65.3, v0.65.4 (both manual npm publish —
  release-workflow credential gap unchanged, on the owner's external list).

## Open items carried forward

- npm trusted publisher / NPM_TOKEN for automated releases (owner,
  external).
- Distribution strategy (owner decision).
- npm security reports for still-live malware (owner external list, incl.
  the round-286 batch: anthropic-setup, remote-claude-daemon,
  @guangnao/claude-cli).
