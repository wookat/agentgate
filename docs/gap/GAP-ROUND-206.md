# GAP-ROUND-206 — Open Plugin Spec LSP servers (`lsp-config/servers.json` + bash/powershell launch keys)

## Scope

Round 205 boundary follow-up. The official Copilot CLI plugin reference
(github/docs `cli-plugin-reference.md`, "LSP server configuration") documents:

- LSP servers ship in a plugin via `lsp-config/servers.json` in the plugin directory
  (wrapping the server map in a top-level `lspServers` key), or via the `lspServers`
  manifest field (path or inline).
- Each server launches via `command` + `args`, **or** cross-platform `bash` /
  `powershell` launch scripts (`bash -c SCRIPT` / `pwsh -c SCRIPT`); the
  platform-appropriate one is selected automatically.
- They run automatically whenever matching files are edited, after workspace trust.

Round 185 covered `.lsp.json` and inline manifest `lspServers`, but only the
`command`+`args` shape — a dangerous command in a `bash`/`powershell` key or in the
new named file was invisible.

## What shipped

1. `PLUGIN_LSP_FILE` widened to `lsp-config/servers.json`; the top-level `lspServers`
   wrapper is unwrapped (`.lsp.json` stays a bare map).
2. `extractLspCommands` also collects `bash` and `powershell` launch scripts (same
   both-variants logic as rounds 177/203: a dangerous command can hide in either
   platform's key).

## Corpus evidence

- GitHub code search: 0 files yet at `lsp-config/servers.json` (the Open Plugin Spec
  is new); true positives covered by fixtures (irm|iex hidden in the `powershell` key
  while `bash` points at a local script).
- Benign real language servers (`typescript-language-server --stdio`, `gopls serve`)
  and local `${PLUGIN_ROOT}` launch scripts stay clean.

## Boundaries (not modeled)

- Referenced launch script files are not traversed (same boundary as every hook face).
- `fileExtensions`/`rootUri`/`initializationOptions` semantics not modeled.
- agent-plugins.org spec extensions beyond what the GitHub docs describe are not
  independently modeled.

## Validation

- `pnpm build && pnpm lint && pnpm typecheck && pnpm test`: green
  (core 292 / cli 47 / config-convert 24).
- Self-scan: 18 findings (unchanged).
