# GAP-ROUND-74 — config convert parity with the round-73 discovery surface

Date: 2026-08-07

## Gap

Round-73 taught `scan`/`lock` to discover Kiro, Roo Code, and Zed configs, but
`config convert` (both the subcommand and the standalone
mcp-agentgate-config-convert package) could not read or emit those formats —
the same asymmetry rounds 52→53 closed for Windsurf/Cline/Gemini CLI.

## What was added

- `kiro` and `roo-code` adapters — standard `mcpServers` documents at the
  official default paths (kiro.dev docs; Roo Code VS Code globalStorage +
  project `.roo/mcp.json`).
- `zed` adapter — parses `context_servers` from `settings.json` with a
  string-safe JSONC comment/trailing-comma stripper (Zed settings allow
  comments); renders a standalone `{ "context_servers": ... }` document with
  an explicit warning to merge it into the existing settings file rather than
  replace it (settings.json holds unrelated editor settings we must not
  clobber).
- `--from kiro/roo-code/zed` default-path auto-discovery works via the
  round-73 core discovery locations.

## Real verification

- `convert --from zed --to cursor` on a real JSONC settings file (comments +
  trailing commas) → correct `mcpServers` output.
- `convert --from kiro --to zed` → wrapped `context_servers` output with the
  merge warning.
- Round-trip test for all 12 client formats green; suite: config-convert 15 /
  core 168 / cli 38; lint/typecheck/build pass; website builds.

## Remaining gaps

- Zed render is a mergeable fragment, not an in-place settings.json merge —
  an `--out` pointing at an existing settings.json will replace it; the
  warning covers this, but a true merge mode is a candidate improvement.
- GitHub Actions outage continues; 0.15.0 version PR still pending
  (now accumulating round-65/66/69/71/73/74 changesets).
