# GAP-ROUND-181 — Mutable plugin sources in marketplace catalogs

Date: 2026-08-08 · Round type: coverage completion (round-168 candidate)

## Surface

Round-168 checked the consumer side (`extraKnownMarketplaces` +
`enabledPlugins` in `.claude/settings.json`) but left the distributor
side unmodeled: a repo hosting a marketplace catalog
(`.claude-plugin/marketplace.json`) lists plugin entries whose `source`
tells Claude Code where to fetch plugin code. Official plugin-marketplaces
reference: git-based plugin sources are `github` (`repo`, `ref?`, `sha?`),
`url` (`url`, `ref?`, `sha?`), and `git-subdir` (`url`, `path`, `ref?`,
`sha?`); when both are set the `sha` is the effective pin. A source with
neither serves every installer whatever the branch points at.

Prevalence: GitHub code search reports ~28,672 files at
`.claude-plugin/marketplace.json` and ~1,696 with `"source": "github"`.

## Change

- `.claude-plugin` added to the walked agent dot-dirs (the catalog was
  previously not even visited).
- AG-SC-001 flags plugin entries with a mutable git source (no sha, no
  release-style ref) at medium, reusing `isMutableMarketplaceSource`
  (extended with `git-subdir`). Relative-path string sources are clean.

## Real corpus (5 repos, unmodified)

- anthropics/claude-plugins-official — clean (relative-path sources).
- davepoon/buildwithclaude (community catalog) — 9 medium TPs, all
  third-party github sources with no pin.
- InsForge/InsForge — 1 medium TP (separate insforge-skills repo, no pin).
- addyosmani/agent-skills, storybookjs/react-native — 1 medium each;
  these are *self-referencing* sources (the catalog points at its own
  repo). Per rule semantics still mutable for installers, but recorded
  as a boundary case (same class as round-168 NevermoreEngine).

## Boundaries

- Self-referencing sources are not special-cased (the scanner cannot
  know the repo's own remote identity from the filesystem).
- `strict: false` entries and marketplace `metadata.pluginRoot`
  indirection are not modeled beyond source-type checks.

## Evidence

- Full suite green: core 257, cli 47, config-convert 24.
- Self-scan unchanged: 155 files, 17 findings (13 medium, 4 low).
