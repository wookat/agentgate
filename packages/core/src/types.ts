import { z } from 'zod';

export const SEVERITIES = ['critical', 'high', 'medium', 'low', 'info'] as const;
export type Severity = (typeof SEVERITIES)[number];

export const RULE_CATEGORIES = [
  'tool-poisoning',
  'credential-leak',
  'overprivileged',
  'auth-missing',
  'ssrf',
  'rce-vectors',
  'supply-chain',
] as const;
export type RuleCategory = (typeof RULE_CATEGORIES)[number];

/** A single MCP server entry, normalized across client config formats. */
export interface McpServerConfig {
  /** Key under which the server is registered in the client config. */
  name: string;
  /** stdio transport */
  command?: string;
  args?: string[];
  env?: Record<string, string>;
  /** remote transports (sse / streamable http) */
  url?: string;
  headers?: Record<string, string>;
  transport?: string;
  /** Path of the config file this entry came from. */
  source: string;
  /** Client that owns the config file (claude, cursor, vscode, codex, opencode, unknown). */
  client: string;
}

/** A tool surface as seen by the agent (from a live server or a lockfile). */
export interface ToolSurface {
  name: string;
  description: string;
  inputSchema: unknown;
}

export interface Finding {
  ruleId: string;
  category: RuleCategory;
  severity: Severity;
  message: string;
  /** Server name or file the finding applies to. */
  target: string;
  /** Optional file location. */
  file?: string;
  line?: number;
  /** Extra structured detail. */
  detail?: string;
}

export interface ScanResult {
  findings: Finding[];
  scannedServers: string[];
  scannedFiles: string[];
}

export const ToolLockSchema = z.object({
  name: z.string(),
  /** sha256 of the tool name */
  nameHash: z.string(),
  /** sha256 of the tool description */
  descriptionHash: z.string(),
  /** sha256 of the canonical JSON of the input schema */
  inputSchemaHash: z.string(),
});
export type ToolLock = z.infer<typeof ToolLockSchema>;

export const ServerLockSchema = z.object({
  /** sha256 over the full tool surface of the server */
  surfaceHash: z.string(),
  tools: z.array(ToolLockSchema),
});
export type ServerLock = z.infer<typeof ServerLockSchema>;

export const LockfileSchema = z.object({
  lockfileVersion: z.literal(1),
  generatedBy: z.string(),
  generatedAt: z.string(),
  servers: z.record(z.string(), ServerLockSchema),
});
export type Lockfile = z.infer<typeof LockfileSchema>;
