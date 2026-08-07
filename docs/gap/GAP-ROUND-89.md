# GAP-ROUND-89 — per-rule counts in the table footer

Date: 2026-08-07

## Gap (real evidence)

CLI UX walkthrough on a real 4,314-file marketplace repo
(claude-code-templates): `scan` prints a 640-line table where 131 of 148
findings are near-identical AG-SK-002 rows. The footer only breaks counts
down by severity (`148 finding(s): 38 high, 105 medium, 5 low`), so a
triager cannot see *which rule* dominates without scrolling the whole
table; the doc-links list was alphabetical and count-free.

## Fix

The footer doc links now carry per-rule counts and sort by frequency:

```text
148 finding(s): 38 high, 105 medium, 5 low
  AG-SK-002 ×131 → https://agentgate.zalize.com/docs/rules/overprivileged/
  AG-RC-001 ×4   → …
```

Table rows, JSON, and SARIF output are unchanged.

## Routine notes

- v0.18.0 tag/Release + clean regression done earlier this round-cycle;
  #156/#157 merged; version PR #158 (0.18.1) verified green.
- Retriggering #158 CI needed two pushes: the first empty commit raced a
  bot force-push and its workflow runs landed as `action_required`; the
  second push ran normally (7/7 green).

## Still open (honest)

- A `--group-by rule` (or collapsing identical messages) would shrink the
  640-line table itself; deferred — footer counts cover the triage need
  with zero output-contract risk.
- `includeTools` allowlists in skill server entries still uninterpreted.
