# GAP-ROUND-136 — JSONC-tolerant Claude Code settings parsing

Date: 2026-08-07 · Round type: false-negative fix (from round-135 corpus)

## Gap (real evidence)

Round-135's corpus caught a real false negative: tidyverse/tidyverse.org's
checked-in `.claude/settings.json` has a trailing comma — Claude Code
accepts it (JSONC-tolerant), but `JSON.parse` fails, so round-134's
AG-SK-002 settings check silently skipped the whole file.

## What shipped

- `parseJsonc()`: strict `JSON.parse` first; on failure, strips `//` and
  `/* */` comments (string-aware) and trailing commas, then retries;
  returns undefined if still invalid.
- AG-SK-002's settings check uses it — the round-135 tidyverse-style
  fixture (trailing comma + bare `WebFetch`) is now caught.

## Verification (real corpus, this build)

- tidyverse.org's actual settings file now parses; its grants are all
  scoped (`Bash(find:*)`, `Bash(rm:*)`, `Edit(content/**)`) → still 0
  findings, which is correct under the current RISKY_GRANTS policy.
- taiko-mono's 3 true positives unchanged; slack-sdk/scylla still 0.

## Carried forward

- Scoped-but-destructive grants (`Bash(rm:*)`) remain unflagged —
  needs a severity decision backed by more corpus evidence.

## Evidence

- Full suite green: core 213, cli 47, config-convert 24.
