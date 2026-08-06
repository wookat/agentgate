import { execFile } from 'node:child_process';
import path from 'node:path';
import { promisify } from 'node:util';
import { describe, expect, it } from 'vitest';

const exec = promisify(execFile);
const CLI = path.resolve(__dirname, '..', 'dist', 'index.js');

async function run(args: string[]): Promise<{ stdout: string; stderr: string; code: number }> {
  try {
    const { stdout, stderr } = await exec(process.execPath, [CLI, ...args]);
    return { stdout, stderr, code: 0 };
  } catch (err) {
    const e = err as { stdout?: string; stderr?: string; code?: number };
    return { stdout: e.stdout ?? '', stderr: e.stderr ?? '', code: e.code ?? 1 };
  }
}

// --offline everywhere: tests must be deterministic against the bundled DB.
describe('agentgate advisory', () => {
  it('list prints every bundled advisory and exits 0', async () => {
    const { stdout, code } = await run(['advisory', 'list', '--offline']);
    expect(code).toBe(0);
    expect(stdout).toContain('MCPA-2025-0001');
    expect(stdout).toMatch(/\d+ advisories \(bundled database\)/);
  });

  it('list --json returns the machine-readable database', async () => {
    const { stdout, code } = await run(['advisory', 'list', '--offline', '--json']);
    expect(code).toBe(0);
    const body = JSON.parse(stdout);
    expect(body.source).toBe('bundled');
    expect(body.count).toBeGreaterThanOrEqual(28);
    expect(body.advisories[0].id > body.advisories[1].id).toBe(true);
  });

  it('check flags an affected version and exits 1', async () => {
    const { stdout, code } = await run(['advisory', 'check', 'mcp-remote@0.1.10', '--offline']);
    expect(code).toBe(1);
    expect(stdout).toContain('MCPA-2025-0001');
    expect(stdout).toContain('advisories/mcpa-2025-0001/');
  });

  it('check passes a fixed version and exits 0', async () => {
    const { stdout, code } = await run(['advisory', 'check', 'mcp-remote@0.1.16', '--offline']);
    expect(code).toBe(0);
    expect(stdout).toContain('no MCPA advisories');
  });

  it('check without a version marks ranged matches as not version-confirmed', async () => {
    const { stdout, code } = await run(['advisory', 'check', 'mcp-remote', '--offline', '--json']);
    expect(code).toBe(1);
    const body = JSON.parse(stdout);
    expect(body.package).toEqual({ ecosystem: 'npm', name: 'mcp-remote', version: null });
    expect(body.matches[0].versionConfirmed).toBe(false);
  });

  it('check respects --ecosystem for PyPI packages', async () => {
    const affected = await run(['advisory', 'check', 'flyto-core@2.26.2', '-e', 'pypi', '--offline']);
    expect(affected.code).toBe(1);
    expect(affected.stdout).toContain('MCPA-2026-0012');
    const fixed = await run(['advisory', 'check', 'flyto-core@2.26.7', '-e', 'pypi', '--offline']);
    expect(fixed.code).toBe(0);
  });
});
