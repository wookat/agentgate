import { Lockfile, ToolLock } from './types.js';

export type DriftKind =
  | 'server-added'
  | 'server-removed'
  | 'tool-added'
  | 'tool-removed'
  | 'description-changed'
  | 'schema-changed'
  | 'skill-added'
  | 'skill-removed'
  | 'skill-changed';

export interface DriftEntry {
  kind: DriftKind;
  server: string;
  tool?: string;
  /** Skill/instruction file path (skill-* kinds). */
  file?: string;
  detail: string;
}

export interface LockDiff {
  drifted: boolean;
  entries: DriftEntry[];
}

/** Compare a baseline lockfile against the current tool surface (expressed as a fresh lockfile). */
export function diffLockfiles(baseline: Lockfile, current: Lockfile): LockDiff {
  const entries: DriftEntry[] = [];
  const baseServers = baseline.servers;
  const currServers = current.servers;

  for (const name of Object.keys(currServers)) {
    if (!(name in baseServers)) {
      entries.push({ kind: 'server-added', server: name, detail: `server "${name}" is new (${currServers[name]!.tools.length} tools) — not in the approved baseline` });
    }
  }
  for (const name of Object.keys(baseServers)) {
    if (!(name in currServers)) {
      entries.push({ kind: 'server-removed', server: name, detail: `server "${name}" is in the baseline but no longer present` });
      continue;
    }
    const base = baseServers[name]!;
    const curr = currServers[name]!;
    if (base.surfaceHash === curr.surfaceHash) continue;

    const baseTools = new Map(base.tools.map((t) => [t.name, t]));
    const currTools = new Map(curr.tools.map((t) => [t.name, t]));
    for (const [toolName, tool] of currTools) {
      const baseTool = baseTools.get(toolName);
      if (!baseTool) {
        entries.push({ kind: 'tool-added', server: name, tool: toolName, detail: `tool "${toolName}" appeared on server "${name}"` });
        continue;
      }
      entries.push(...diffTool(name, baseTool, tool));
    }
    for (const toolName of baseTools.keys()) {
      if (!currTools.has(toolName)) {
        entries.push({ kind: 'tool-removed', server: name, tool: toolName, detail: `tool "${toolName}" disappeared from server "${name}"` });
      }
    }
  }
  // Skill drift is only checked when the baseline locked skills.
  if (baseline.skills && current.skills && baseline.skills.surfaceHash !== current.skills.surfaceHash) {
    const baseFiles = baseline.skills.files;
    const currFiles = current.skills.files;
    for (const file of Object.keys(currFiles)) {
      if (!(file in baseFiles)) {
        entries.push({ kind: 'skill-added', server: '(skills)', file, detail: `skill file "${file}" is new — not in the approved baseline` });
      } else if (baseFiles[file] !== currFiles[file]) {
        entries.push({
          kind: 'skill-changed',
          server: '(skills)',
          file,
          detail: `skill file "${file}" changed (${short(baseFiles[file]!)} → ${short(currFiles[file]!)}) — review for injected instructions`,
        });
      }
    }
    for (const file of Object.keys(baseFiles)) {
      if (!(file in currFiles)) {
        entries.push({ kind: 'skill-removed', server: '(skills)', file, detail: `skill file "${file}" is in the baseline but no longer present` });
      }
    }
  }
  return { drifted: entries.length > 0, entries };
}

function diffTool(server: string, base: ToolLock, curr: ToolLock): DriftEntry[] {
  const entries: DriftEntry[] = [];
  if (base.descriptionHash !== curr.descriptionHash) {
    entries.push({
      kind: 'description-changed',
      server,
      tool: curr.name,
      detail: `tool "${curr.name}" description changed (${short(base.descriptionHash)} → ${short(curr.descriptionHash)}) — review for injected instructions`,
    });
  }
  if (base.inputSchemaHash !== curr.inputSchemaHash) {
    entries.push({
      kind: 'schema-changed',
      server,
      tool: curr.name,
      detail: `tool "${curr.name}" input schema changed (${short(base.inputSchemaHash)} → ${short(curr.inputSchemaHash)}) — review for new/renamed parameters`,
    });
  }
  return entries;
}

function short(hash: string): string {
  return hash.slice(0, 12);
}

/** Render a human-readable diff report. */
export function formatDiff(diff: LockDiff): string {
  if (!diff.drifted) return 'No drift: locked surface matches agentgate.lock.';
  const lines = [`Drift detected: ${diff.entries.length} change(s) from the approved baseline`, ''];
  const symbol: Record<DriftKind, string> = {
    'server-added': '+',
    'tool-added': '+',
    'server-removed': '-',
    'tool-removed': '-',
    'description-changed': '~',
    'schema-changed': '~',
    'skill-added': '+',
    'skill-removed': '-',
    'skill-changed': '~',
  };
  for (const entry of diff.entries) {
    lines.push(`  ${symbol[entry.kind]} [${entry.kind}] ${entry.detail}`);
  }
  return lines.join('\n');
}
