# GAP Report — Round 34 (advisory index: severity filter + search)

## Gap

The advisory index now lists 28 entries as one flat wall of cards. Peer
databases (GitHub Advisory Database, OSV.dev) offer severity filtering and
free-text search; ours had neither — finding "the flyto-core SSRF one" meant
scrolling and reading. The severity pills at the top were static text that
looked clickable but did nothing.

## Fixed

`website/src/pages/advisories/index.astro`:

- The severity count pills are now toggle buttons (`aria-pressed`) that filter
  the card list; clicking the active pill clears the filter.
- Added a search input matching against id, title, type, aliases (CVE/GHSA/
  PYSEC/MAL ids), and `ecosystem/name` package coordinates — all pre-lowered
  into a `data-search` attribute at build time, filtered client-side with a
  few lines of vanilla JS (no framework, no network).
- An explicit "No advisories match the current filter." empty state.

## Verified (local production build via CDP browser)

- 28 cards → critical pill → 14; search `flyto` under critical → 2.
- `CVE-2026-55787` → exactly MCPA-2026-0013; `pypi/flyto-core` → 4.
- Nonsense query → 0 cards + empty-state visible; clearing restores 28.

## Competitor check (this round)

- socket 1.1.154 (patch, published today), osv-scanner still v2.4.0,
  mcp-scan PyPI 0.4.3 unchanged. No new capability to chase.

## Honest limits

- Search is substring-only (no fuzzy match, no URL-persisted filter state).
- Type facet is searchable text but has no dedicated filter buttons yet.
