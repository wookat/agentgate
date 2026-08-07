export type Transport = "stdio" | "http" | "sse";

export interface CanonicalMcpServer {
  name: string;
  transport: Transport;
  command?: string;
  args?: string[];
  env?: Record<string, string>;
  cwd?: string;
  url?: string;
  headers?: Record<string, string>;
  enabled?: boolean;
}

export interface CanonicalConfig {
  servers: CanonicalMcpServer[];
}

export type ClientId =
  | "claude-desktop"
  | "claude-code"
  | "cursor"
  | "vscode"
  | "codex"
  | "opencode"
  | "windsurf"
  | "cline"
  | "gemini-cli"
  | "kiro"
  | "roo-code"
  | "zed"
  | "continue"
  | "amp"
  | "warp"
  | "lmstudio"
  | "trae"
  | "amazonq";

export const CLIENT_IDS: ClientId[] = [
  "claude-desktop",
  "claude-code",
  "cursor",
  "vscode",
  "codex",
  "opencode",
  "windsurf",
  "cline",
  "gemini-cli",
  "kiro",
  "roo-code",
  "zed",
  "continue",
  "amp",
  "warp",
  "lmstudio",
  "trae",
  "amazonq",
];

export interface ParseResult {
  config: CanonicalConfig;
  warnings: string[];
}

export interface RenderResult {
  content: string;
  warnings: string[];
}

export interface ClientAdapter {
  id: ClientId;
  /** Default config file location, for documentation/help output. */
  defaultPath: string;
  parse(content: string): ParseResult;
  render(config: CanonicalConfig): RenderResult;
}

export class ConfigParseError extends Error {
  constructor(client: ClientId, message: string) {
    super(`[${client}] ${message}`);
    this.name = "ConfigParseError";
  }
}

export function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

export function asStringRecord(
  v: unknown,
  ctx: string,
  warnings: string[],
): Record<string, string> | undefined {
  if (v === undefined) return undefined;
  if (!isRecord(v)) {
    warnings.push(`${ctx}: expected an object of strings; dropped`);
    return undefined;
  }
  const out: Record<string, string> = {};
  for (const [k, val] of Object.entries(v)) {
    if (typeof val === "string") out[k] = val;
    else warnings.push(`${ctx}.${k}: non-string value dropped`);
  }
  return out;
}
