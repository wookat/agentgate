# GAP-ROUND-301 — advisory sweep (upstream-stale) + npm overrides/resolutions join AG-DP-007

Date: 2026-08-08. Previous advisory sweep: round 298. Previous AG-DP-007 rounds: 294/296/297/298/299.

## Part 1: advisory routine sweep — window still stale upstream

- GHSA vulnerability-window watch (`node api/scripts/watch.mjs --dry-run`, authenticated):
  **no uncovered MCP-related advisories**.
- npm + PyPI OSV `all.zip` re-pulled: **byte-identical to the round-295 snapshots**
  (md5 60a9dfb7… / 0539f5e7… unchanged) — the upstream export has not refreshed since,
  so a diff has nothing to say. Honest call: no entries fabricated; the next advisory
  round must verify the export timestamp moved before diffing.

## Part 2: npm overrides / resolutions / pnpm.overrides redirections

The last uncovered mainstream npm remote-source surface, and the stealthiest:
`overrides` (npm), `resolutions` (yarn), and `pnpm.overrides` can redirect **any
transitive dependency** to a mutable git/tarball source — the direct dependency
tree looks clean while the resolved artifact comes from somewhere else entirely.
Before this round these tables were never read.

### After (this round)

- All three tables are walked (npm's nested-object form incl. the `"."` self key;
  `parent>child` pnpm keys; glob/`**` and `@scope/pkg@range` resolution keys reduced
  to the terminal package name).
- String values matching remote shapes (`git…`, `github:`, `http(s)://`) are emitted
  as remote specs and classified by the existing policy: unpinned git → medium,
  non-registry archive URL → high, full-SHA and registry tarball hosts
  (registry.npmjs.org / registry.yarnpkg.com) exempt.
- Registry-range overrides (e.g. `semver: "^7.5.4"`) are ignored — overridden names
  are transitive, not declaration refs, so nothing is sent to registry lookup.

### Wild results (real runs, built CLI, offline, before/after diff)

Targeted GitHub corpus (overrides/resolutions + git/tgz, 128 candidates → 124 fetched
wild `package.json`): baseline 48 AG-DP-007 hits (from regular dependency sections)
→ 56, i.e. **8 previously invisible override/resolution redirections
(1 high / 7 medium)**, spot-audit all true positives:

- Joystream overrides `typeorm` to a fork's GitHub release tarball (high) — exactly
  the fork-redirect shape a lockfileless CI would resolve blind.
- compound-finance (two repos) resolves `ganache-core` to a fork branch (medium).
- tetherto/pearpass overrides `electron-windows-msix` to a git branch (medium).

The other ~68 corpus resolutions point at registry.npmjs.org / registry.yarnpkg.com
version-addressed tarballs — correctly exempt, zero false positives.

## Boundaries

- Lockfile-level redirections (`package-lock.json` `resolved` URLs) are resolution
  data, not declarations — out of scope here (candidate for a lock-verification round).
- yarn `resolutions` `patch:` protocol specs are local patches, not remote sources —
  not matched (regex requires git/http shapes).

## Checks

472 → 473 tests green; lint/typecheck/build/`git diff --check` clean; patch changeset added.
