# GAP-ROUND-332 — Codex hooks-file-wrapped inline hooks + entry-level path-form mcpServers

## Official semantics verified (openai/codex upstream)

`codex-rs/core-plugins/src/manifest.rs`:

```rust
enum RawPluginManifestHooks {
    Path(String),
    Paths(Vec<String>),
    Inline(Box<HooksFile>),
    InlineList(Vec<HooksFile>),
    Invalid(JsonValue),
}

enum RawPluginManifestMcpServers {
    Path(String),
    Object(BTreeMap<String, JsonValue>),
    Invalid(JsonValue),
}
```

`codex-rs/config/src/hook_config.rs`:

```rust
pub struct HooksFile {
    pub description: Option<String>,
    pub hooks: HookEventsToml, // { Event: [{ matcher?, hooks: [{ type: "command", command, commandWindows }] }] }
}
```

So a Codex plugin manifest — and, via the round-331 fallback-manifest semantics,
a marketplace entry — can carry `hooks` as:

- a path (or list of paths) to hooks files under the plugin root,
- **one inline `HooksFile` object** (`{ description?, hooks: { Event: [...] } }`), or
- **a list of inline `HooksFile` objects**.

## Gaps found and fixed

1. **Marketplace-entry hooks: Codex inline forms invisible.** The
   marketplace-catalog branch of AG-SK-003 only ran the Claude nested and
   Copilot flat extractors directly on `entry.hooks`. Both Codex inline forms
   wrap the nested event map under the hooks-file's own `hooks` key, so a
   dangerous command in either form produced zero findings. The plugin-manifest
   branch already unwrapped the list form (round-293) but not the single-object
   form.
   - Fix: both branches now also unwrap `entry.hooks.hooks` /
     `manifest.hooks.hooks` (single inline hooks-file) and keep the existing
     list unwrapping.

2. **Entry-level path-form `mcpServers` never followed.** A local-source
   marketplace entry acting as a fallback manifest can point `mcpServers` at a
   config document inside its source root; discovery only read inline entry
   objects (round-293), so pin/advisory checks never saw the referenced
   servers.
   - Fix: `marketplaceEntryServerLocations` in discovery resolves string/array
     `mcpServers` refs against the entry's local source root (string or Codex
     object-form `{"source":"local","path":"./…"}`), with the usual
     containment checks (no absolute paths, no `..`, resolved path must stay
     under the source root; remote sources ignored).

Path-form entry `hooks` need no special handling: the referenced JSON file is
already covered by the shape-detection fallback for arbitrary `*.json` files
(round-188).

## Wild-corpus evidence (honest)

- 851 marketplace catalog files across the corpora, 619 plugin entries total:
  **zero** entries carry entry-level `hooks` or `mcpServers` in any form.
- 941 `plugin.json` manifests: 3 use the list-inline hooks form (already
  covered), 33 use the path form (already covered via shape detection), and
  **1** uses the single-inline hooks-file form
  (`Chachamaru127/claude-code-harness` `.codex-plugin/plugin.json`) — its
  event map is empty, so it stays silent under the new unwrapping.
- Head-to-head vs published 0.67.9 across all 77 corpus repos with Codex
  plugin layouts (`.agents/plugins/` catalogs or `.codex-plugin/` manifests):
  **zero finding/scannedFiles delta**. The fix covers officially supported
  shapes not yet weaponized in the wild; TP/FP behavior is pinned by
  regression tests (poisoned single/list marketplace-entry hooks and
  single-inline manifest hooks → critical; path-form entry mcpServers followed
  with escape/remote entries ignored).

## Remaining unmodeled boundary

- Codex fallback-manifest `apps` (single path) and entry-level `skills`
  replacement semantics on shared source roots remain additive-scan only
  (recorded since GAP-ROUND-324/331).
