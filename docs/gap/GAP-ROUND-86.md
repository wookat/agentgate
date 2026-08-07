# GAP-ROUND-86 — extract skill-declared MCP servers (Amp convention)

Date: 2026-08-07

## Gap (real evidence)

GAP-ROUND-85 recorded the open item: Amp skills can define MCP servers of
their own — a sibling `mcp.json` (bare `name → entry` map) or an
`mcpServers` field in `SKILL.md` frontmatter — and Amp connects to them when
it discovers the skill (ampcode.com/manual, "MCP servers in skills"; when
both exist, frontmatter wins and `mcp.json` is ignored). We scanned the
SKILL.md *content* but never extracted these servers, so a skill could ship
an unpinned or advisory-listed MCP server that bypassed every AG-SC rule.

## Fix

Discovery gains two skill formats (`skill-mcp-json`,
`skill-frontmatter-yaml`) resolved per skill directory with Amp's shadowing
rule, over three roots:

- workspace `.agents/skills/*/` and `.claude/skills/*/`
- user `~/.config/amp/skills/*/`

Extracted servers flow through the existing MCP config rule set
(AG-SC-001 unpinned, AG-SC-003 advisories, etc.).

## Verification

- Fake-HOME real run: frontmatter-declared `ludus-mcp@1.0.24` in an Amp
  user skill hits all 3 MCPA advisories; a workspace skill's sibling
  `mcp.json` with an unpinned server reports AG-SC-001.
- Unit tests: bare-map parsing, frontmatter parsing (incl. no-`mcpServers`
  case), and directory resolution with frontmatter shadowing `mcp.json`.
- Core suite 178 green; lint + typecheck clean.

## Still open (honest)

- `includeTools` allowlists in skill server entries are ignored (no rule
  interprets them yet).
- Claude Code has no documented skill-level MCP declaration; `.claude/skills`
  is included because the layout is identical and harmless when absent.
