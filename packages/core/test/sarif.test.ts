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

  it('reports the tool version and repository-relative artifact URIs', () => {
    const findings: Finding[] = [
      { ruleId: 'AG-TP-001', category: 'tool-poisoning', severity: 'critical', message: 'bad', target: 's/t', file: '/repo/sub/config.json', line: 3 },
      { ruleId: 'AG-SC-001', category: 'supply-chain', severity: 'medium', message: 'unpinned', target: 'server', file: 'C:\\repo\\sub\\mcp.json' },
      { ruleId: 'AG-SC-001', category: 'supply-chain', severity: 'medium', message: 'outside', target: 'server', file: '/elsewhere/mcp.json' },
    ];
    const sarif = toSarif(findings, { toolVersion: '1.2.3', baseDir: '/repo' }) as {
      runs: {
        tool: { driver: { version: string } };
        results: { locations: { physicalLocation: { artifactLocation: { uri: string } } }[] }[];
      }[];
    };
    const run = sarif.runs[0]!;
    expect(run.tool.driver.version).toBe('1.2.3');
    const uris = run.results.map((r) => r.locations[0]!.physicalLocation.artifactLocation.uri);
    expect(uris[0]).toBe('sub/config.json');
    expect(uris[1]).toBe('C:/repo/sub/mcp.json');
    expect(uris[2]).toBe('/elsewhere/mcp.json');

    const winSarif = toSarif([findings[1]!], { baseDir: 'C:\\repo' }) as typeof sarif;
    expect(winSarif.runs[0]!.results[0]!.locations[0]!.physicalLocation.artifactLocation.uri).toBe('sub/mcp.json');
  });

  it('emits per-rule security-severity and stable result fingerprints', () => {
    const finding: Finding = {
      ruleId: 'AG-SC-001', category: 'supply-chain', severity: 'medium', message: 'unpinned', target: 'server', file: '/repo/mcp.json',
    };
    type Shape = {
      runs: {
        tool: { driver: { rules: { id: string; properties: { 'security-severity': string } }[] } };
        results: { partialFingerprints: Record<string, string> }[];
      }[];
    };
    const run = (toSarif([finding], { baseDir: '/repo' }) as Shape).runs[0]!;
    const ruleSev = Object.fromEntries(run.tool.driver.rules.map((r) => [r.id, r.properties['security-severity']]));
    expect(ruleSev['AG-TP-001']).toBe('9.5');
    expect(ruleSev['AG-SC-001']).toBe('5.0');
    expect(ruleSev['AG-DP-005']).toBe('4.0');
    expect(ruleSev['AG-SC-002']).toBe('9.5');
    expect(ruleSev['AG-SC-003']).toBe('9.5');

    const fp = run.results[0]!.partialFingerprints['agentgateFindingKey/v1'];
    expect(fp).toMatch(/^[0-9a-f]{32}$/);
    const again = (toSarif([finding], { baseDir: '/repo' }) as Shape).runs[0]!.results[0]!.partialFingerprints['agentgateFindingKey/v1'];
    expect(again).toBe(fp);
  });
});
