import { createHash } from 'node:crypto';
import { Lockfile, LockfileSchema, ServerLock, ToolLock, ToolSurface } from './types.js';

export const LOCKFILE_NAME = 'agentgate.lock';

export function sha256(input: string): string {
  return createHash('sha256').update(input, 'utf8').digest('hex');
}

/** Deterministic JSON serialization: object keys sorted recursively. */
export function canonicalJson(value: unknown): string {
  if (Array.isArray(value)) {
    return `[${value.map(canonicalJson).join(',')}]`;
  }
  if (typeof value === 'object' && value !== null) {
    const entries = Object.entries(value as Record<string, unknown>).sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));
    return `{${entries.map(([k, v]) => `${JSON.stringify(k)}:${canonicalJson(v)}`).join(',')}}`;
  }
  return JSON.stringify(value) ?? 'null';
}

export function lockTool(tool: ToolSurface): ToolLock {
  return {
    name: tool.name,
    nameHash: sha256(tool.name),
    descriptionHash: sha256(tool.description),
    inputSchemaHash: sha256(canonicalJson(tool.inputSchema ?? {})),
  };
}

export function lockServer(tools: ToolSurface[]): ServerLock {
  const locked = tools.map(lockTool).sort((a, b) => a.name.localeCompare(b.name));
  const surfaceHash = sha256(canonicalJson(locked.map((t) => [t.nameHash, t.descriptionHash, t.inputSchemaHash])));
  return { surfaceHash, tools: locked };
}

export function createLockfile(surfaces: Record<string, ToolSurface[]>, generatedBy = 'agentgate@0.1.0'): Lockfile {
  const servers: Record<string, ServerLock> = {};
  for (const name of Object.keys(surfaces).sort()) {
    servers[name] = lockServer(surfaces[name]!);
  }
  return {
    lockfileVersion: 1,
    generatedBy,
    generatedAt: new Date().toISOString(),
    servers,
  };
}

export function serializeLockfile(lockfile: Lockfile): string {
  return `${JSON.stringify(lockfile, null, 2)}\n`;
}

export function parseLockfile(raw: string): Lockfile {
  return LockfileSchema.parse(JSON.parse(raw));
}
