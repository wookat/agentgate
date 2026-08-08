import { describe, expect, it } from 'vitest';
import type { DriftEntry, Finding } from 'mcp-agentgate-core';

import { renderDriftAnnotations, renderGitHubAnnotations } from '../src/output.js';

function finding(i: number, severity: Finding['severity']): Finding {
  return {
    ruleId: 'AG-SK-002',
    category: 'overprivileged',
    severity,
    target: `file-${i}.md`,
    file: `skills/file-${i}.md`,
    message: `finding ${i}`,
  };
}

describe('renderGitHubAnnotations', () => {
  it('emits one annotation per finding below the per-level cap', () => {
    const out = renderGitHubAnnotations([finding(1, 'high'), finding(2, 'medium'), finding(3, 'low')]);
    const lines = out.split('\n');
    expect(lines).toHaveLength(3);
    expect(lines[0]).toMatch(/^::error /);
    expect(lines[1]).toMatch(/^::warning /);
    expect(lines[2]).toMatch(/^::notice /);
  });

  it('caps annotations at 10 per level and summarizes the rest', () => {
    const findings = [
      ...Array.from({ length: 25 }, (_, i) => finding(i, 'high')),
      ...Array.from({ length: 12 }, (_, i) => finding(100 + i, 'medium')),
    ];
    const lines = renderGitHubAnnotations(findings).split('\n');
    expect(lines.filter((l) => l.startsWith('::error '))).toHaveLength(10);
    expect(lines.filter((l) => l.startsWith('::warning '))).toHaveLength(10);
    const summary = lines.filter((l) => l.startsWith('::notice '));
    expect(summary).toHaveLength(1);
    expect(summary[0]).toContain('17 more finding(s) not annotated');
  });

  it('keeps the most severe findings when capping', () => {
    const findings = [
      ...Array.from({ length: 15 }, (_, i) => finding(i, 'high')),
      finding(99, 'critical'),
    ];
    const lines = renderGitHubAnnotations(findings).split('\n');
    expect(lines[0]).toContain('(critical)');
    expect(lines.filter((l) => l.startsWith('::error '))).toHaveLength(10);
  });
});

describe('renderDriftAnnotations', () => {
  it('caps drift annotations at 10 and summarizes the rest', () => {
    const entries: DriftEntry[] = Array.from({ length: 14 }, (_, i) => ({
      kind: 'skill-changed',
      server: `skill-${i}`,
      file: `.claude/skills/s${i}/SKILL.md`,
      detail: `skill ${i} changed`,
    }));
    const lines = renderDriftAnnotations(entries).split('\n');
    expect(lines.filter((l) => l.startsWith('::error '))).toHaveLength(10);
    expect(lines[lines.length - 1]).toMatch(/^::notice .*4 more drift entries not annotated/);
  });

  it('emits no summary when within the cap', () => {
    const entries: DriftEntry[] = [{ kind: 'skill-changed', server: 's', file: 'f.md', detail: 'changed' }];
    const out = renderDriftAnnotations(entries);
    expect(out.split('\n')).toHaveLength(1);
    expect(out).not.toContain('::notice');
  });
});
