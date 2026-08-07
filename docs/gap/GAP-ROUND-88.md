# GAP-ROUND-88 — advisory-watch issues carry ready-to-run triage commands

Date: 2026-08-07

## Gap (real evidence)

Round-84 added `watch.mjs --draft GHSA-…`, but the weekly advisory-watch
issue body never mentions it: a triager opening the issue sees bare GHSA
links and must remember (or rediscover) the draft command and the
false-positive ignore file. The command was invisible exactly where it is
needed.

## Fix

`renderReport` appends a `### Triage` section whenever there are GHSA hits:
one ready-to-run `node api/scripts/watch.mjs --draft <id>` line per hit,
plus a pointer to `api/advisories/watch-ignore.json` for false positives.
OSV-only reports (already-tracked packages) omit the section. Tests cover
both branches (api suite 21/21).

## Real-world validation this round

FP sweep of the round-86 skill-server extraction against real marketplaces
(claude-code-templates ~906 SKILL.md, anthropics/claude-code): no repo in
the wild uses `mcpServers` frontmatter or sibling `mcp.json` under a skills
root yet — zero extraction FPs, scan of the 4,314-file repo in 1.2s, and
the repo's own `.mcp.json` correctly flags `mcp-remote` (MCPA-2025-0001 /
CVE-2025-6514) plus unpinned/unauthenticated servers.

## Still open (honest)

- `includeTools` allowlists in skill server entries still uninterpreted.
- The triage section is only as good as the GHSA keyword filter; OSV hits
  for new packages still need manual drafting (no `--draft` for OSV ids).
