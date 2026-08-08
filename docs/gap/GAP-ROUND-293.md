# GAP-ROUND-293 — Codex marketplace manifests: `.cursor-plugin/marketplace.json` + `.agents/plugins/api_marketplace.json`

Round type: new-surface / precision sweep (previous new-surface round: 289).

## Candidate check (official sources)

- Claude Code changelog (2.1.22x window): the new `archive` plugin source was already
  covered forward in round 191 — no new repo-carried surface.
- Codex `rust-v0.147.0` (upstream `openai/codex`, `codex-rs/core-plugins/src/marketplace.rs`)
  recognizes **four** repository-carried marketplace manifest paths:

  ```rust
  const MARKETPLACE_MANIFEST_RELATIVE_PATHS: &[&str] = &[
      ".agents/plugins/marketplace.json",
      ".agents/plugins/api_marketplace.json",
      ".claude-plugin/marketplace.json",
      ".cursor-plugin/marketplace.json",
  ];
  ```

Round 289 covered `.agents/plugins/marketplace.json` (and `.claude-plugin/` was covered
since round 168), but `MARKETPLACE_CATALOG_FILE` did not match
`.cursor-plugin/marketplace.json` or `.agents/plugins/api_marketplace.json`, and plugin
discovery only looked for `marketplace.json`. Marketplace catalogs carry mutable plugin
sources (AG-SC-001), inline hooks (AG-SK-003), inline `mcpServers`, and npm plugin refs
(AG-SC-002/003) — so a manifest at an unmatched path was entirely invisible.

The internal loader cache path (`~/.codex/.tmp/plugins/.agents/plugins/marketplace.json`)
is runtime-only, not repo-carried — honestly excluded.

## Wild-corpus evidence (no invented data)

Existing corpora (`/home/ubuntu/corpora`) contain real `.cursor-plugin/marketplace.json`
files: `jpatrickb__jobtracker/.cursor-plugin/marketplace.json` and
`Sebfranklin__remote-workflows/.agents/skillopt/.cursor-plugin/marketplace.json`.
Before this round neither appeared in `scannedFiles`; after, both are scanned (both are
benign local `./` sources — 0 findings, 0 FPs). No `api_marketplace.json` found in
corpora yet; covered on upstream-source evidence with the same schema/parser.

## Fix

- `MARKETPLACE_CATALOG_FILE` (supply-chain + skill-poisoning copies) now also matches
  `.cursor-plugin/marketplace.json` and `.agents/plugins/api_marketplace.json`.
- Plugin discovery emits a `marketplace-json` location for
  `.agents/plugins/api_marketplace.json` (`.cursor-plugin/marketplace.json` was already
  discovered via `PLUGIN_META_DIRS`).
- Regression tests: discovery (inline `mcpServers` from both new manifests) and scanner
  (AG-SC-001 mutable source in `api_marketplace.json`, AG-SK-003 inline hook in
  `.cursor-plugin/marketplace.json`).

## Deployment consistency check (post-#430)

Production advisory data is consistent at 91 entries across the API
(`/v1/advisories`), the JSON feed, and the website advisory index.

## Remaining boundaries

- Personal-level `~/.codex/plugins` / `~/.agents/plugins` remain out of scope
  (not repo-carried).
- Codex installed-marketplace state files are runtime data, not scanned.
