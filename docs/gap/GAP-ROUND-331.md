# GAP-ROUND-331: Codex marketplace catalogs in the component-declaration parser

Round type: boundary closeout of GAP-329 (marketplace-entry declared components).
Date: 2026-08-09.

## Official semantics (openai/codex upstream, codex-rs/core-plugins)

- `marketplace.rs` `MARKETPLACE_MANIFEST_RELATIVE_PATHS`: recognized catalog
  locations are `.agents/plugins/marketplace.json`,
  `.agents/plugins/api_marketplace.json`, `.claude-plugin/marketplace.json`,
  and `.cursor-plugin/marketplace.json`.
- Entry `source` deserializes as a plain string path **or** a tagged object:
  `{ "source": "local", "path": "./..." }` (also `url`, `git-subdir`, `npm`).
  Local paths must stay within the marketplace root (`Component::Normal` only).
- All extra entry fields are `#[serde(flatten)]`-captured as `manifest_fields`
  and become a **fallback plugin manifest** (`MarketplacePluginManifestFallback`,
  parsed with the same `parse_plugin_manifest` as `.codex-plugin/plugin.json`)
  — used when the installed source carries no manifest of its own. This is the
  Codex analogue of Claude Code `strict: false`: the marketplace entry itself
  can declare `skills` (and the other component paths) for a manifest-less
  source directory.

## Gap

The r329 component-declaration parser only read
`<meta>/marketplace.json` for `.claude-plugin` / `.github/plugin` /
`.factory-plugin` / `.cursor-plugin`, and only accepted **string** sources. So
for Codex catalogs:

- `.agents/plugins/marketplace.json` and `api_marketplace.json` entries never
  gated their source roots or contributed component declarations;
- the object form `{ source: "local", path: "./x" }` — the dominant wild shape
  (see below) — was skipped even in the catalogs we did read.

A manifest-less local source installed via a Codex catalog with entry-declared
`skills` was therefore invisible to text scanning and `lock --skills`.

## Change

- `MARKETPLACE_CATALOG_PATHS` replaces the dir list: all six catalog files are
  parsed and merged (a repo can carry both a Claude and a Codex catalog);
  per-catalog parse errors skip that catalog instead of aborting.
- `localSourcePath()` accepts string sources (remote `://` rejected) and the
  Codex `{source:"local", path}` object; `url`/`git-subdir`/`npm` objects are
  not local roots. Root/`..`/absolute containment checks unchanged.
- Regression test pins the Codex catalog end-to-end: object-form local source
  + entry `skills` declaration → poisoned md critical & lockable; conventional
  manifest-less source root scans; `url`-object entry contributes nothing.

## Corpus evidence (real, honest)

- 24 repos across r321/r328 carry `.agents/plugins` catalogs (24 entries:
  local object form dominates — `{'source':'local','path':'./...'}`; plus
  string `./`, `url`, and `git-subdir` entries). Zero entries declare
  component fields today.
- Every wild local source root (e.g. `./plugins/canary`, `./codex`,
  `./codex/loctree-first`) carries a `.codex-plugin/plugin.json`, so those
  roots were already gated by the generic plugin-root walk.
- Head-to-head feature vs main (dc5abfc): the 24 `.agents/plugins` repos and
  the full 358 catalog-bearing corpus selection are **identical** in
  scanned-file and finding counts — zero measured wild delta, zero regressions.
  Like r329, this closes a layout the official loader supports (fallback
  manifests for manifest-less local sources) before it appears in the wild.

## Boundaries (as-is)

- Codex `manifest_fields` can also carry `mcpServers`/`apps`/`hooks` for the
  fallback manifest; hooks/mcpServers at marketplace-entry level remain
  unmodeled (inline marketplace hook extraction covers the Claude shape only).
- `npm`-sourced marketplace entries are advisory-checked via the existing
  supply-chain path; no change here.
