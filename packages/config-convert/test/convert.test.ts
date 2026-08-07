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

  it("windsurf remote servers use serverUrl in both directions", () => {
    const ws = JSON.stringify({
      mcpServers: { remote: { serverUrl: "https://mcp.example.com/sse", headers: { A: "b" } } },
    });
    const { config } = ADAPTERS.windsurf.parse(ws);
    expect(config.servers[0].url).toBe("https://mcp.example.com/sse");
    const rendered = ADAPTERS.windsurf.render(config);
    const out = JSON.parse(rendered.content).mcpServers.remote;
    expect(out.serverUrl).toBe("https://mcp.example.com/sse");
    expect(out.url).toBeUndefined();
  });

  it("gemini-cli distinguishes sse url from streamable httpUrl", () => {
    const gm = JSON.stringify({
      mcpServers: {
        sse: { url: "https://a.example/sse" },
        http: { httpUrl: "https://b.example/mcp" },
      },
    });
    const { config } = ADAPTERS["gemini-cli"].parse(gm);
    expect(config.servers.map((s) => s.transport).sort()).toEqual(["http", "sse"]);
    const rendered = ADAPTERS["gemini-cli"].render(config);
    const out = JSON.parse(rendered.content).mcpServers;
    expect(out.sse.url).toBe("https://a.example/sse");
    expect(out.http.httpUrl).toBe("https://b.example/mcp");
  });

  it("cline disabled flag maps to enabled and back, autoApprove warns", () => {
    const cl = JSON.stringify({
      mcpServers: { s: { command: "npx", args: ["x"], disabled: true, autoApprove: ["tool_a"] } },
    });
    const { config, warnings } = ADAPTERS.cline.parse(cl);
    expect(config.servers[0].enabled).toBe(false);
    expect(warnings.some((w) => w.includes("autoApprove"))).toBe(true);
    const rendered = ADAPTERS.cline.render(config);
    expect(JSON.parse(rendered.content).mcpServers.s.disabled).toBe(true);
  });

  it("zed parses JSONC context_servers and renders a mergeable document", () => {
    const raw = `{
  // ui settings elsewhere
  "theme": "One Dark", /* block */
  "context_servers": {
    "local": { "command": "npx", "args": ["-y", "pkg"], "env": { "K": "v" }, },
    "remote": { "url": "https://mcp.example.com/mcp", "headers": { "Authorization": "Bearer x" } },
  },
}`;
    const { config, warnings } = ADAPTERS.zed.parse(raw);
    expect(warnings).toEqual([]);
    expect(config.servers).toHaveLength(2);
    const rendered = ADAPTERS.zed.render(config);
    const out = JSON.parse(rendered.content).context_servers;
    expect(out.local).toEqual({ command: "npx", args: ["-y", "pkg"], env: { K: "v" } });
    expect(out.remote).toEqual({ url: "https://mcp.example.com/mcp", headers: { Authorization: "Bearer x" } });
    expect(rendered.warnings.some((w) => w.includes("merge"))).toBe(true);
  });

  it("cursor -> zed wraps servers under context_servers", () => {
    const { content } = convert("cursor", "zed", CURSOR_CONFIG);
    const out = JSON.parse(content).context_servers;
    expect(out.filesystem.command).toBe("npx");
    expect(out.linear.url).toBe("https://mcp.linear.app/mcp");
  });

  it("kiro and roo-code use standard mcpServers", () => {
    for (const id of ["kiro", "roo-code"] as const) {
      const { content } = convert("cursor", id, CURSOR_CONFIG);
      const out = JSON.parse(content).mcpServers;
      expect(out.filesystem.command, id).toBe("npx");
    }
  });

  it("continue parses the YAML mcpServers list and renders a standalone block", () => {
    const raw = `name: My Config
version: 0.0.1
schema: v1
mcpServers:
  - name: browser
    command: npx
    args:
      - "@playwright/mcp@latest"
    env:
      K: v
  - name: remote
    type: streamable-http
    url: https://mcp.example.com/mcp
`;
    const { config, warnings } = ADAPTERS.continue.parse(raw);
    expect(warnings).toEqual([]);
    expect(config.servers).toHaveLength(2);
    expect(config.servers[0]).toMatchObject({ name: "browser", command: "npx", transport: "stdio" });
    expect(config.servers[1]).toMatchObject({ name: "remote", url: "https://mcp.example.com/mcp", transport: "http" });
    const rendered = ADAPTERS.continue.render(config);
    expect(rendered.content).toContain("mcpServers:");
    expect(rendered.content).toContain("name: browser");
    expect(rendered.warnings.some((w) => w.includes(".continue/mcpServers"))).toBe(true);
  });

  it("cursor -> continue emits a YAML list round-trippable back to canonical", () => {
    const { content } = convert("cursor", "continue", CURSOR_CONFIG);
    const back = ADAPTERS.continue.parse(content).config;
    expect(back.servers.map((s) => s.name).sort()).toEqual(["filesystem", "linear"]);
    expect(back.servers.find((s) => s.name === "linear")!.url).toBe("https://mcp.linear.app/mcp");
  });

  it("amp parses the amp.mcpServers key and renders a mergeable settings document", () => {
    const raw = JSON.stringify({
      "amp.commands.allowlist": ["git status"],
      "amp.mcpServers": {
        playwright: { command: "npx", args: ["-y", "@playwright/mcp@latest", "--headless"] },
        linear: { url: "https://mcp.linear.app/sse" },
      },
    });
    const { config } = ADAPTERS.amp.parse(raw);
    expect(config.servers.map((s) => s.name).sort()).toEqual(["linear", "playwright"]);
    const rendered = ADAPTERS.amp.render(config);
    const doc = JSON.parse(rendered.content) as Record<string, Record<string, unknown>>;
    expect(Object.keys(doc["amp.mcpServers"]).sort()).toEqual(["linear", "playwright"]);
    expect(rendered.warnings.some((w) => w.includes("merge the amp.mcpServers key"))).toBe(true);
  });

  it("cursor -> amp round-trips names and URLs", () => {
    const { content } = convert("cursor", "amp", CURSOR_CONFIG);
    const back = ADAPTERS.amp.parse(content).config;
    expect(back.servers.map((s) => s.name).sort()).toEqual(["filesystem", "linear"]);
    expect(back.servers.find((s) => s.name === "linear")!.url).toBe("https://mcp.linear.app/mcp");
  });

  it("warp maps working_directory to cwd and back", () => {
    const raw = JSON.stringify({
      mcpServers: {
        fs: { command: "npx", args: ["-y", "@modelcontextprotocol/server-filesystem"], working_directory: "/srv/app" },
        docs: { url: "https://mcp.example.com/mcp" },
      },
    });
    const { config } = ADAPTERS.warp.parse(raw);
    expect(config.servers.find((s) => s.name === "fs")!.cwd).toBe("/srv/app");
    const rendered = ADAPTERS.warp.render(config);
    const doc = JSON.parse(rendered.content) as { mcpServers: Record<string, Record<string, unknown>> };
    expect(doc.mcpServers.fs.working_directory).toBe("/srv/app");
    expect(doc.mcpServers.docs.url).toBe("https://mcp.example.com/mcp");
  });

  it("cursor -> warp round-trips names and URLs", () => {
    const { content } = convert("cursor", "warp", CURSOR_CONFIG);
    const back = ADAPTERS.warp.parse(content).config;
    expect(back.servers.map((s) => s.name).sort()).toEqual(["filesystem", "linear"]);
    expect(back.servers.find((s) => s.name === "linear")!.url).toBe("https://mcp.linear.app/mcp");
  });

  it("cursor -> lmstudio round-trips names and URLs", () => {
    const { content } = convert("cursor", "lmstudio", CURSOR_CONFIG);
    const back = ADAPTERS.lmstudio.parse(content).config;
    expect(back.servers.map((s) => s.name).sort()).toEqual(["filesystem", "linear"]);
    expect(back.servers.find((s) => s.name === "linear")!.url).toBe("https://mcp.linear.app/mcp");
  });

  it("cursor -> trae round-trips names and URLs", () => {
    const { content } = convert("cursor", "trae", CURSOR_CONFIG);
    const back = ADAPTERS.trae.parse(content).config;
    expect(back.servers.map((s) => s.name).sort()).toEqual(["filesystem", "linear"]);
    expect(back.servers.find((s) => s.name === "linear")!.url).toBe("https://mcp.linear.app/mcp");
  });

  it("rejects invalid JSON with ConfigParseError", () => {
    expect(() => convert("cursor", "vscode", "{oops")).toThrow(ConfigParseError);
  });
});
