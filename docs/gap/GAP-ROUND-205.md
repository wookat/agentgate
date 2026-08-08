# GAP-ROUND-205 — Copilot CLI plugin surfaces (marketplace + plugin manifests)

## Scope

Rounds 201–204 covered Copilot CLI agents, MCP configs, hooks, and settings. This round
covers the plugin distribution surface, verified against the official plugin reference
(github/docs `cli-plugin-reference.md`):

- A repo hosts a Copilot plugin marketplace via `.github/plugin/marketplace.json`
  (schema and `source` types — `github`/`url` with optional `ref`/40-char `sha`,
  relative paths — match the Claude Code `.claude-plugin/marketplace.json` schema;
  the docs explicitly recommend pinning `sha` "for reproducible installs that are
  immune to force-pushes or tag/branch moves").
- Plugin manifests are checked at `.plugin/plugin.json`, `plugin.json`,
  `.github/plugin/plugin.json`, or `.claude-plugin/plugin.json` (in this order).
  Manifests carry `hooks` (path or inline object), `mcpServers` (path or inline —
  "activate when the plugin is installed"), and `lspServers`.
- First-party marketplaces (`copilot-plugins`, `awesome-copilot`) auto-update at
  session start in trusted directories.

## What shipped

1. `MARKETPLACE_CATALOG_FILE` (skill-poisoning + supply-chain) widened to
   `.github/plugin/marketplace.json` — mutable-source (AG-SC-001) and inline
   entry-hook (AG-SK-003) checks apply.
2. `PLUGIN_MANIFEST_FILE` widened to `.plugin/` and `.github/plugin/` — inline
   manifest hooks classified; both the nested Claude shape and the flat Copilot
   event shape (`{ event: [{ type: "command", bash, powershell }] }`) are extracted
   in the manifest and marketplace-entry branches.
3. Discovery: plugin roots marked by `.plugin/plugin.json` or
   `.github/plugin/plugin.json` get manifest `mcpServers` resolution + advisory
   cross-check, same walker as `.claude-plugin` roots; scanner walks the new dirs.

## Corpus evidence

- GitHub code search: 524 files at `.github/plugin/marketplace.json`,
  147 `plugin.json` under `.plugin/` paths.
- True positives: **github/awesome-copilot** (official first-party marketplace,
  130 plugins) — 15 third-party plugin entries served from mutable github sources
  with no `sha`/release `ref` (e.g. `azure` from `microsoft/azure-skills` with no
  ref at all); 26 object sources correctly pass with `ref: vX.Y.Z` pins.
- Clean: dotnet/skills, upstash/context7, headroomlabs-ai/headroom marketplaces
  (relative-path or pinned sources) — 0 findings.

## Boundaries (not modeled)

- Bare repo-root `plugin.json` (second checked manifest location) is not matched —
  too generic a filename (Grafana/Obsidian/game-engine manifests); the dotted
  meta-dir locations carry the Copilot corpus.
- Marketplace `metadata.pluginRoot` indirect addressing (same round-184 boundary).
- Installed-plugin trees under `~/.copilot/installed-plugins/` (user-local state,
  not repository content).
- `--skill` direct installs and the policy-configured MCP registry (interactive,
  authenticated; no repo-carried artifact).

## Validation

- `pnpm build && pnpm lint && pnpm typecheck && pnpm test`: green
  (core 291 / cli 47 / config-convert 24).
- Self-scan: 18 findings (unchanged).
