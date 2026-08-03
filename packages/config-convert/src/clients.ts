import { parse as parseToml, stringify as stringifyToml } from "smol-toml";
import {
  asStringRecord,
  CanonicalMcpServer,
  ClientAdapter,
  ClientId,
  ConfigParseError,
  isRecord,
  ParseResult,
  RenderResult,
  Transport,
} from "./model.js";

function parseJson(client: ClientId, content: string): Record<string, unknown> {
  let data: unknown;
  try {
    data = JSON.parse(content);
  } catch (e) {
    throw new ConfigParseError(client, `invalid JSON: ${(e as Error).message}`);
  }
  if (!isRecord(data)) throw new ConfigParseError(client, "top level must be an object");
  return data;
}

function stringArgs(v: unknown, ctx: string, warnings: string[]): string[] | undefined {
  if (v === undefined) return undefined;
  if (!Array.isArray(v)) {
    warnings.push(`${ctx}: expected an array; dropped`);
    return undefined;
  }
  return v.map(String);
}

/**
 * Parse the common `mcpServers`-style entry shape used (with minor variations)
 * by Claude Desktop, Claude Code, and Cursor.
 */
function parseCommonEntry(
  client: ClientId,
  name: string,
  entry: unknown,
  warnings: string[],
): CanonicalMcpServer | undefined {
  if (!isRecord(entry)) {
    warnings.push(`${name}: entry is not an object; dropped`);
    return undefined;
  }
  const url = typeof entry.url === "string" ? entry.url : undefined;
  const command = typeof entry.command === "string" ? entry.command : undefined;
  let transport: Transport;
  if (typeof entry.type === "string" && ["stdio", "http", "sse"].includes(entry.type)) {
    transport = entry.type as Transport;
  } else if (url) {
    transport = "http";
  } else {
    transport = "stdio";
  }
  if (transport === "stdio" && !command) {
    warnings.push(`${name}: stdio server without a command; dropped`);
    return undefined;
  }
  if (transport !== "stdio" && !url) {
    warnings.push(`${name}: remote server without a url; dropped`);
    return undefined;
  }
  return {
    name,
    transport,
    command,
    args: stringArgs(entry.args, `${name}.args`, warnings),
    env: asStringRecord(entry.env, `${name}.env`, warnings),
    cwd: typeof entry.cwd === "string" ? entry.cwd : undefined,
    url,
    headers: asStringRecord(entry.headers, `${name}.headers`, warnings),
  };
}

function renderCommonEntry(s: CanonicalMcpServer, withType: boolean): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  if (withType) out.type = s.transport;
  if (s.transport === "stdio") {
    out.command = s.command;
    if (s.args?.length) out.args = s.args;
    if (s.env && Object.keys(s.env).length) out.env = s.env;
  } else {
    out.url = s.url;
    if (s.headers && Object.keys(s.headers).length) out.headers = s.headers;
  }
  return out;
}

function mcpServersAdapter(
  id: ClientId,
  defaultPath: string,
  opts: { withType: boolean; stdioOnly?: boolean },
): ClientAdapter {
  return {
    id,
    defaultPath,
    parse(content): ParseResult {
      const data = parseJson(id, content);
      const warnings: string[] = [];
      const serversObj = data.mcpServers;
      const servers: CanonicalMcpServer[] = [];
      if (serversObj !== undefined && !isRecord(serversObj)) {
        throw new ConfigParseError(id, "mcpServers must be an object");
      }
      for (const [name, entry] of Object.entries(serversObj ?? {})) {
        const s = parseCommonEntry(id, name, entry, warnings);
        if (s) servers.push(s);
      }
      return { config: { servers }, warnings };
    },
    render(config): RenderResult {
      const warnings: string[] = [];
      const mcpServers: Record<string, unknown> = {};
      for (const s of config.servers) {
        if (opts.stdioOnly && s.transport !== "stdio") {
          warnings.push(
            `${s.name}: ${id} config only supports stdio servers; ` +
              `remote (${s.transport}) server dropped — connect it via the app UI instead`,
          );
          continue;
        }
        if (s.enabled === false) {
          warnings.push(`${s.name}: ${id} has no disabled flag; server emitted as enabled`);
        }
        if (s.cwd) warnings.push(`${s.name}: ${id} does not support cwd; dropped`);
        mcpServers[s.name] = renderCommonEntry(s, opts.withType);
      }
      return { content: JSON.stringify({ mcpServers }, null, 2) + "\n", warnings };
    },
  };
}

