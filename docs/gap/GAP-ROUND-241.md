# GAP-ROUND-241 — Antigravity workflows scanning

Date: 2026-08-08. Closes the round-239 boundary: Google Antigravity
**Workflows**, verified against the official docs
(antigravity.google/docs/rules-workflows) and the documented on-disk layout.

## What shipped

Workspace workflows `.agents/workflows/*.md` (plus legacy
`.agent/workflows/*.md`) are now scanned by AG-SK-001. Workflows are markdown
step files invoked as `/workflow-name` slash commands; their content becomes
trajectory-level agent instructions (and workflows can call other workflows),
so they are the same poisoning surface as rules/skills.

Implementation: the existing `.agents?/rules` alternative in `SKILL_FILE`
extended to `(rules|workflows)` — one-line rule change plus tests.

## Real-corpus verification

4 cloned GitHub repos with real `.agents/workflows` trees (AMDResearch/omniprobe
— 45 workflow files, abapify/adt-cli — 7, HoangTheQuyen/think-better — 8,
arpingblue/vibepm — 1): all 61 files scanned, **0 false positives**. Focused
true-positive/benign fixtures added in tests.

## Boundaries recorded honestly

- Global workflows (`~/.gemini/config/global_workflows/`) live outside the
  repository and are not part of repo scans (same policy as other global
  skill trees; global MCP configs are discovered separately).
- Workflow frontmatter (title/description) is not interpreted; `/workflow`
  cross-references are not resolved — text scanning only.

## Checks

- Tests 351/47/24 (+1 workflows fixture); lint/typecheck/build/diff-check
  clean; self-scan 21 findings (unchanged baseline).
