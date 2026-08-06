# GAP-ROUND-75 — WCAG 2.1 AA audit of the production website (axe-core)

Date: 2026-08-07

## How the gap was found (real evidence)

Ran axe-core (WCAG 2A + 2AA rulesets) against the production site via a real
Chromium session on four representative pages. Two violations, both in light
mode:

1. **Homepage** — `scrollable-region-focusable` (serious): the horizontally
   scrollable terminal-demo blocks were not keyboard-focusable, so keyboard
   users could not scroll them.
2. **Advisory index** — `color-contrast` (serious): the `low` severity pill
   (`--ag-ok: #047857` at 12px on its tinted background) measured 4.48:1,
   just under the 4.5:1 AA threshold.

`/advisories/mcpa-2026-0016/` and `/docs/comparison/` were clean.

## Fix

- Added `tabindex="0" role="region" aria-label` to both scrollable demo
  blocks on the homepage.
- Darkened light-mode `--ag-ok` from `#047857` to `#065f46` (dark-mode value
  `#34d399` untouched; the token also colors the homepage demo checkmarks and
  advisory "fixed" pills, all of which only get more contrast).

## Verification

Re-ran the same axe-core audit against the locally built site: all four pages
now report **0 violations** (WCAG 2A/2AA).

## Routine checks this round

- Advisory watch (`WATCH_DAYS=2`): no uncovered MCP advisories.
- Competitors: socket 1.1.154, thynkQ mcp-scan 2.0.2, osv-scanner v2.4.0 —
  no movement. npm lookup for snyk-agent-scan failed today (registry/outage);
  not treated as a version change.

## Remaining gaps

- Audit covered 4 pages in light mode; dark-mode and remaining docs pages are
  a follow-up candidate.
- GitHub Actions outage continues; #139 CI and the 0.15.0 version PR remain
  queued.
