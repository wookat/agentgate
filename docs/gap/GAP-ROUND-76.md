# GAP-ROUND-76 — dark-mode WCAG AA audit (follow-up to round 75)

Date: 2026-08-07

## Gap (real evidence)

Round-75 audited light mode only. Re-ran axe-core (WCAG 2A/2AA) in dark mode
against production on 7 pages (home, advisories index/detail, comparison,
skills guide, scan docs, report viewer). Docs pages failed `color-contrast`
(serious): Starlight's "On this page" TOC links and the sidebar meta text use
`--sl-color-gray-3`, which our theme pinned to `#64748b` — 3.95:1 on the dark
docs background `#0b1120` (needs 4.5:1). 5 nodes per docs page; non-docs
pages were clean in dark mode.

## Fix

Dark-theme `--sl-color-gray-3` lightened `#64748b` → `#7b8aa2` (5.38:1 on
`#0b1120`, computed with the WCAG relative-luminance formula). Light-theme
`--sl-color-gray-3` (also `#64748b`, 5.1:1 on white) untouched.

## Verification

Local build re-audited in both themes on the 3 affected docs pages plus home
and advisories index: 0 violations dark and light. One transient homepage
light-mode report during theme toggling did not reproduce in a clean pass
(0 violations); production light mode also audited 0 after the round-75
deploy.

## Round-75/76 combined status

All 7 sampled production pages: 0 WCAG 2A/2AA violations in light mode;
dark mode clean after this fix deploys.
