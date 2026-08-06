# GAP Report — Round 49 (skills scanning had no user-facing guide)

## Gap

Three skill rules shipped across rounds 41–48 (plus flow-list parsing and the
commands/plugins surface), but the only documentation was per-rule reference
pages. Nothing told a user "AgentGate audits your skills — here's what a repo
scan covers and how to gate it in CI". Competitor positioning (snyk-agent-scan
markets skills scanning as its headline) makes this a visibility gap.

## Fixed

- New guide: `docs/guides/skills` — scanned layouts, rule table with links,
  the regression fixture as a worked example (4 findings), CI gating one-liner,
  and the honest FP validation note (official skills repos scan clean).
- Sidebar entry under Guides.

## Routine checks this round

- advisory watch (GHSA/OSV real run): no uncovered MCP advisories.
- Version PR #106 (0.11.1) re-triggered and green after round-48 landed.

## Verified

- Website production build green; guide claims cross-checked against the
  round-46/48 implementations and the 0.11.0 clean-env regression output.
