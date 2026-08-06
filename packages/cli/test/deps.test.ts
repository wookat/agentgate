import { execFile } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { promisify } from 'node:util';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

const exec = promisify(execFile);
const CLI = path.resolve(__dirname, '..', 'dist', 'index.js');

let dir: string;

async function run(args: string[], env?: Record<string, string>): Promise<{ stdout: string; stderr: string; code: number }> {
  try {
    const { stdout, stderr } = await exec(process.execPath, [CLI, ...args], {
      cwd: dir,
      env: { ...process.env, GITHUB_ACTIONS: 'false', ...env },
    });
    return { stdout, stderr, code: 0 };
  } catch (err) {
    const e = err as { stdout?: string; stderr?: string; code?: number };
    return { stdout: e.stdout ?? '', stderr: e.stderr ?? '', code: e.code ?? 1 };
  }
}

beforeAll(() => {
  if (!fs.existsSync(CLI)) {
    throw new Error('CLI not built — run `pnpm build` before tests');
  }
  dir = fs.mkdtempSync(path.join(os.tmpdir(), 'agentgate-deps-cli-'));
  fs.writeFileSync(path.join(dir, 'package.json'), JSON.stringify({ dependencies: { lodahs: '^1.0.0' } }));
  fs.writeFileSync(path.join(dir, 'app.py'), 'import requests\n');
});

afterAll(() => {
  fs.rmSync(dir, { recursive: true, force: true });
});

describe('agentgate deps (offline)', () => {
  it('flags typosquats offline and gates with --fail-on', async () => {
    const res = await run(['deps', '.', '--offline', '--fail-on', 'high']);
    expect(res.code).toBe(1);
    expect(res.stdout).toContain('AG-DP-002');
    expect(res.stdout).toContain('lodahs');
    expect(res.stderr).toContain('offline mode');
  });

  it('emits GitHub Actions annotations under GITHUB_ACTIONS', async () => {
    const res = await run(['deps', '.', '--offline'], { GITHUB_ACTIONS: 'true' });
    expect(res.stdout).toMatch(/^::(error|warning|notice) .*title=agentgate AG-DP-.*::/m);
    const plain = await run(['deps', '.', '--offline']);
    expect(plain.stdout).not.toContain('::error');
  });

  it('passes without --fail-on and emits JSON report contract', async () => {
    const res = await run(['deps', '.', '--offline', '--format', 'json']);
    expect(res.code).toBe(0);
    const report = JSON.parse(res.stdout) as {
      version: number;
      dependencies: { name: string; ecosystem: string; origin: string }[];
      findings: { ruleId: string }[];
      warnings: string[];
    };
    expect(report.version).toBe(1);
    expect(report.dependencies.map((d) => `${d.ecosystem}:${d.name}`).sort()).toEqual(['npm:lodahs', 'pypi:requests']);
    expect(report.findings.map((f) => f.ruleId)).toContain('AG-DP-002');
    expect(report.warnings[0]).toContain('offline mode');
  });

  it('emits SARIF with deps rules', async () => {
    const res = await run(['deps', '.', '--offline', '--format', 'sarif']);
    const sarif = JSON.parse(res.stdout) as { runs: { tool: { driver: { rules: { id: string }[] } }; results: { ruleId: string }[] }[] };
    expect(sarif.runs[0]!.tool.driver.rules.some((r) => r.id === 'AG-DP-001')).toBe(true);
    expect(sarif.runs[0]!.results.some((r) => r.ruleId === 'AG-DP-002')).toBe(true);
  });

  it('exits 2 on a missing target directory', async () => {
    const res = await run(['deps', './does-not-exist']);
    expect(res.code).toBe(2);
    expect(res.stderr).toContain('not found');
  });
});
