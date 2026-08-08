# GAP-ROUND-322 — AG-CL-001 placeholder words: `test` / `demo`

## Context

The round-321 wild plugin corpus (118 repos) surfaced one credential false positive:
`Reef-Digital/claude-code-slack` writes `SLACK_BOT_TOKEN=xoxb-test-token` into a temp
env file from `hooks/test-post-tool-status.sh`. The Slack token shape
(`xox[baprs]-[A-Za-z0-9-]{10,}`) matched, the placeholder word list
(`your|my|xxx+|placeholder|changeme|example|redacted|dummy|sample|fake`) did not
contain `test`, and the file lives under `hooks/` (not a `tests/` tree), so it
reported **high** instead of being skipped.

## Change

Add `test` and `demo` to the AG-CL-001 placeholder word list (word/underscore
delimited, same as the existing entries).

Recall impact is negligible: real token bodies are random alphanumerics, so a
boundary-delimited literal `test`/`demo` segment inside a matched secret shape is
essentially always a deliberate fake. Regression pins both directions: the corpus
value is skipped; a real-shaped Slack token still reports high.

## Evidence

- Wild corpus: the single FP above → now silent; suite green (490); self-scan
  unchanged (227 files / 21 findings).
