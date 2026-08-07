# GAP-ROUND-117 — discover + convert Trae project MCP configs

Date: 2026-08-07 · Round type: coverage expansion (client discovery)

## Gap found (real research)

Trae (ByteDance's AI IDE) officially documents project-scoped MCP config at
`.trae/mcp.json` under the workspace root, standard `mcpServers` notation
(docs.trae.ai/ide/add-mcp-servers: "You can create an mcp.json file in the
.trae/ directory under the project root"). Because it lives in the repo it
can be committed and shared — exactly the kind of file a CI drift gate
should be watching. AgentGate didn't discover it.

## What shipped

- Discovery: `trae` project-level location `.trae/mcp.json`
  (`mcpServers-json`). 16→17 named clients.
- Convert: `trae` as source/target in `config convert` (standard-notation
  adapter).
- Docs: client lists in README, cli README, quick-start, scan/config-convert
  references, FAQ, troubleshooting, homepage.

## Deliberately NOT added (honest)

- Trae user-level/global config: managed via the Settings GUI; the paths
  circulating in third-party guides (`%APPDATA%\Trae\User\mcp.json` etc.)
  have no official documentation — same policy as Warp/JetBrains GUI
  storage (rounds 91/96).
- Cherry Studio: MCP servers are managed inside the app's own data store
  (Settings → MCP Servers); no officially documented on-disk config file,
  so no discovery entry.

## Release close-out (this round)

- v0.24.1 tag + Release; quick regression: npx 0.24.1 discovers
  `~/.cache/lm-studio/mcp.json` (ludus-mcp hits 3 advisories).
- Note: round-116 code had already shipped inside the 0.24.0 npm
  artifacts (#196 merged after #197); 0.24.1 aligns the version
  accounting/changelog.