/** Claude Desktop — `claude_desktop_config.json`, stdio only. */
export const claudeDesktop = mcpServersAdapter(
  "claude-desktop",
  "~/Library/Application Support/Claude/claude_desktop_config.json",
  { withType: false, stdioOnly: true },
);

/** Claude Code — project `.mcp.json` (or `claude mcp add`). */
export const claudeCode = mcpServersAdapter("claude-code", ".mcp.json", { withType: true });

/** Cursor — `~/.cursor/mcp.json` or project `.cursor/mcp.json`. */
export const cursor = mcpServersAdapter("cursor", ".cursor/mcp.json", { withType: false });

/** VS Code — `.vscode/mcp.json` with a `servers` map and optional `inputs`. */
export const vscode: ClientAdapter = {
  id: "vscode",
  defaultPath: ".vscode/mcp.json",
  parse(content): ParseResult {
    const data = parseJson("vscode", content);
    const warnings: string[] = [];
    const serversObj = data.servers;
    if (serversObj !== undefined && !isRecord(serversObj)) {
      throw new ConfigParseError("vscode", "servers must be an object");
    }
    if (Array.isArray(data.inputs) && data.inputs.length) {
      warnings.push(
        "inputs: VS Code input-variable definitions cannot be represented in other clients; dropped " +
          "(referenced ${input:*} placeholders are kept verbatim)",
      );
    }
    const servers: CanonicalMcpServer[] = [];
    for (const [name, entry] of Object.entries(serversObj ?? {})) {
      const s = parseCommonEntry("vscode", name, entry, warnings);
      if (s) servers.push(s);
    }
    return { config: { servers }, warnings };
  },
  render(config): RenderResult {
    const warnings: string[] = [];
    const servers: Record<string, unknown> = {};
    for (const s of config.servers) {
      if (s.enabled === false) {
        warnings.push(`${s.name}: vscode has no disabled flag; server emitted as enabled`);
      }
      const entry = renderCommonEntry(s, true);
      if (s.transport === "stdio" && s.cwd) entry.cwd = s.cwd;
      servers[s.name] = entry;
    }
    return { content: JSON.stringify({ servers }, null, 2) + "\n", warnings };
  },
};

/** Codex — `~/.codex/config.toml` with `[mcp_servers.<name>]` tables. */
export const codex: ClientAdapter = {
  id: "codex",
  defaultPath: "~/.codex/config.toml",
  parse(content): ParseResult {
    let data: unknown;
    try {
      data = parseToml(content);
    } catch (e) {
      throw new ConfigParseError("codex", `invalid TOML: ${(e as Error).message}`);
    }
    if (!isRecord(data)) throw new ConfigParseError("codex", "top level must be a table");
    const warnings: string[] = [];
    const serversObj = data.mcp_servers;
    if (serversObj !== undefined && !isRecord(serversObj)) {
      throw new ConfigParseError("codex", "mcp_servers must be a table");
    }
    const servers: CanonicalMcpServer[] = [];
    for (const [name, entry] of Object.entries(serversObj ?? {})) {
      if (!isRecord(entry)) {
        warnings.push(`${name}: entry is not a table; dropped`);
        continue;
      }
      const url = typeof entry.url === "string" ? entry.url : undefined;
      const command = typeof entry.command === "string" ? entry.command : undefined;
      if (!url && !command) {
        warnings.push(`${name}: neither command nor url; dropped`);
        continue;
      }
      servers.push({
        name,
        transport: url ? "http" : "stdio",
        command,
        args: stringArgs(entry.args, `${name}.args`, warnings),
        env: asStringRecord(entry.env, `${name}.env`, warnings),
        cwd: typeof entry.cwd === "string" ? entry.cwd : undefined,
        url,
        headers: asStringRecord(entry.http_headers, `${name}.http_headers`, warnings),
        enabled: typeof entry.enabled === "boolean" ? entry.enabled : undefined,
      });
    }
    return { config: { servers }, warnings };
  },
  render(config): RenderResult {
    const warnings: string[] = [];
    const mcp_servers: Record<string, unknown> = {};
    for (const s of config.servers) {
      const entry: Record<string, unknown> = {};
      if (s.transport === "stdio") {
        entry.command = s.command;
        if (s.args?.length) entry.args = s.args;
        if (s.env && Object.keys(s.env).length) entry.env = s.env;
        if (s.cwd) entry.cwd = s.cwd;
      } else {
        if (s.transport === "sse") {
          warnings.push(`${s.name}: codex uses streamable HTTP for remote servers; sse emitted as url`);
        }
        entry.url = s.url;
        if (s.headers && Object.keys(s.headers).length) entry.http_headers = s.headers;
      }
      if (s.enabled === false) entry.enabled = false;
      mcp_servers[s.name] = entry;
    }
    return { content: stringifyToml({ mcp_servers }) + "\n", warnings };
  },
};

