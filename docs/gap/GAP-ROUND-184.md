# GAP-ROUND-184 — Plugin manifest `mcpServers` resolved

Date: 2026-08-08 · Round type: coverage completion (round-183 boundary)

## Surface

Round-183 discovered only the conventional `.mcp.json` plugin-root location.
The official plugins reference also allows `mcpServers` in
`.claude-plugin/plugin.json` as inline config (object) or config paths
(string | array) relative to the plugin root, e.g.
`"mcpServers": "./mcp-config.json"`. In the wild both forms are common:
GitHub code search shows ~1,876 `plugin.json` files under `.claude-plugin`
mentioning `mcpServers`; buildwithclaude alone has 4 (2 inline, 2 by path).

## Change

Discovery resolves the manifest field: an inline object surfaces the
manifest itself as an `mcpServers-json` config location; string/array
references are resolved relative to the plugin root (a literal
`${CLAUDE_PLUGIN_ROOT}/` prefix is stripped) and ignored when they escape
the plugin root. Duplicate locations (manifest ref pointing at the sibling
`.mcp.json`) are deduped by path.

## Real corpus (unmodified)

davepoon/buildwithclaude: discovered servers 5 → 9. New true positives:
- `thumbgate` (inline manifest): unpinned npx package + `-y` auto-confirm
  (AG-SC-001 medium + low).
- `fabler-x402-tools` (path-referenced): unpinned GitHub tarball spec +
  `-y` (AG-SC-001 medium + low).
Other corpus repos unchanged; anthropics/claude-plugins-official still 4
clean servers (no manifest-declared servers).

## Boundaries

- `${CLAUDE_PLUGIN_ROOT}` inside command/args is left verbatim (unparseable
  URL reports low, as with `tlsradar`).
- `.lsp.json` LSP servers still unmodeled.
- Marketplace `metadata.pluginRoot` indirection still unmodeled.

## Evidence

- Full suite green: core 262, cli 47, config-convert 24.
- Self-scan 155 files: 18 findings (14 medium, 4 low), unchanged.
