# GAP-ROUND-260 — Data checkpoint (rounds 251–259)

Date: 2026-08-08. Documentation-only checkpoint round; all numbers below are
measured, not estimated.

## What shipped in this window (9 PRs, all merged)

| Round | PR | What |
| --- | --- | --- |
| 251 | #370 | Advisory sweep — zero new entries (aliases + mapping-bar rejections documented honestly) |
| 252 | #372 | Competitor re-check — versions unchanged, fixed stale advisory count (41 → 73) |
| 253 | #373 | Pinned AG-SK-003 coverage of OpenCode command `` !`cmd` `` shell substitutions (test + GAP) |
| 254/255 | #374 | AG-SK-002 interprets the deprecated OpenCode `tools` boolean map (agents + opencode.json) |
| 255 | #376 | CI gate for hardcoded advisory counts in docs |
| 256 | #377 | AG-SC-001 flags remote-URL OpenCode `instructions` (remote prompt injection) |
| 257 | #378 | AG-RC-001 treats auto-executed OpenCode plugin files as startup exec surface |
| 258 | #380 | OpenCode plugin-surface precision sweep (235 repos) — glob narrowed to ts/js |
| 259 | #381 | AG-SK-003 classifies Claude Code command-executing settings keys |

Window highlights: a deep OpenCode source-verified sweep (command shell
substitution, deprecated `tools` map, remote instructions, startup plugins —
each confirmed against sst/opencode source), the largest single-surface wild
corpus to date (235 `.opencode/plugin(s)` repos, 23 AG-RC-001 true positives,
one `.mjs` FP found and fixed), a new drift CI gate born directly from the
round-252 finding, and Claude Code's four shell-executing settings keys
(`apiKeyHelper` et al.) closed as a previously invisible surface.

## Measured data (2026-08-08)

- Tests: 428 → **433** on main (core 361, cli 47, config-convert 25); 434
  once #381 lands. All suites, lint, typecheck, build green.
- Self-scan (dogfood): 198 source files, 21 findings (15 medium, 6 low),
  **0.75 s** wall clock.
- Advisories: **73** — repo `advisories/MCPA-*.json`, live API
  `/v1/advisories`, and website feed `items` all agree (three-way
  consistent); now also enforced by the round-255 CI gate.
- Website: https://agentgate.zalize.com returns 200.
- npm last-month downloads: mcp-agentgate **3,124**, mcp-agentgate-core
  3,355, config-convert 451 — the eleventh consecutive flat checkpoint.
  Distribution remains the biggest gap and stays escalated for an owner
  decision.

## Release status

v0.56.0 shipped this window boundary (owner published the three packages
manually after the workflow's npm-credential gap; tag 69f1c57, GitHub
Release, deploys and clean-environment regression all verified in round 250's
close-out). The Release workflow fix still needs owner action on the npm
side: trusted-publisher config or an `NPM_TOKEN` secret.

## Carry-over boundaries

- OpenCode local instruction globs pointing outside known skill trees are
  not content-scanned (round 256).
- Nested files under `.opencode/plugin(s)/` are general source, not startup
  exec surface (round 257/258, matches upstream glob).
- Project-level `apiKeyHelper` presence alone is not flagged — only
  dangerous commands (round 259).
- Go/rubygems advisory ecosystems stay deferred until a matching scan
  surface exists (owner decision, round 235).
