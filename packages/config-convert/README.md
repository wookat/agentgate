# mcp-agentgate-config-convert

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
| `windsurf` | JSON `mcpServers` (remote via `serverUrl`) | `~/.codeium/windsurf/mcp_config.json` |
| `cline` | JSON `mcpServers` (+`disabled`) | `<vscode user dir>/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json` |
| `gemini-cli` | JSON `mcpServers` (`url` sse / `httpUrl` http) | `~/.gemini/settings.json` |
| `kiro` | JSON `mcpServers` | `~/.kiro/settings/mcp.json` / `.kiro/settings/mcp.json` |
| `roo-code` | JSON `mcpServers` | `<vscode user dir>/globalStorage/rooveterinaryinc.roo-cline/settings/mcp_settings.json` / `.roo/mcp.json` |
| `zed` | JSONC `context_servers` inside settings | `~/.config/zed/settings.json` |
| `continue` | YAML `mcpServers` list | `~/.continue/config.yaml` / `.continue/mcpServers/*.yaml` |

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
import { convert } from "mcp-agentgate-config-convert";

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
