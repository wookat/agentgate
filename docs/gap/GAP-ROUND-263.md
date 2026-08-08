# GAP-ROUND-263 — config convert supports goose (Block)

Date: 2026-08-08.

## Gap

Discovery has modeled goose's MCP surface since round 213 (config.yaml
`extensions` map plus recipe extensions), but `config convert` could not read
or write the format — goose users could not migrate MCP servers to/from the
other 20 supported clients.

## Semantics (verified against the official docs)

Source: block/goose `documentation/docs/guides/config-files.md`.

- Config: `~/.config/goose/config.yaml` (macOS/Linux),
  `%APPDATA%\Block\goose\config\config.yaml` (Windows).
- `extensions` maps name → `{ type, name, enabled, cmd, args, envs,
  env_keys, uri, headers, timeout, available_tools, bundled, display_name }`.
- Extension types: `builtin`, `platform`, `stdio`, `streamable_http`,
  `frontend`, `inline_python`; `sse` kept only for compatibility.
- goose notation differs from the standard `mcpServers` shape: `cmd` (not
  `command`), `envs` (not `env`), `uri` (not `url`).

## Implementation

- New `goose` adapter (21st client): converts only the MCP extension types
  (`stdio`, `streamable_http` → canonical `http`, `sse`); other types warn
  as "not an MCP server; skipped" instead of silently disappearing.
- `enabled: false` maps to the canonical enabled flag in both directions.
- Lossy goose-only fields warn and drop on parse: `timeout`,
  `available_tools`, `env_keys` (secret-store references).
- Render emits `extensions` YAML with goose notation (`cmd`/`envs`/`uri`),
  `name` + `enabled` on every entry; canonical `sse` renders as `sse` with a
  compatibility warning suggesting streamable_http.

## Verification

- Fixture test built from the official docs example (builtin skipped with a
  warning, stdio cmd/envs, streamable_http uri/headers/disabled) plus render
  round-trip; the all-adapter stdio round-trip loop covers goose
  automatically. Suite: 27 passed.
- CLI end-to-end both directions (`--from goose --to claude-code` and back).

## Boundary

- goose recipe extensions (`recipe.yaml` `extensions` arrays) are not a
  convert source — recipes are shareable task bundles, not client configs
  (discovery scans them as an attack surface instead, rounds 214–222).
- `env_keys` secret-store references are goose-managed and never migrated;
  conversions warn so credentials are re-entered in the target client.
