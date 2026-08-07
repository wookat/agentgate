# GAP-ROUND-135 — real-corpus verification of Claude Code settings checks

Date: 2026-08-07 · Round type: real-corpus verification (docs only)

## Method

GitHub code search for checked-in `.claude/settings.json` with a
`permissions` block; cloned four real repositories and scanned them with
the round-134 build (AG-SK-002 settings checks, merged in #226).

## Results

| Repo | allow entries | AG-SK-002 |
| --- | --- | --- |
| slackapi/node-slack-sdk | ~40, all scoped (`Bash(cat:*)`, `Bash(gh pr view:*)`, …) | 0 |
| scylladb/scylla-cluster-tests | 7, all scoped git/gh commands | 0 |
| taikoxyz/taiko-mono | bare `WebFetch` (root) + bare `WebFetch`/`WebSearch` (nested `packages/taiko-client-rs/.claude`) | 3 × medium — true positives |
| tidyverse/tidyverse.org | `Bash(find:*)`, `Bash(rm:*)`, `Edit(content/**)` + trailing comma | 0 (see boundaries) |

- True positives: taiko-mono pre-approves unrestricted network access
  for anyone opening the repo — exactly the exfiltration-channel risk
  the rule describes. Nested `.claude` trees are caught too.
- Zero false positives on the two large all-scoped allow lists.

## Honest boundaries (recorded, candidate follow-ups)

- tidyverse.org's settings file has a trailing comma — valid for Claude
  Code (JSONC-tolerant) but not `JSON.parse`, so the rule skips it.
  A JSONC-tolerant parse would also surface its `Bash(rm:*)`.
- `Bash(rm:*)` is a scoped-but-destructive grant the RISKY_GRANTS table
  deliberately doesn't flag today; deciding a severity for scoped
  destructive commands needs more corpus evidence.

## Evidence

- Scans run locally on the merged round-134 build; no code changes this
  round, no changeset.
