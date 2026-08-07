# GAP-ROUND-191 — npm and archive marketplace plugin sources

Date: 2026-08-08 · Round type: coverage (round-181/189 boundary)

## Problem

Marketplace plugin entries can be distributed as npm packages
(`source: "npm"`, optional `version` accepting ranges) or zip archives
(`source: "archive"`, optional `sha256` pin) — official docs document
both, and Claude Code refuses an archive only when a declared pin
mismatches. Round-181 mutability checks only modeled git-based sources,
so an unpinned npm/archive plugin escaped AG-SC-001 entirely.

## Change

`isMutableMarketplaceSource` now covers all documented remote source
types: npm with no exact version (absent or a range like `^2.0.0`)
reports medium, archive with no 64-hex `sha256` reports medium. Exact
versions and sha256-pinned archives stay clean. Findings carry
source-type-specific pin advice ("Pin an exact version" / "Pin the
archive with a sha256 digest"). The same check guards
`.claude/settings.json` `extraKnownMarketplaces` auto-enable paths.

## Real corpus

round-181 corpus: no npm/archive plugin sources exist in the wild yet
(the source types shipped recently — archive requires Claude Code
v2.1.224+) — 0 new findings, all existing findings unchanged. True
positives covered by unit fixtures (npm range / floating / pinned,
archive unpinned / pinned).

## Boundaries

- npm marketplace plugin packages are not yet correlated against
  OSV/MCPA advisories (candidate next round — reuse the OpenCode plugin
  pipeline from round-167).
- Custom `registry` URLs are not risk-modeled.

## Evidence

- Full suite green: core 270, cli 47, config-convert 24.
- Self-scan 155 files: 18 findings (14 medium, 4 low), unchanged.
