# GAP-ROUND-183 — Plugin-bundled MCP servers discovered

Date: 2026-08-08 · Round type: coverage completion (round-181/182 follow-on)

## Surface

Official plugins reference: a plugin bundles MCP servers via `.mcp.json` in
the plugin root (or inline in `plugin.json`); "Plugin MCP servers start
automatically when the plugin is enabled". Project-level discovery only knew
the repo root's `.mcp.json` (claude-code location), so servers bundled by
nested plugin roots — the normal layout of marketplace repos hosting many
plugins — were invisible to config-level rules and advisory checks.

## Change

`projectConfigLocations` gains `pluginServerLocations`: a bounded directory
walk (depth ≤ 4, skipping node_modules/.git/build dirs and other dot-dirs)
finds every nested directory carrying `.claude-plugin/plugin.json` and adds
its sibling `.mcp.json` as a `claude-plugin` config location. Those servers
then get the full checkServer rule set (AG-SC-001 pinning, AG-AM-001 auth,
…) plus OSV/MCPA advisory checks, same as any discovered config.

## Real corpus (5 repos, unmodified)

- anthropics/claude-plugins-official: 4 bundled servers discovered
  (discord, fakechat, imessage, telegram) — all clean.
- davepoon/buildwithclaude: 5 bundled servers discovered; real findings —
  `kegg` runs unpinned npm package `kegg-mcp-server` (AG-SC-001 medium),
  three remote servers configured without any authentication header
  (AG-AM-001 medium ×3), one unparseable URL (low).
- storybookjs/react-native: 1 bundled server, clean.
- InsForge, addyosmani/agent-skills: no bundled `.mcp.json` (plugins are
  skills-only), correctly 0.

## Boundaries

- Inline `mcpServers` in `plugin.json` and custom config paths
  (`"mcpServers": "./mcp-config.json"`) are not resolved; only the
  conventional `.mcp.json` plugin-root location is discovered.
- `.lsp.json` LSP servers and marketplace `metadata.pluginRoot` indirection
  are unmodeled.
- Depth cap of 4 directory levels for plugin-root search.

## Evidence

- Full suite green: core 261, cli 47, config-convert 24.
- Self-scan 155 files: 18 findings (14 medium, 4 low), unchanged from
  round-182 baseline.
