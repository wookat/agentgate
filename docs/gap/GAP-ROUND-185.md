# GAP-ROUND-185 — Plugin LSP server commands classified

Date: 2026-08-08 · Round type: coverage completion (round-183/184 boundary)

## Surface

Official plugins reference: plugins can provide LSP servers via `.lsp.json`
in the plugin root or inline `lspServers` in `plugin.json` (object, or
config paths). The declared `command` (+ `args`) is executed by Claude Code
automatically after workspace trust whenever files matching
`extensionToLanguage` are edited — an auto-exec surface equivalent to
hooks, with the extra property that it re-runs continuously during normal
editing.

## Change

AG-SK-003 now classifies plugin LSP server command lines (`command` joined
with string `args`) through the shared dangerous-command classifier
(remote-script pipes critical, credential reads / exfiltration high).
Both `.lsp.json` files and inline `lspServers` objects in
`.claude-plugin/plugin.json` are checked. Real language servers
(`gopls serve`, `typescript-language-server --stdio`) carry no risky
patterns and stay clean.

## Real corpus (10 repos, unmodified)

0 findings across the round-181 corpus (incl.
anthropics/claude-plugins-official, which ships the official
pyright/typescript/rust-analyzer LSP plugins) and the round-176 flagship
set. True positives are covered by unit fixtures.

## Boundaries

- `lspServers` as a string/array of config paths is resolved for MCP-style
  discovery contexts but the referenced `.lsp.json` is still matched by
  filename anywhere in the tree, so path-referenced configs are covered as
  long as they use the conventional `.lsp.json` name; exotic names
  (e.g. `lsp-config.json`) are not resolved.
- `env` injection into LSP processes is not modeled.
- Plugin monitors remain unmodeled.

## Evidence

- Full suite green: core 264, cli 47, config-convert 24.
- Self-scan 155 files: 18 findings (14 medium, 4 low), unchanged.
