# GAP-ROUND-289: Codex Agent Plugins repository surface

Round type: new-surface check (last: round 287). Date: 2026-08-03.

## Surface verified from official sources

- Official docs (developers.openai.com/codex/plugins/build): a Codex plugin is a directory
  with a `.codex-plugin/plugin.json` manifest; a repo can carry a plugin marketplace at
  `.agents/plugins/marketplace.json` whose `plugins[]` entries have `source` (local `./` path,
  GitHub shorthand, HTTP/SSH git URL, optional pinned ref). Plugins package skills, MCP
  servers, apps, and hooks.
- Upstream source (openai/codex, codex-rs):
  - `exec-server-protocol/src/protocol.rs`: recognized manifest paths beneath a plugin root are
    `.codex-plugin/plugin.json`, `.claude-plugin/plugin.json`, and `.cursor-plugin/plugin.json`.
  - `core-plugins/src/manifest.rs`: manifest deserializes camelCase — `skills`, `mcpServers`
    (path string or inline object), `apps`, `hooks` (path list or inline list of hooks-file
    objects, each wrapping the nested `{ Event: [{ hooks: [{type:"command",...}] }] }` shape).
  - App-server tests confirm plugin roots also carry servers in a sibling `.mcp.json`.

## Gap found

Before this round, `.codex-plugin/` and `.cursor-plugin/` manifests and
`.agents/plugins/marketplace.json` were invisible: not plugin metadata dirs in discovery, not
matched by the plugin-manifest/marketplace regexes, and not walked by the repo scanner. Inline
Codex hook lists (array-of-hooks-file shape) were also not extracted.

## Change

- discovery: `.codex-plugin`/`.cursor-plugin` added to plugin metadata dirs; `.agents` traversal
  maps to `.agents/plugins` for marketplace discovery (same model as `.github` → `.github/plugin`).
- rules: `.codex-plugin`/`.cursor-plugin` added to `PLUGIN_MANIFEST_FILE`; `.agents/plugins`
  added to the marketplace catalog matchers (supply-chain + skill-poisoning); plugin-manifest
  hook extraction now also unwraps the Codex inline hooks-file list shape.
- scanner: `.codex-plugin`/`.cursor-plugin` added to agent dot-dirs so their skill trees scan.

## Corpus evidence (real, existing corpora)

- 19 wild files across 9 real repos in existing corpora match the new paths
  (`.codex-plugin/plugin.json`, `.cursor-plugin/plugin.json`, `.agents/plugins/marketplace.json`).
- Re-scan of those 9 repos: 10 previously-invisible findings — 1 AG-SC-001 mutable marketplace
  source (ooples/token-optimizer-mcp `.agents/plugins/marketplace.json`), 9 AG-SK-002
  allowed-tools pre-approvals in `.cursor-plugin/skills/*/SKILL.md` (tody-agent/codymaster,
  incl. 1 high Bash pre-approval). 0 false positives; the other 7 repos report 0 new-surface
  findings (benign local/pinned layouts).
- GitHub code-search API returns 0 for these dot-dir paths (dot-directories are not indexed for
  path queries), so prevalence beyond the existing corpora is not measurable that way.

## Boundaries (as-is, honest)

- Personal marketplaces (`~/.agents/plugins/marketplace.json`) and installed plugin caches
  (`~/.codex/plugins/`) are user-machine state, not repository-carried; out of scope this round.
- Marketplace `source.path` entries are not followed as plugin roots explicitly; nested plugin
  dirs are still found by the generic plugin-root walk when they carry a manifest.
