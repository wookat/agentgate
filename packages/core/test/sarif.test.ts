import { describe, expect, it } from 'vitest';
import { toSarif } from '../src/sarif.js';
import { Finding } from '../src/types.js';

describe('toSarif', () => {
  it('emits a valid SARIF 2.1.0 skeleton with rules and results', () => {
    const findings: Finding[] = [
      { ruleId: 'AG-TP-001', category: 'tool-poisoning', severity: 'critical', message: 'bad tool', target: 's/t', file: 'config.json', line: 3 },
      { ruleId: 'AG-SC-001', category: 'supply-chain', severity: 'medium', message: 'unpinned', target: 'server' },
    ];
    const sarif = toSarif(findings) as {
      version: string;
      runs: { tool: { driver: { name: string; rules: { id: string }[] } }; results: { ruleId: string; level: string; locations: unknown[] }[] }[];
    };
    expect(sarif.version).toBe('2.1.0');
    const run = sarif.runs[0]!;
    expect(run.tool.driver.name).toBe('agentgate');
    expect(run.tool.driver.rules.map((r) => r.id)).toContain('AG-TP-001');
    expect(run.results).toHaveLength(2);
    expect(run.results[0]!.level).toBe('error');
    expect(run.results[1]!.level).toBe('warning');
  });
});
