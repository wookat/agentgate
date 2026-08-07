# GAP-ROUND-180 — Data checkpoint (rounds 171–179)

Date: 2026-08-08 · Round type: data checkpoint

## Shipped since GAP-ROUND-170

9 PRs merged (#277, #279, #280, #281, #282, #283, #284, #286, #287) +
1 release (0.45.0, tag/Release/deploy verified, clean-cache regression
passed in /tmp/clean0450).

- Round 171: AG-SK-003 — Kiro agent hook files (`.kiro/hooks/*.kiro.hook`)
  `runCommand` actions (the `.hook` extension was previously not even
  walked). GitHub prevalence: ~4,656 `.kiro.hook` files, ~563 with
  `runCommand`.
- Round 172: AG-SK-001 — `.kiro.hook` `askAgent` prompts (hidden Unicode +
  injection patterns; prompts auto-inject on IDE events).
- Round 173: AG-SK-002 — Codex project config (`.codex/config.toml`)
  sandbox/approval opt-outs (`danger-full-access` high, `approval_policy
  = "never"` / workspace-write `network_access` medium). Real TPs:
  gogf/gf, phodal/routa, trueleaf/apiflow, rulesync.
- Round 174: AG-SK-003 — Codex project hooks (`.codex/hooks.json`), same
  schema as Claude Code hooks; hash-trust mitigation documented.
- Round 175: AG-SK-003 — inline `[[hooks.Event]]` tables in
  `.codex/config.toml`.
- Round 176: precision — AG-RC-001 curl|sh regex no longer spans plain
  newlines (dlt bootstrap FP); AG-SK-001 concealment pattern ignores
  "do not tell the user to <verb>" phrasing guidance (openai/codex
  sample-skill FP). Both from a 5-flagship-repo sweep.
- Round 177: AG-SK-003 — Windows-only Codex hook command overrides
  (`commandWindows`/`command_windows`).
- Round 178: shared classifier models PowerShell download-and-execute
  idioms (`irm|iwr … | iex`, `iex (irm …)`) as critical across all
  hook/skill surfaces; skill-side curl|sh got the round-176 newline fix.
- Round 179: AG-SK-002 — named `[permissions.<name>]` profiles in Codex
  config (root/home `"write"` high, profile `network.enabled` medium).

## Metrics (measured 2026-08-08)

- Tests: core 243 → 256, cli 47, config-convert 24 (all green).
- Self-scan: 155 files, 17 findings (13 medium, 4 low), ~0.23 s.
- Advisories: 31 in the public feed; 32 local JSON files
  (`watch-ignore.json` is a non-advisory helper) — feed/API/repo
  consistent.
- npm mcp-agentgate last-month downloads: 3,124 (2026-07-08 →
  2026-08-06) — flat for the third consecutive checkpoint; distribution
  remains the biggest gap (escalated, awaiting owner decision).
- Releases in window: 0.45.0 (rounds 171–175, five minors). Rounds
  176–179 (two patches + two minors) accrue to 0.46.0.

## Honest gaps / carry-overs

- npm OIDC trusted-publisher publish still fails (token exchange 404);
  manual publish is the working path. Owner decision pending.
- Pure-PowerShell obfuscation (`-enc`, string concat) unmodeled.
- Codex profile `extends` chains, `/home`-literal writes,
  `workspace_roots`, `dangerously_*` proxy keys unmodeled (no wild
  evidence yet).
- Corpus evidence per round recorded in GAP-ROUND-171 … 179; all corpus
  scans are of unmodified public repos, no fabricated results.
