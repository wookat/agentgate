# GAP Report — Round 38 (advisory index filter state in the URL)

## Gap

Round 34's severity filter and search were view-local state: refreshing reset
them, and there was no way to share "all critical advisories" or "everything
matching flyto" as a link — table-stakes for advisory databases (GitHub
Advisory DB and OSV.dev both encode queries in the URL).

## Fixed

`website/src/pages/advisories/index.astro`: filter changes now
`history.replaceState` a canonical query string (`?severity=critical&q=flyto`,
omitted when empty), and the page hydrates its initial state from
`location.search` on load. Unknown severity values are ignored.

## Verified (local production build via CDP browser)

- `?severity=critical&q=flyto` on load → 2 cards, critical pill pressed.
- Interacting updates the URL live (`?q=mcp-remote` after toggling off).
- `?severity=bogus` → ignored, all 28 shown.

## Honest limits

- `replaceState` (not `pushState`): filter changes don't create history
  entries — deliberate, avoids trapping Back-button navigation.
