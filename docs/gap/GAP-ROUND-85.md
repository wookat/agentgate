# GAP-ROUND-85 — discover + convert Amp (Sourcegraph) MCP configs

Date: 2026-08-07

## Gap (real evidence)

Round-72's thynkQ comparison listed Amp among clients we don't cover; at the
time its convention wasn't verified. Now verified from the official manual
(ampcode.com/manual, "MCP Server Loading Order" + `amp.mcpServers` setting
reference):

- User config: `amp.mcpServers` in `~/.config/amp/settings.json`.
- Workspace config: `amp.mcpServers` in `.amp/settings.json`.
- Entry shape is standard `command/args/env` or `url/headers`.

An Amp user's MCP servers were invisible to `scan`/`lock`, and `config
convert` couldn't target Amp.

## Fix

- Discovery: new `amp-settings-json` format; user + workspace locations
  (client discovery 13 → 14).
- Convert: `amp` adapter — parses the `amp.mcpServers` key, renders a
  standalone mergeable settings document with an explicit do-not-overwrite
  warning (mirroring the zed/continue convention).
- Docs/client lists updated (READMEs, homepage, scan + config-convert pages).

## Verification

- Fake-HOME real run: both user and workspace Amp settings discovered;
  `ludus-mcp@1.0.24` in the Amp config hits all 3 MCPA advisories.
- Real CLI: `config convert --from cursor --to amp` emits the mergeable
  document + warning; round-trip parse preserves names/URLs.
- Suite green: core 176, cli 38, config-convert 19; lint + typecheck clean.

## Still open (honest)

- Amp skills define MCP servers in `SKILL.md` frontmatter / sibling
  `mcp.json`; SKILL.md content is already scanned but frontmatter-declared
  servers are not extracted as MCP configs.
- Warp/ChatGPT Desktop/Plandex still unverifiable as file-based configs.
