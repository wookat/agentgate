# GAP-ROUND-243 — precision sweep of the Antigravity surface (rounds 239/241)

Date: 2026-08-08. Docs-only round: large-corpus verification of the new
Google Antigravity scanning surface — workspace MCP configs
(`.agents/mcp_config.json`), hooks (`.agents/hooks.json`), workflows
(`.agents/workflows`), and legacy rules (`.agent/rules`). No code changes
were needed.

## Corpus

GitHub code search across `path:.agents filename:mcp_config.json`,
`path:.agents filename:hooks.json`, and `path:.agent/rules extension:md`;
18 distinct real repositories cloned and scanned (incl. snowdreamtech/frp,
opendatahub-io/notebooks, proffesor-for-testing/agentic-qe — a 59-finding
repo vendoring a whole agent framework under `.agents/skills/`, dotfiles
repos, and Obsidian/extension projects). Combined with round-241's 4
workflow-corpus repos (61 workflow files), the sweep covers 22 repos.

## True positives (previously invisible before round 239)

- 4 repos' `.agents/mcp_config.json` report unpinned MCP packages
  (`chrome-devtools-mcp@latest`, `@upstash/context7-mcp`,
  `@anthropic/mcp-github`, `next-devtools-mcp@latest`, `wdio-mcp`, …) with
  the `-y` auto-confirm companion finding — classic rug-pull surface.
- rudironsoni/obsidian-advanced-code-editor: hidden U+200B in a skill
  reference file under `.agents/skills/` (AG-SK-001 critical).
- Skill/command trees under `.agents/` (pre-existing matcher) surface
  Bash/Write/Edit/WebSearch pre-approvals (AG-SK-002) and code-block-quoted
  injection markers correctly downgraded to low.

## False positives

- **0 new false positives** from the round-239/241 surfaces: no
  `.agents/workflows` or `.agent/rules` file misfired anywhere in the
  corpus; benign `mcp_config.json` entries and hooks stayed quiet.
- snowdreamtech/frp (48 search hits for `.agents` files) produced zero
  agents-surface findings — the volume was i18n/doc trees, correctly
  ignored.

## Boundaries recorded honestly

- Vendored framework trees under `.agents/skills/<pkg>/docs|plugins/**.md`
  match the skills matcher and can report low-severity code-block hits from
  README/USERGUIDE files (agentic-qe). These are quiet lows by design
  (documentation-context downgrade); not reclassified this round —
  candidate for a docs-subtree heuristic if wild noise grows.

## Checks

Scanned with the round-241 build; scan times < 1.5 s per repo (159-finding
dotfiles repo included). Self-scan baseline 21 unchanged.
