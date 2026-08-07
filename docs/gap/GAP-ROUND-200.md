# GAP-ROUND-200 — Data checkpoint (rounds 191–199)

Date: 2026-08-08 · Round type: data checkpoint

## Shipped since GAP-ROUND-190

9 PRs merged (#302, #303, #305, #306, #307, #308, #310, #311, #312) +
2 releases published in window (0.47.0 and 0.48.0 — tags, Releases,
deploy verification, and clean-cache regressions in ~/clean0470 /
~/clean0480 all passed).

The window finished the marketplace supply chain and brought two new
client ecosystems to full coverage:

- Round 191: AG-SC-001 — unpinned npm and archive marketplace plugin
  sources.
- Round 192: npm-distributed marketplace plugins run through OSV + MCPA
  advisory checks (reuses the round-167 OpenCode pipeline).
- Round 193: Gemini CLI extensions — `gemini-extension.json` manifests
  (project root + `~/.gemini/extensions/`) discovered; `.gemini/settings.json`
  hooks classified (AG-SK-003). Real TP: gemini-cli-extensions/observability.
- Round 194: Gemini extension command TOML (`commands/**.toml`) skill-
  scanned (AG-SK-001/003 incl. `!{…}` shell blocks).
- Round 195: Qwen Code client — MCP discovery (`~/.qwen` + project
  `.qwen/settings.json`) and AG-SK-002 checks (approvalMode yolo/auto-edit,
  unscoped permissions.allow, trust:true servers).
- Round 196: Qwen hooks (AG-SK-003) + sub-agents/commands skill scanning
  (`.qwen/agents`, `.qwen/commands`, deprecated TOML).
- Round 197: Qwen extensions — `qwen-extension.json` manifests (project
  root + `~/.qwen/extensions/<name>/`). Real TP: qwen-orchestrator
  (unpinned server-memory + -y).
- Round 198: Qwen context files — `QWEN.md`, `QWEN.local.md`,
  `.qwen/rules/**.md` skill-scanned (auto-loaded every session).
- Round 199: precision sweep — Qwen surfaces 0 FP across 10 repos;
  5 real old-rule FPs found on nexu-io/open-design (84k★) and fixed
  (AG-SS-001 comment-window defensive context, AG-SK-001 inline code
  spans, AG-RC-001 comment/heredoc curl|sh).

## Metrics (measured 2026-08-08)

- Tests: core 269 → 282, cli 47, config-convert 24 (all green).
- Self-scan: 155 files, 18 findings (14 medium, 4 low), ~0.22 s.
- Advisories: 31 in feed and API; 32 local JSON files (incl. the
  non-advisory `watch-ignore.json` helper) — three sources consistent.
- npm mcp-agentgate last-month downloads: 3,124 (2026-07-08 →
  2026-08-06) — flat for the fifth consecutive checkpoint; distribution
  remains the biggest gap (escalated previously, owner decision pending).
- Releases: 0.47.0 and 0.48.0 published in window; rounds 192–198 minors
  + round-199 patch accrue to 0.49.0.

## Honest gaps / carry-overs

- npm OIDC trusted-publisher publish still fails; manual publish is the
  working path (owner decision pending).
- Qwen: HTTP hooks, `.qwen/fork-profiles`, system-level settings,
  `@file` imports in QWEN.md, extension enable/disable scopes unmodeled.
- Gemini: extension `hooks/hooks.json` findings labeled as Claude plugin
  surface (cosmetic); `${extensionPath}` kept verbatim.
- Unquoted heredocs (`<<EOF`) still match AG-RC-001 (they expand).
- All corpus scans are of unmodified public repos; no fabricated results.
