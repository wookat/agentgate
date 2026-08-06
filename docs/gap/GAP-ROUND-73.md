# GAP-ROUND-73 — discovery gap vs thynkQ mcp-scan: Kiro, Roo Code, Zed

Date: 2026-08-06

## How the gap was found (real evidence)

Round-72's head-to-head prompted a discovery-surface audit: thynkQ mcp-scan
2.0.2 auto-discovers 15 clients (extracted from its published bundle), we
covered 9. Users of the missing clients would run `agentgate scan` on a
configured machine and see nothing.

## What was added (official conventions verified)

- **Kiro** — user `~/.kiro/settings/mcp.json` + workspace
  `.kiro/settings/mcp.json`, standard `mcpServers` format
  (verified against kiro.dev/docs/mcp/configuration).
- **Roo Code** — VS Code globalStorage
  `rooveterinaryinc.roo-cline/settings/mcp_settings.json` (3 platforms) +
  project `.roo/mcp.json`, `mcpServers` format
  (verified against docs.roocode.com; extension id
  RooVeterinaryInc.roo-cline).
- **Zed** — `context_servers` key in `~/.config/zed/settings.json`
  (`%APPDATA%\Zed\settings.json` on Windows); entries share the
  command/args/env/url/headers shape (verified against zed.dev/docs/ai/mcp).
  Zed settings are JSONC, so a comment/trailing-comma stripper was added
  (string-safe; `//` inside URLs untouched).

Deliberately not added (thynkQ covers them, we hold off): Plandex, ChatGPT
Desktop, GitHub Copilot `apps.json`, Warp, Amp, Continue.dev — either the
config is not MCP-server-shaped, the convention could not be verified from
official docs today, or the client stores no launchable server config.

## Real verification

Fake HOME with all three configs: `scan` discovered 3 files / 3 servers;
Zed JSONC (comments + trailing commas) parsed; `ludus-mcp@1.0.24` in the
Kiro config matched AG-SC-003 advisories. Full suite green
(core 168 / cli 38 / config-convert 12), lint/typecheck/build pass,
website builds.

## Docs updated

README (en/zh), npm CLI README, homepage Install card, scan docs page —
all client lists now say 12 clients.

## Remaining gaps

- `config convert` does not yet emit/read Kiro/Roo/Zed as explicit formats
  (Kiro/Roo are standard mcpServers so `--from cursor`-style conversion
  already round-trips; Zed's `context_servers` wrapper is not yet a convert
  target) — candidate for a later round.
- GitHub Actions still degraded; 0.15.0 version PR pending.
