# GAP Report — Round 57 (deps annotations parity)

## Gap

Round 56 added GitHub Actions annotations to `scan` and `ci`, but `deps` —
the command most likely to run standalone in a PR workflow (typosquat /
malware gate) — still printed only the table. Inconsistent inline-findings
experience across commands.

## Fix

`deps` (table format) emits the same one-annotation-per-finding output under
`GITHUB_ACTIONS=true`, via the shared `renderGitHubAnnotations` helper.
Same guarantees: JSON/SARIF stdout never mixed, no annotations outside
GitHub Actions.

## Verified

- New CLI test (annotations present under `GITHUB_ACTIONS=true`, absent
  otherwise); deps test runner pinned `GITHUB_ACTIONS=false` like cli.test.
- Full checks green: build, lint, typecheck, 155 core + 36 cli + 12 convert.
