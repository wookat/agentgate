# GAP-ROUND-91 — discover + convert Warp MCP configs

Date: 2026-08-07

## Gap (verified from official docs)

Warp was flagged unverifiable back in round-73; its official MCP docs
(docs.warp.dev "Model Context Protocol") now document **file-based MCP
servers**:

- Warp global: `~/.warp/.mcp.json`; project: `.warp/.mcp.json`
- Generic "other agents" convention it also reads: `~/.agents/.mcp.json`;
  project `.agents/.mcp.json`
- Standard `mcpServers` map; stdio entries take `command`/`args`/`env`
  plus `working_directory`; remote entries take `url`/`headers`.

AgentGate discovered none of these.

## Fix

- Discovery 14 → 15 clients: `warp` + generic `agents` locations at both
  user and project level (standard `mcpServers-json` parser).
- `config convert` gains `warp`: standard `mcpServers`, with
  `working_directory` ↔ canonical `cwd` in both directions (clients
  without cwd support keep warning-and-drop).

## Evidence (real runs)

- Fake-HOME scan discovered all three configs
  (`~/.warp/.mcp.json`, `~/.agents/.mcp.json`, project `.warp/.mcp.json`);
  `ludus-mcp@1.0.24` in the Warp config hit AG-SC-003 (3 MCPA advisories)
  plus AG-SC-001.
- `config convert --from cursor --to warp` and `--from warp --to cursor`
  round-trip; cursor correctly warns it drops `working_directory`.
- Full suite green: core 179 / cli 40 / config-convert 21.

## Still open (honest)

- Warp's GUI-managed servers (its internal settings store) are not files
  and remain out of scope; only the documented file-based configs are
  covered.
- ChatGPT Desktop and Plandex conventions still unverified.
- `includeTools` on skill-declared servers still uninterpreted.
