# GAP Report — Round 56 (inline PR findings without SARIF upload)

## Gap

First-class security CI tools surface findings inline on the PR diff. We
supported that only via SARIF + GitHub code scanning upload (requires the
`security-events: write` permission and an extra upload step). Plain
`npx mcp-agentgate ci` in a workflow printed a table into the log — findings
were easy to miss. Competitor reference: socket's GitHub app comments inline;
osv-scanner's reusable workflow uses SARIF upload only.

## Fix

When `GITHUB_ACTIONS=true`, `scan` (table format) and `ci` emit one GitHub
workflow-command annotation per finding after the table:

- `critical`/`high` → `::error`, `medium` → `::warning`, `low`/`info` → `::notice`
- `file=`/`line=` properties included when the finding has them, so
  annotations land inline on the PR diff
- proper workflow-command escaping (`%`, CR, LF; `:`/`,` in properties)
- JSON/SARIF stdout is never mixed with annotations (table format only)

Zero-config: existing `npx mcp-agentgate ci` workflows gain annotations with
no changes and no extra permissions.

## Verified

- New CLI test: annotations present under `GITHUB_ACTIONS=true`, absent
  otherwise, JSON output stays parseable.
- Existing CLI tests pinned to `GITHUB_ACTIONS=false` so they stay
  deterministic when the suite itself runs inside GitHub Actions.
- Full checks green: build, lint, typecheck, 155 core + 35 cli + 12 convert.
- Dogfood job on this PR doubles as a live verification.
