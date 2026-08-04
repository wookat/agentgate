import { execFile } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { promisify } from 'node:util';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

const exec = promisify(execFile);

const CLI = path.resolve(__dirname, '..', 'dist', 'index.js');
// Official MCP SDK example server, pinned for reproducibility.
const EVERYTHING = '@modelcontextprotocol/server-everything@2026.7.4';

let dir: string;
let configPath: string;

async function run(args: string[]): Promise<{ stdout: string; stderr: string; code: number }> {
  try {
    const { stdout, stderr } = await exec(process.execPath, [CLI, ...args], { cwd: dir });
    return { stdout, stderr, code: 0 };
  } catch (err) {
    const e = err as { stdout?: string; stderr?: string; code?: number };
    return { stdout: e.stdout ?? '', stderr: e.stderr ?? '', code: e.code ?? 1 };
  }
}

beforeAll(() => {
  dir = fs.mkdtempSync(path.join(os.tmpdir(), 'agentgate-e2e-'));
  configPath = path.join(dir, 'config.json');
  fs.writeFileSync(
    configPath,
    JSON.stringify({
      mcpServers: {
        everything: { command: 'npx', args: ['-y', EVERYTHING] },
      },
    }),
  );
});

afterAll(() => {
  fs.rmSync(dir, { recursive: true, force: true });
});

describe('end-to-end against the official MCP example server', () => {
  it('live-scans, locks, and passes the drift gate', async () => {
    const scan = await run(['scan', '--config', configPath, '--live', '--format', 'json', '--timeout', '120000']);
    const report = JSON.parse(scan.stdout);
    expect(report.warnings).toEqual([]);
    expect(report.scannedServers).toEqual(['everything']);

    const lock = await run(['lock', '--config', configPath, '--timeout', '120000']);
    expect(lock.code).toBe(0);
    const lockfile = JSON.parse(fs.readFileSync(path.join(dir, 'agentgate.lock'), 'utf8'));
    expect(lockfile.servers.everything.tools.length).toBeGreaterThan(3);
    expect(lockfile.servers.everything.tools.map((t: { name: string }) => t.name)).toContain('echo');

    const diff = await run(['diff', '--config', configPath, '--timeout', '120000']);
    expect(diff.code).toBe(0);
    expect(diff.stdout).toMatch(/No drift/);
  }, 300000);
});
