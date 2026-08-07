# GAP-ROUND-78 — Continue.dev MCP config discovery

Date: 2026-08-07

## Gap (real evidence)

Round-72's thynkQ comparison listed clients we don't discover. Continue.dev
was the biggest remaining one with a verifiable official convention: the docs
(docs.continue.dev — MCP deep dive + config.yaml reference) define
`mcpServers` as a YAML list (`name` required, `command`, `args`, `env`,
`url`, `type`) in the global `~/.continue/config.yaml` and in per-workspace
block files `.continue/mcpServers/*.yaml`. A machine using only Continue
scanned as "no MCP servers configured".

## Fix

- New `continue-yaml` format in core discovery: global `~/.continue/config.yaml`
  plus enumeration of every workspace `.continue/mcpServers/*.yaml|*.yml`.
- Parser uses the `yaml` package (eemeli/yaml 2.9.0, mature, published
  2026-05) — first real YAML dep; skill frontmatter parsing is unchanged.
- Entries without a `name` are skipped; `type` maps to transport, `url`
  supported for sse/streamable-http servers.

## Verification

- Fake-HOME run: global config.yaml (ludus-mcp@1.0.24) and workspace
  playwright block both discovered; AG-SC-001 on both + AG-SC-003 advisory
  hit on ludus-mcp. Client count 12 → 13.
- Suite: core 172 / cli 38 / config-convert 15; lint + typecheck green.

## Still open (honest)

- `config convert` does not yet speak `continue` (YAML render) — same
  asymmetry rounds 73→74 closed for Kiro/Roo/Zed; candidate for a next round.
- Other thynkQ-covered clients (Plandex, ChatGPT Desktop, Warp, Amp) still
  skipped: conventions not verifiable against official docs today.
