# Spec: MCP client config portability (`agentgate config convert`)

Status: v0.1 (route C). Implementation: `packages/config-convert`.
Route A: this package is designed to be absorbed into the CLI as
`agentgate config convert`; the exported `convert(from, to, content)` function and the
canonical model below are the stable interface.

## CLI contract (final, once merged into the CLI)

```
agentgate config convert --from <client> --to <client> [--in <file>] [--out <file>]
```

- `<client>` ∈ `claude-desktop | claude-code | cursor | vscode | codex | opencode`.
- Default input is stdin, default output is stdout.
- Lossy-conversion warnings go to stderr, one `warning: <server>: <detail>` line each.
- Exit codes: `0` success (warnings allowed), `1` parse failure, `2` usage error.
- Interim standalone binary name: `agentgate-config-convert` (same flags).

## Canonical model

All formats are converted through a client-neutral model; adding a client means
writing one `ClientAdapter` (`parse` + `render`), not N² converters.

```ts
interface CanonicalMcpServer {
  name: string;
  transport: "stdio" | "http" | "sse";
  command?: string;            // stdio
  args?: string[];             // stdio
  env?: Record<string, string>;// stdio
  cwd?: string;                // stdio (vscode/codex/opencode only)
  url?: string;                // http/sse
  headers?: Record<string, string>; // http/sse
  enabled?: boolean;           // codex/opencode only
}
```

## Client format mapping

| Canonical field | claude-desktop | claude-code | cursor | vscode | codex | opencode |
|---|---|---|---|---|---|---|
| container key | `mcpServers` | `mcpServers` | `mcpServers` | `servers` | `mcp_servers` (TOML) | `mcp` |
| transport tag | — (stdio only) | `type` | inferred from `url` | `type` | inferred from `url` | `type: local/remote` |
| `command`+`args` | `command`,`args` | `command`,`args` | `command`,`args` | `command`,`args` | `command`,`args` | single `command` array |
| `env` | `env` | `env` | `env` | `env` | `env` | `environment` |
| `headers` | — | `headers` | `headers` | `headers` | `http_headers` | `headers` |
| `enabled` | — | — | — | — | `enabled` | `enabled` |
| `cwd` | — | — | — | `cwd` | `cwd` | `cwd` |

## Lossiness rules

Conversion must never silently drop information. Adapters emit warnings when:

- a remote (`http`/`sse`) server targets `claude-desktop` (stdio only → dropped);
- `enabled: false` targets a client with no disabled flag (emitted enabled + warning);
- `cwd` targets a client that doesn't support it (dropped + warning);
- VS Code `inputs` definitions are present (dropped + warning; `${input:*}` placeholder
  strings inside `env`/`headers` are preserved verbatim);
- `sse` targets a client that only does streamable HTTP (emitted as `url` + warning);
- any malformed entry is skipped (warning names the server).

Client-specific fields with no canonical equivalent (Codex `startup_timeout_sec`,
`env_vars`, approval modes; OpenCode per-agent config; etc.) are out of scope for v0.1
and dropped on parse — v0.2 may add a passthrough `extensions` bag if needed.

## Format sources (verified 2026-08-03)

- Codex: https://developers.openai.com/codex/mcp (`[mcp_servers.<name>]`, `http_headers`, `enabled`)
- OpenCode: https://opencode.ai/docs/mcp-servers/ (`mcp`, `type: local/remote`, `command` array, `environment`)
- VS Code: `.vscode/mcp.json` `servers`/`inputs` per VS Code MCP docs
- Cursor / Claude Code / Claude Desktop: respective official docs (`mcpServers` shape)
