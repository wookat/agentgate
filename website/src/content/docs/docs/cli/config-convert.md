---
title: agentgate config convert
description: Convert MCP server configuration between client formats.
---

Move your MCP server config between clients without retyping JSON/TOML by hand:

```bash
npx mcp-agentgate config convert --from cursor --to vscode --in .cursor/mcp.json --out .vscode/mcp.json
```

| Flag | Meaning |
| --- | --- |
| `--from <client>` | source client format (required) |
| `--to <client>` | target client format (required) |
| `--in <file>` | input file (default: the source client's config at its default location — project-level first, then user-level — or stdin when piped) |
| `--out <file>` | output file (default: stdout) |

Supported clients: `claude-desktop`, `claude-code`, `cursor`, `vscode`, `codex`, `opencode`, `windsurf`, `cline`, `gemini-cli`, `kiro`, `roo-code`, `zed`, `continue`, `amp`, `warp`, `lmstudio`, `trae`, `amazonq`, `antigravity`, `crush`, `goose`.

Warnings about lossy conversions (fields the target format cannot express) are
printed to stderr; the conversion still succeeds. Parsing failures exit `2`
with a readable error.

Also available as the standalone
[`mcp-agentgate-config-convert`](https://www.npmjs.com/package/mcp-agentgate-config-convert)
package (`npx mcp-agentgate-config-convert …`, same flags).
