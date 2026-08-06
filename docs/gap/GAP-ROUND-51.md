# GAP Report — Round 51 (report-viewer verification + comparison page)

## Report viewer (round-50 candidate #1, closed)

Loaded a real 0.11.1 skill-findings report (3 AG-SK-002 findings from
`.claude/commands/analyze.md`) into the production report viewer via a real
browser: severity buckets, filter pills, category badges, and file paths all
render correctly for skill findings. No changes needed.

## Comparison page (round-50 candidate #2, closed)

Rounds 41/47 produced verified competitor evidence with nowhere public to
live. New `docs/comparison` page:

- every claim dated and sourced from real runs (last verified 2026-08-06);
- unverifiable competitor capabilities marked "unknown", not "absent";
- a "where competitors are stronger" section (socket behavioral analysis,
  osv-scanner ecosystem breadth, snyk runtime guardrails) — honesty cuts
  both ways;
- sidebar entry under Security.

## Verified

- Website production build green; claims cross-checked against
  GAP-ROUND-41/47 evidence.

## Maintenance note

The comparison page has a "last verified" date that must be bumped whenever
competitor re-checks happen (routine in the loop). Stale-date is the failure
mode; the date makes it visible.
