# GAP-ROUND-320 — Data checkpoint (rounds 311–319)

Every ~10 rounds, a measurement round: real numbers only, no projections.
Previous checkpoint: GAP-ROUND-310.

## What shipped (rounds 311–319)

| Round | PR | Theme |
| --- | --- | --- |
| 311 | #455 | Findings-table over-wide token wrapping (URLs no longer truncated) |
| 312 | #457 | Copilot CLI extension `description` literals scanned for injection (AG-SK-001) |
| 313 | #458 | Crush `.crush/skills` project tree walked (+ clean advisory window; PyPI OSV export refreshed, 0 relevant) |
| 314 | #460 | goose `.goose` project tree + in-repo symlinked skill trees followed |
| 315 | #461 | goose recipe quoted-example/prose curl\|sh precision fixes (+ clean advisory window) |
| 316 | #462 | Deterministic walk order — stable symlink-alias attribution |
| 317 | #463 | goose local memory files (`.goose/memory/*.txt`) scanned for poisoning |
| 318 | #464 | goose Open Plugin manifests (`.goose-plugin/`) + component `mcpServers.paths` form |
| 319 | #465 | Standalone plugin repos' `commands/`/`agents/` markdown, manifest-gated |

Main line of the block: closing the goose/Crush repository-carried surface from
upstream source (313–318 — project trees, symlinks, memories, plugins) and
finishing the plugin-component arc for standalone plugin repos (319), plus one
CLI UX defect (311) and one text-surface addition (312).

## Measured data (2026-08-03, all real)

- **Tests**: 489 vitest (403 core / 56 cli / 30 config-convert) + 24 node API
  tests, all green. Round-310 checkpoint: 476 vitest.
- **Coverage** (core): 94.24% statements / 85.23% branches / 99.01% functions /
  97.06% lines (v8, enforced gate).
- **Self-scan**: 227 files, 21 findings, 0.80s wall (round-310: 226 files,
  0.80s — same performance envelope).
- **Advisory database**: 99 records; production API and feed both serve 99,
  website 200. No additions this block: watch `--dry-run` re-run clean this
  round (GHSA + malware windows), and the only fresh OSV export window (r313,
  PyPI) contained one non-MCP MAL rejected on the bar.
- **Corpus evidence this block**: 12 goose repos (r315), genmedia 40-alias
  symlink tree (r316), 8 repos / 27 memory files (r317), 1 wild `.goose-plugin`
  (r318), 6 standalone plugin repos / 67 previously invisible command+agent
  files (r319) — zero false positives after the r315 precision fixes.
- **Releases**: v0.67.3 on npm; version PRs #448/#456/#459 merged → repo at
  0.67.6 (cli/core; config-convert stays 0.14.0), npm publish pending the
  manual SOP (round-318/319 patches will roll into the next version PR).
- **Competitors** (re-checked this round): mcp-scan 2.0.2, socket 1.1.155 —
  unchanged. Registry lookups for osv-scanner/snyk-agent-scan returned no npm
  version this round (distribution moved off npm dist-tags for osv-scanner);
  no claim of change.
- **Adoption**: npm last-month downloads 3,124 (mcp-agentgate) / 3,355
  (mcp-agentgate-core) — the twentieth consecutive flat checkpoint.
  Distribution remains the biggest gap and stays a leadership decision.

## Open threads carried forward

- OSV npm export refreshed once in r315 (id diff 0); freshness still must be
  verified per advisory round before trusting snapshot diffs.
- GAP-305: `joinSession({tools,hooks})` static tool extraction unimplemented.
- GAP-316: lexicographic alias attribution is deterministic, not a semantic
  ownership policy.
- GAP-318: Open Plugin `skills.paths` component form needs no extra resolution
  (in-repo skill trees are scanned wherever they live).
- GAP-319: bare root `plugin.json` alone does not gate component markdown
  (filename too generic); only dot-dir manifests mark a plugin root.
