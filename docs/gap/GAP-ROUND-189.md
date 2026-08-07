# GAP-ROUND-189 — Inline marketplace plugin entries (strict: false)

Date: 2026-08-08 · Round type: coverage (round-181/183 boundary)

## Problem

Marketplace catalog entries (`.claude-plugin/marketplace.json`) can define
a plugin entirely inline with `strict: false` — official docs' "advanced
plugin entries" example carries entry-level `hooks` and `mcpServers`
directly in the catalog. Round-181 only checked entry *sources* for
mutability; the inline component surfaces escaped both AG-SK-003 and MCP
discovery.

## Change

- Discovery: `marketplace-json` format — entry-level `mcpServers` objects
  are collected and run through the full config rule set + OSV/MCPA
  advisory checks.
- AG-SK-003: entry-level `hooks` commands go through the shared dangerous
  command classifier (`${CLAUDE_PLUGIN_ROOT}` script hooks stay clean).

## Real corpus

round-181 corpus (incl. buildwithclaude's 60-plugin catalog and the
official anthropics marketplace): no inline `hooks`/`mcpServers` entries
exist in the wild yet — 0 new findings, all round-181 mutable-source
findings unchanged. True positives covered by unit fixtures.

## Boundaries

- Entry-level `commands`/`agents`/`skills` path lists are not resolved
  (markdown components; SKILL.md files are already scanned wherever they
  live).
- `metadata.pluginRoot` indirection is unmodeled (still no wild evidence).

## Evidence

- Full suite green: core 269, cli 47, config-convert 24.
- Self-scan 155 files: 18 findings (14 medium, 4 low), unchanged.
