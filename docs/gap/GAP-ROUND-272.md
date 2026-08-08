# GAP-ROUND-272 — Website visual/UX walkthrough

Date: 2026-08-08. Frontend walkthrough round (previous deep pass: rounds
75–77 accessibility series). Real-browser walkthrough of the production site
(https://agentgate.zalize.com) at desktop 1280px and mobile 375px viewports,
light and dark color schemes.

## Pages walked

Homepage, advisory index, advisory detail (MCPA-2026-0064/0065 — the newest
entries), comparison, quick-start, skills guide, overprivileged rule page,
config-convert reference. All return 200; detail-page URLs are lowercase
(`/advisories/mcpa-2026-00NN/`).

## Measured checks (all pass)

- Advisory index renders **79** advisory links; severity filter
  (`?severity=critical` → 29 visible) and client-side search
  (`agenttunnels` → 1 visible) work; filter state persists in the URL
  (round-38 behavior intact).
- No horizontal overflow at 375px on homepage, advisory index, advisory
  detail, or the comparison page (round-30/75 fixes intact).
- Dark mode advisory detail renders with correct contrast (round-76 fixes
  intact).
- Live data three-way consistent post-#401 deploy: API `/v1/advisories` 79,
  advisory index 79, JSON feed `items` 79; comparison page says
  "79 public advisories" (round-255 CI gate did its job on merge).
- Homepage npm badge shows the current v0.63.0.

## Drift found and fixed

- Homepage "Install" step client list was missing **Kilo Code** (round 269
  added it to README/quick-start/scan docs but not `index.astro`). Fixed —
  the only place in README/website client lists that had drifted (verified
  by grep across README.md, package READMEs, and website/src).

## Boundaries

- The homepage client list is hand-maintained prose; a round-255-style CI
  gate for client-list drift would need a canonical client registry to diff
  against — noted as a candidate for a future round, not built speculatively.
