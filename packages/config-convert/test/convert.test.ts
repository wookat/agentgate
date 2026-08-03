import { describe, expect, it } from "vitest";
import { convert, ADAPTERS } from "../src/index.js";
import { CLIENT_IDS, ConfigParseError } from "../src/model.js";

const CURSOR_CONFIG = JSON.stringify({
  mcpServers: {
    filesystem: {
      command: "npx",
      args: ["-y", "@modelcontextprotocol/server-filesystem", "/tmp"],
      env: { LOG_LEVEL: "debug" },
    },
    linear: { url: "https://mcp.linear.app/mcp" },
  },
});

describe("convert", () => {
  it("cursor -> vscode adds type and uses servers key", () => {
    const { content, warnings } = convert("cursor", "vscode", CURSOR_CONFIG);
    const out = JSON.parse(content);
    expect(warnings).toEqual([]);
    expect(out.servers.filesystem).toEqual({
      type: "stdio",
      command: "npx",
      args: ["-y", "@modelcontextprotocol/server-filesystem", "/tmp"],
      env: { LOG_LEVEL: "debug" },
    });
    expect(out.servers.linear).toEqual({ type: "http", url: "https://mcp.linear.app/mcp" });
  });

  it("cursor -> codex emits mcp_servers TOML tables", () => {
    const { content } = convert("cursor", "codex", CURSOR_CONFIG);
    expect(content).toContain("[mcp_servers.filesystem]");
    expect(content).toContain('command = "npx"');
    expect(content).toContain("[mcp_servers.linear]");
    expect(content).toContain('url = "https://mcp.linear.app/mcp"');
  });

  it("cursor -> opencode uses command arrays and environment", () => {
    const { content } = convert("cursor", "opencode", CURSOR_CONFIG);
    const out = JSON.parse(content);
    expect(out.mcp.filesystem).toEqual({
      type: "local",
      command: ["npx", "-y", "@modelcontextprotocol/server-filesystem", "/tmp"],
      environment: { LOG_LEVEL: "debug" },
    });
    expect(out.mcp.linear).toEqual({ type: "remote", url: "https://mcp.linear.app/mcp" });
  });

  it("cursor -> claude-desktop drops remote servers with a warning", () => {
    const { content, warnings } = convert("cursor", "claude-desktop", CURSOR_CONFIG);
    const out = JSON.parse(content);
    expect(out.mcpServers.filesystem.command).toBe("npx");
    expect(out.mcpServers.linear).toBeUndefined();
    expect(warnings.some((w) => w.includes("linear"))).toBe(true);
  });

  it("codex TOML round-trips through canonical model", () => {
    const toml = [
      "[mcp_servers.context7]",
      'command = "npx"',
      'args = ["-y", "@upstash/context7-mcp"]',
      "",
      "[mcp_servers.docs]",
      'url = "https://example.com/mcp"',
      "enabled = false",
      "[mcp_servers.docs.http_headers]",
      'Authorization = "Bearer x"',
    ].join("\n");
    const { config } = ADAPTERS.codex.parse(toml);
    expect(config.servers).toHaveLength(2);
    const docs = config.servers.find((s) => s.name === "docs")!;
    expect(docs.transport).toBe("http");
    expect(docs.enabled).toBe(false);
    expect(docs.headers).toEqual({ Authorization: "Bearer x" });
    const back = ADAPTERS.codex.render(config);
    const reparsed = ADAPTERS.codex.parse(back.content);
    expect(reparsed.config).toEqual(config);
  });

  it("opencode disabled flag survives opencode -> codex", () => {
    const oc = JSON.stringify({
      mcp: { probe: { type: "local", command: ["python", "server.py"], enabled: false } },
    });
    const { content } = convert("opencode", "codex", oc);
    expect(content).toContain("enabled = false");
  });

  it("vscode inputs produce a lossy warning", () => {
    const vs = JSON.stringify({
      inputs: [{ id: "api-key", type: "promptString" }],
      servers: { s: { type: "stdio", command: "npx", args: ["x"], env: { KEY: "${input:api-key}" } } },
    });
    const { warnings, content } = convert("vscode", "cursor", vs);
    expect(warnings.some((w) => w.startsWith("inputs:"))).toBe(true);
    expect(JSON.parse(content).mcpServers.s.env.KEY).toBe("${input:api-key}");
  });

  it("every client format round-trips a stdio server", () => {
    for (const from of CLIENT_IDS) {
      const rendered = ADAPTERS[from].render({
        servers: [{ name: "fs", transport: "stdio", command: "npx", args: ["-y", "pkg"] }],
      });
      const { config } = ADAPTERS[from].parse(rendered.content);
      expect(config.servers[0].command, from).toBe("npx");
      expect(config.servers[0].args, from).toEqual(["-y", "pkg"]);
    }
  });

  it("rejects invalid JSON with ConfigParseError", () => {
    expect(() => convert("cursor", "vscode", "{oops")).toThrow(ConfigParseError);
  });
});