/** OpenCode — `opencode.json` with an `mcp` map (`type: "local" | "remote"`). */
export const opencode: ClientAdapter = {
  id: "opencode",
  defaultPath: "opencode.json",
  parse(content): ParseResult {
    const data = parseJson("opencode", content);
    const warnings: string[] = [];
    const serversObj = data.mcp;
    if (serversObj !== undefined && !isRecord(serversObj)) {
      throw new ConfigParseError("opencode", "mcp must be an object");
    }
    const servers: CanonicalMcpServer[] = [];
    for (const [name, entry] of Object.entries(serversObj ?? {})) {
      if (!isRecord(entry)) {
        warnings.push(`${name}: entry is not an object; dropped`);
        continue;
      }
      if (entry.type === "remote") {
        if (typeof entry.url !== "string") {
          warnings.push(`${name}: remote server without a url; dropped`);
          continue;
        }
        servers.push({
          name,
          transport: "http",
          url: entry.url,
          headers: asStringRecord(entry.headers, `${name}.headers`, warnings),
          enabled: typeof entry.enabled === "boolean" ? entry.enabled : undefined,
        });
      } else {
        const cmd = entry.command;
        if (!Array.isArray(cmd) || cmd.length === 0) {
          warnings.push(`${name}: local server without a command array; dropped`);
          continue;
        }
        servers.push({
          name,
          transport: "stdio",
          command: String(cmd[0]),
          args: cmd.slice(1).map(String),
          env: asStringRecord(entry.environment, `${name}.environment`, warnings),
          cwd: typeof entry.cwd === "string" ? entry.cwd : undefined,
          enabled: typeof entry.enabled === "boolean" ? entry.enabled : undefined,
        });
      }
    }
    return { config: { servers }, warnings };
  },
  render(config): RenderResult {
    const warnings: string[] = [];
    const mcp: Record<string, unknown> = {};
    for (const s of config.servers) {
      const entry: Record<string, unknown> = {};
      if (s.transport === "stdio") {
        entry.type = "local";
        entry.command = [s.command, ...(s.args ?? [])];
        if (s.env && Object.keys(s.env).length) entry.environment = s.env;
        if (s.cwd) entry.cwd = s.cwd;
      } else {
        if (s.transport === "sse") {
          warnings.push(`${s.name}: opencode remote servers use streamable HTTP; sse emitted as remote url`);
        }
        entry.type = "remote";
        entry.url = s.url;
        if (s.headers && Object.keys(s.headers).length) entry.headers = s.headers;
      }
      if (s.enabled !== undefined) entry.enabled = s.enabled;
      mcp[s.name] = entry;
    }
    return { content: JSON.stringify({ mcp }, null, 2) + "\n", warnings };
  },
};

export const ADAPTERS: Record<ClientId, ClientAdapter> = {
  "claude-desktop": claudeDesktop,
  "claude-code": claudeCode,
  cursor,
  vscode,
  codex,
  opencode,
};
