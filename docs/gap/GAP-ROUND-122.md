# GAP-ROUND-122 — Roo Code rules are agent instructions; scan + lock them

Date: 2026-08-07 · Round type: coverage expansion (instruction-file scanning)

## Gap found (same class as rounds 118/121)

Roo Code's MCP config (`.roo/mcp.json`) has been discovered since round 73,
and the legacy `.clinerules`/`.roorules` heritage was partially covered —
but Roo Code's own documented rule surfaces were not:

- workspace rules directory `.roo/rules/` (md/txt, preferred method)
- mode-specific `.roo/rules-<mode>/` directories
- single-file fallbacks `.roorules` and `.roorules-<mode>`

Sources: docs.roocode.com custom-instructions feature docs and the v3.11.8
release notes introducing `.roorules` (which also deprecated `.clinerules`
for Roo). These are verbatim-injected instructions — skill scanning and
`lock --skills` ignored the directory form and the mode-suffixed forms
(plain `.roorules` was never matched either; only Cline's `.clinerules`).

## What shipped

- `SKILL_FILE` now matches `.roo/rules(-<mode>)?/**.md|txt` and
  `.roorules(-<mode>)?`; `.roo` added to the agent dot-dirs the repo
  walker descends into.
- `lock --skills` pins them automatically (same collection path).
- Test: poisoned `.roo/rules/*.md`, `.roo/rules-code/*.txt`, and
  `.roorules-docs` all report AG-SK-001 critical; benign coding-style rule
  reports nothing.
- Docs: skills guide lists the Roo Code layout.

## Deliberately NOT added (honest)

- Global `~/.roo/rules/` — outside the project tree, same repo-scoped
  limitation noted in GAP-ROUND-121 (possible future `scan --home`).

## Evidence

- Fixture scan: 3 poisoned Roo rule files → 3× AG-SK-001 critical; benign
  rule → 0 findings.
- Full suite green: core 198, cli 47, config-convert 23; website 65 pages.

## Routine sweep

- v0.25.0 tag/Release/redeploy/clean regression completed this window
  (Trae config + rules, Kiro steering, Qoder discovery all verified on
  the published artifact).
