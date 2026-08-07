# GAP-ROUND-79 — config convert speaks Continue.dev

Date: 2026-08-07

## Gap (real evidence)

Round-78 added Continue.dev to discovery but `config convert` could not read
or write its YAML format — the same discovery/convert asymmetry rounds 73→74
closed for Kiro/Roo/Zed. `--to continue` was rejected as an unknown client.

## Fix

New `continue` adapter in mcp-agentgate-config-convert:

- **parse**: YAML document with an `mcpServers` list (`name` required per
  entry; `command`/`args`/`env`/`url`/`type` as in the official config.yaml
  reference). Nameless entries dropped with a warning.
- **render**: standalone YAML block document (`name`/`version`/`schema` +
  `mcpServers` list) with an explicit warning to save it under
  `.continue/mcpServers/<name>.yaml` or merge the list into config.yaml —
  never silently overwrite a user's full config.yaml (models etc. live there).
- Remote servers emit `type: sse` / `type: streamable-http`; `cwd` is kept
  (Continue supports it).

## Verification

- Real CLI run: `cursor → continue` emits a valid YAML block (shown in GAP);
  round-trip back to canonical preserves names/urls.
- Suite: config-convert 17 passed; lint + typecheck green.

## Still open (honest)

- Zed and Continue renders are standalone "merge this" documents; a true
  in-place merge mode (`--merge`) remains future work.
