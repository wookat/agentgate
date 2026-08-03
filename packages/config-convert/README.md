# @agentgate/config-convert

Convert MCP server configuration between client formats — the "config portability" gap
called out in the official MCP 2026 roadmap.

Supported clients:

| Client | Format | Default location |
|---|---|---|
| `claude-desktop` | JSON `mcpServers` (stdio only) | `~/Library/Application Support/Claude/claude_desktop_config.json` |
| `claude-code` | JSON `mcpServers` (+`type`) | `.mcp.json` |
| `cursor` | JSON `mcpServers` | `~/.cursor/mcp.json` / `.cursor/mcp.json` |
| `vscode` | JSON `servers` (+`type`, `inputs`) | `.vscode/mcp.json` |
| `codex` | TOML `[mcp_servers.<name>]` | `~/.codex/config.toml` |
| `opencode` | JSON `mcp` (`local`/`remote`) | `opencode.json` |

## CLI

```bash
agentgate-config-convert --from cursor --to vscode --in .cursor/mcp.json --out .vscode/mcp.json
# or via stdin/stdout
cat .cursor/mcp.json | agentgate-config-convert --from cursor --to codex
```

Lossy conversions (e.g. remote servers into Claude Desktop, VS Code `inputs`,
clients without a disabled flag) never fail silently — every dropped or degraded
field is reported as a `warning:` line on stderr.

## API

```ts
import { convert } from "@agentgate/config-convert";

const { content, warnings } = convert("cursor", "codex", jsonText);
```

This package will be merged into the `agentgate` CLI as `agentgate config convert`
once route A's CLI lands; the canonical model and conversion semantics are specified
in [docs/spec/config-convert.md](../../docs/spec/config-convert.md).

## Develop

```bash
npm install
npm test
npm run build
```
