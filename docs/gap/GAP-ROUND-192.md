# GAP-ROUND-192 — Advisory checks for npm marketplace plugins

Date: 2026-08-08 · Round type: coverage (round-191 carry-over)

## Problem

Round-191 flagged unpinned npm marketplace plugin sources for mutability,
but even a pinned npm plugin can be a known-malicious package. OpenCode
npm plugins (round-167) and runner-launched server packages already go
through OSV.dev + MCPA advisory correlation; npm-distributed marketplace
plugins did not.

## Change

`marketplacePluginRefs` extracts npm package refs (name + exact pinned
version when present) from `.claude-plugin/marketplace.json` plugin
entries; `scan` feeds them into the same pkgRefs pipeline as server
packages and OpenCode plugins — AG-SC-002 (OSV known-malware) and
AG-SC-003 (MCPA database), with `marketplace plugin "<name>"` context.

## Verification

End-to-end on a local fixture with a real advisory package
(`postmark-mcp@1.0.16`): AG-SC-003 critical (MCPA-2025-0002, version
range matched) + AG-SC-002 critical (MAL-2025-47604), both carrying the
marketplace plugin context. round-181 corpus: no npm plugin sources in
the wild yet — 0 new findings.

## Boundaries

- Git/archive/relative marketplace sources are not registry packages and
  are not advisory-checked (mutability covered by rounds 181/191).
- Custom `registry` URLs are queried against the same public databases
  (private-registry packages simply won't match).

## Evidence

- Full suite green: core 271, cli 47, config-convert 24.
- Self-scan 155 files: 18 findings (14 medium, 4 low), unchanged.
