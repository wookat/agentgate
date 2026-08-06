# GAP Report — Round 30 (website visual walk, mobile + desktop)

Automated visual pass over 6 key production pages at 390×844 and 1440×900
(Playwright): home, docs intro, advisory index, advisory detail, `agentgate scan`
docs, advisory API spec.

## Result

- No page-level horizontal overflow anywhere (documentElement scrollWidth clean
  on all 12 page/viewport combos).
- Home, docs, and advisory index render correctly on mobile (nav collapse,
  code blocks scroll, cards stack).
- **P2 fixed — advisory detail "Affected packages" table clipped on mobile**:
  the raw HTML table on `/advisories/{id}/` pages overflowed its column ("Affected
  versions" cut off) with no way to scroll. Wrapped in an `overflow-x: auto`
  container; verified scrollable at 390px (scrollWidth 370 > clientWidth 343).

## Honest limits

- Visual checks are viewport-sampled (390px, 1440px), not exhaustive across
  devices; no dark/light theme diffing this round.
