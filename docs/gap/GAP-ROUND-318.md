# GAP-ROUND-318 — goose Open Plugin manifests (.goose-plugin/) + component paths form

## Context

Advisory watch re-run clean (GHSA + malware windows, zero uncovered). Continued the goose
upstream source review (r314/315/317): goose's plugin system (`crates/goose/src/plugins/`)
installs plugins in two formats — Gemini extensions (`gemini-extension.json`, already
covered since round 193) and Open Plugins, whose manifest lookup order is
`.goose-plugin/plugin.json`, `.plugin/plugin.json`, `plugin.json`.

## Gaps

1. **`.goose-plugin/` was invisible**: not in the walker's agent dot-dir whitelist, not a
   plugin metadata dir for discovery, not matched by the plugin-manifest matcher. A repo
   shipping its plugin under `.goose-plugin/` had its manifest (inline hooks, mcpServers)
   and directory contents completely unscanned.
2. **Open Plugin Spec component `paths` form unparsed**: goose manifests declare
   `mcpServers: { paths: ["./x/.goose-mcp.json"], exclusive: bool }`
   (`open_plugins.rs::mcp_config_paths_for_validation`). Our manifest reader treated any
   object as an inline server map, so the `paths`/`exclusive` keys would be misread as
   server entries and the referenced config documents were never resolved. Now: path refs
   are resolved (root-contained, existing), and unless `exclusive` the plugin root's
   `.mcp.json` is read too — matching upstream.

## Evidence

- Upstream: `crates/goose/src/plugins/formats/open_plugins.rs` (`MANIFESTS`,
  `mcp_config_paths_for_validation`).
- Wild: GitHub code search found 1 in-repo `.goose-plugin/plugin.json`
  (ampres-ai/talamus). End-to-end scan now walks `.goose-plugin/`, resolves the
  component-path `.goose-mcp.json`, and advisory/pin checks apply to the referenced
  server (talamus is pinned `==1.1.1` — correctly silent; its `gemini-extension.json`
  duplicate surface already produced the known `mcp>=1.0` unpinned + advisory findings).
- Regression: manifest with `paths` + non-exclusive root `.mcp.json` discovers both
  referenced and root servers; full suite 487 green; self-scan unchanged (227/21).

## Boundaries

- `skills: { paths: [...] }` component form is install-time skill copying; in-repo skill
  trees are already scanned wherever they live, so no extra resolution is needed.
- Adoption is currently thin (1 wild repo) — coverage is driven by upstream semantics,
  not prevalence.
