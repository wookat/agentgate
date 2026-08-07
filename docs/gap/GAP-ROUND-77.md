# GAP-ROUND-77 — scrollable code blocks keyboard-reachable (a11y follow-up)

Date: 2026-08-07

## Gap (real evidence)

Post-deploy re-audit of round-76 found one more `scrollable-region-focusable`
(serious) violation on `/docs/cli/scan/`: an expressive-code block whose
content overflows horizontally cannot be scrolled by keyboard users. This is
viewport/content dependent — any docs code block wide enough to overflow
triggers it, so a per-page fix would not stick.

## Fix

Site-wide script in the shared `Head.astro` override: on load and resize,
every `.expressive-code pre` that actually overflows gets
`tabindex="0" role="region" aria-label`; the tabindex is removed when it no
longer overflows (avoids pointless tab stops).

## Verification

Local build audited on 4 docs pages (scan, comparison, skills guide,
quick-start) in both themes: 0 WCAG 2A/2AA violations everywhere.

## Round 75–77 arc

- 75: light-mode audit → focusable homepage demos + low-pill contrast.
- 76: dark-mode audit → TOC/sidebar `--sl-color-gray-3` contrast.
- 77: overflow-dependent code blocks → site-wide dynamic fix.
All sampled pages now clean in both themes on production once deployed.
