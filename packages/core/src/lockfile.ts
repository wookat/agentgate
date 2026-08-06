import { createHash } from 'node:crypto';
import { Lockfile, LockfileSchema, ServerLock, SkillsLock, ToolLock, ToolSurface } from './types.js';

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

/** Hash a set of skill/instruction files (posix-relative path → content). */
export function lockSkills(contents: Record<string, string>): SkillsLock {
  const files: Record<string, string> = {};
  for (const file of Object.keys(contents).sort()) {
    files[file] = sha256(contents[file]!);
  }
  const surfaceHash = sha256(canonicalJson(files));
  return { surfaceHash, files };
}

export function createLockfile(
  surfaces: Record<string, ToolSurface[]>,
  generatedBy = 'mcp-agentgate@0.1.0',
  skills?: SkillsLock,
): Lockfile {
  const servers: Record<string, ServerLock> = {};
  for (const name of Object.keys(surfaces).sort()) {
    servers[name] = lockServer(surfaces[name]!);
  }
  return {
    // v1 is frozen; the skills section ships in v2 (see docs/spec/lockfile-v2.md).
    lockfileVersion: skills ? 2 : 1,
    generatedBy,
    generatedAt: new Date().toISOString(),
    servers,
    ...(skills ? { skills } : {}),
  };
}

export function serializeLockfile(lockfile: Lockfile): string {
  return `${JSON.stringify(lockfile, null, 2)}\n`;
}

export const SUPPORTED_LOCKFILE_VERSIONS = [1, 2] as const;
/** @deprecated use {@link SUPPORTED_LOCKFILE_VERSIONS}; kept for API compatibility. */
export const SUPPORTED_LOCKFILE_VERSION = 1;

export function parseLockfile(raw: string): Lockfile {
  const data: unknown = JSON.parse(raw);
  if (
    typeof data === 'object' &&
    data !== null &&
    'lockfileVersion' in data &&
    !(SUPPORTED_LOCKFILE_VERSIONS as readonly unknown[]).includes((data as { lockfileVersion: unknown }).lockfileVersion)
  ) {
    throw new Error(
      `unsupported lockfileVersion ${JSON.stringify((data as { lockfileVersion: unknown }).lockfileVersion)}; ` +
        `this agentgate supports versions ${SUPPORTED_LOCKFILE_VERSIONS.join(', ')}. ` +
        'Upgrade agentgate, or regenerate the lockfile with `agentgate lock`.',
    );
  }
  return LockfileSchema.parse(data);
}
