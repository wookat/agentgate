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
| `--in <file>` | input file (default: stdin) |
| `--out <file>` | output file (default: stdout) |

Supported clients: `claude-desktop`, `claude-code`, `cursor`, `vscode`, `codex`, `opencode`.

Warnings about lossy conversions (fields the target format cannot express) are
printed to stderr; the conversion still succeeds. Parsing failures exit `2`
with a readable error.

Also available as the standalone
[`mcp-agentgate-config-convert`](https://www.npmjs.com/package/mcp-agentgate-config-convert)
package (`npx mcp-agentgate-config-convert …`, same flags).
