# GAP-ROUND-160 — data checkpoint (rounds 151–159)

Date: 2026-08-08 · Round type: data checkpoint

## Shipping velocity

- 10 PRs merged (#248, #250–#252, #254–#256, #258, #259 + this one),
  all ordinary feature branches, CI green before merge.
- 3 npm releases in the window: 0.38.0 (rounds 151–153), 0.39.0
  (154–156), each tagged, GitHub-released, auto-deploy verified, and
  regression-tested from a clean npx cache; 0.40.0 (157–159) version
  commit merged to main, npm publish pending owner action.

## Coverage growth (all official-docs-verified, real-corpus-tested)

| Surface | Rounds |
| --- | --- |
| Amazon Q `cli-agents` `allowedTools` (+ glob expansion) | 151–152 |
| VS Code `chat.tools.edits.autoApprove` glob map | 153 |
| AG-SS-001 test-path metadata downgrade (awslabs/mcp sweep) | 154 |
| Cursor CLI `.cursor/cli.json` permissions (+ secret paths) | 155–156 |
| Zed `mcp:<server>:<tool>` destructive-name classification | 157 |
| Kiro `.kiro/agents/*` embedded `permissions.rules` | 158 |
| AG-CL-001 PEM-detector + AG-SK-001 multi-line FP fixes | 159 |

## Quality data (honest)

- True positives found in real repos: sample-scribe-ai,
  awesome-q-developer (151), sdg_hub, notty (155), reality-room (158).
- Two FP sweeps caught and fixed real noise: awslabs/mcp 2,664-file
  sweep (154, SSRF test fixtures), flagship sweep (159, vscode PEM
  detector high + strands-agents SOP critical).
- Tests 224→232 (core), 47 cli, 24 config-convert; self-scan baseline
  155 files / 17 findings / ~0.20 s unchanged (composition shifted
  in 154: 3 SSRF fixture highs → low, by design).
- Advisories: 31, consistent across repo (31 MCPA files) / API (31) /
  feed (31 items); advisory watch zero uncovered in the window.
- Competitors: no capability movement observed since round 155 check.

## Adoption (unchanged concern)

- npm last-30-days downloads: 3,124 — flat vs round 150 and still
  concentrated in our own activity windows. Distribution/marketing
  remains the top gap and is an owner-level decision.

## Ops

- Actions secrets fixed in round 151 window: push-to-main now
  auto-deploys website + advisory API (verified rounds 152, 154, 158).

## Next-round candidates

- Kiro `exclude` patterns / broad-glob grading (round-158 boundary).
- Cursor glob-semantic model for indirect secret-path coverage
  (round-156 boundary).
- Amazon Q `autoAllowReadonly` semantics (round-151 boundary).
- OpenCode last-match-wins rule-chain simulation (round-141 boundary).
