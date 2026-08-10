# GAP-ROUND-388 — routine windows + r387 residual verification

Date: 2026-08-10. Baseline: main @ #578 (4e49a6f), advisory count 109.

## Advisory window (clean)

- Authenticated watch re-run: no uncovered MCP-related advisories.
- OSV exports: npm all.zip ETag `14bc0eba…` and PyPI ETag `53ac9d13…` both
  unchanged since round 386. No new MAL diff to review.
- Client version window: Claude Code v2.1.226, Gemini CLI v0.54.4, Copilot CLI
  v1.0.78, Crush v0.88.1, Qwen Code v0.21.8, Goose v1.45.0, Codex
  rust-v0.147.0, OpenCode 1.18.16, Cline npm 3.0.52 — all unchanged since
  round 386.
- Production: advisory API and feed both serve 109, matching the repository.

## r387 residual verification (post-#578 rescan of the 140-repo corpus)

- AG-RC-001 medium (48): sampled per class against source — real dynamic-exec
  call sites (`execSync(`, `spawnSync('bash'`, `new Function(`), curl|sh text
  in non-executable files with the hedged "confirm it is never executed"
  wording, and shell-launched server specs. All semantically correct.
  - Single-instance deferral: `maorgigi123_claude-skill-guard/src/rules.ts`
    declares a rule table (`export const rules: Rule[] = [...]` with
    `id`/`title`/`pattern` fields) whose `title` strings quote `curl | bash`.
    The identifier `rules` carries no deny-word, so the r376
    assignment-declared-deny-table heuristic doesn't fire; the finding is
    already medium with hedged wording. One instance — no rule change.
- AG-SK-002 medium (302, concentrated in 8 repos shipping many SKILL.md
  files): sampled — all are real `allowed-tools: Write/Edit` pre-approvals;
  rule semantics correct.
- AG-CL/SS/TP-001 high and AG-SK-003 high were fully reviewed in round 387;
  the surviving entries are the verified true positives recorded in
  GAP-ROUND-387.

## Defect fixed this round (CLI output consistency)

Scanning a directory mixed path styles inside `findings`: repo-walk findings
report `file` posix-relative to the scan root, while findings from discovered
config files (server-scoped AG-RC/SC findings on `.mcp.json` et al.) reported
absolute paths (`/home/…/repo/.mcp.json`). JSON consumers and the findings
table got inconsistent attribution for the same scan.

Fix: `scan` relativizes every finding file under the scan root to a
posix-relative path before reporting; configs outside the root (user-level
client configs in the home directory) keep their absolute path. Regression
test added; `docs/spec/cli-contract.md` documents the path semantics.

## Residual gaps (unchanged)

- canary.py SSH private-key template single instance — still deferred.
- Rule-table `title` strings quoting shell pipelines (see above) — deferred
  until a second independent instance appears.
