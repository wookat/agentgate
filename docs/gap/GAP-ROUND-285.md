# GAP-ROUND-285 — config convert supports the Kilo CLI (`kilo`)

Round type: convert/discovery gap closure (follow-up to round 284).

## Gap

Round 284 added discovery of `kilo.json` / `kilo.jsonc` (Kilo CLI project config,
OpenCode schema, JSONC allowed). The convert side had no exact adapter:

- the `kilocode` adapter only reads/writes the `mcpServers`-style
  `mcp.json` / `mcp_settings.json` files (VS Code extension surface);
- the `opencode` adapter parses the right schema but rejected JSONC
  (comments/trailing commas), which Kilo explicitly allows, and would
  auto-discover `opencode.json` rather than `kilo.json(c)`.

This regressed the convert/discovery gap-zero property established in rounds
262–265.

## Fix

- New `kilo` convert client (default path `kilo.json`), sharing an
  OpenCode-schema adapter factory with `opencode`. Both are now JSONC-tolerant
  (upstream OpenCode also ships `opencode.jsonc`).
- `defaultConfigPath` splits the two Kilo surfaces by discovery format:
  `kilo` → `opencode-json` locations (`kilo.json(c)`), `kilocode` → the
  `mcpServers`-style locations. Cross-contamination pinned by test.
- Docs: convert README table + website supported-clients list.

## Verification

- Round-trip test: JSONC `kilo.jsonc` → cursor → `kilo` preserves command
  arrays, environment, and remote entries.
- Wild corpus: 30 real `kilo.json(c)` files with an `mcp` block from the
  round-284 corpus — 29/30 convert cleanly (`--from kilo --to cursor`);
  the 1 failure (ZirconiaAegisC/CarrPod) is genuinely invalid JSON (missing
  comma between top-level members — Kilo itself cannot parse it) and fails
  with the expected readable exit-2 error.
- Client-list CI gate green (discovery ids unchanged; `kilo` is a convert-side
  id for a surface discovery already files under `kilocode`).
