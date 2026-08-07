# GAP-ROUND-149 — real-corpus FP sweep of rounds 145–148

Date: 2026-08-08 · Round type: verification (no code change)

## Method

Scanned four flagship repos exercising the newest AG-SK-002 surfaces
(Roo `.roo/mcp.json`, VS Code `chat.tools.*` incl. the round-147
terminal map, Zed `.zed/settings.json`) with the current build:
microsoft/vscode, zed-industries/zed, microsoft/TypeScript,
facebook/react (fresh shallow clones).

## Results

| Repo | AG-SK-002 | Notes |
| --- | --- | --- |
| microsoft/vscode | 0 | Its own `.vscode/settings.json` HAS a `chat.tools.terminal.autoApprove` map — scoped script approvals (`scripts/test.sh` etc.), correctly clean; `chat.tools.edits.autoApprove` only re-denies a file (`false`) |
| zed-industries/zed | 0 | `.zed/settings.json` present, no `agent` permission keys |
| microsoft/TypeScript | 0 | — |
| facebook/react | 0 | `.claude/` settings/skills present, all scoped |

Key evidence: the round-147 code path ran against VS Code's own
checked-in terminal auto-approve map and produced zero false
positives, while round-148's true positive (remembrances-mcp) and
round-146/147 corpus TPs (mcp-dotnet-samples, debbie.codes) still
report. Other rules' findings on these repos (10/1/28/1 total) were
spot-checked and are pre-existing heuristic categories, not new-rule
regressions.

## Follow-up candidates (unchanged)

- `chat.tools.edits.autoApprove` glob map — only dangerous when a
  sensitive-file glob is set to `true`; corpus so far only shows
  `false` (protective) usage, so still not modeled.
- Zed `mcp:<server>:<tool>` per-tool ids risk classification.

## Evidence

- Scans run locally against fresh clones on 2026-08-08; no code
  changes, no changeset.
