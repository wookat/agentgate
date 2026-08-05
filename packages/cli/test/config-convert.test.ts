import { execFile } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { promisify } from 'node:util';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

const exec = promisify(execFile);
const CLI = path.resolve(__dirname, '..', 'dist', 'index.js');

let dir: string;

beforeAll(() => {
  dir = fs.mkdtempSync(path.join(os.tmpdir(), 'agentgate-config-'));
});

afterAll(() => {
  fs.rmSync(dir, { recursive: true, force: true });
});

async function run(args: string[]): Promise<{ stdout: string; stderr: string; code: number }> {
  try {
    const { stdout, stderr } = await exec(process.execPath, [CLI, ...args], { cwd: dir });
    return { stdout, stderr, code: 0 };
  } catch (err) {
    const e = err as { stdout?: string; stderr?: string; code?: number };
    return { stdout: e.stdout ?? '', stderr: e.stderr ?? '', code: e.code ?? 1 };
  }
}

describe('agentgate config convert', () => {
  it('converts cursor JSON to codex TOML via --in/--out', async () => {
    const inFile = path.join(dir, 'cursor.json');
    const outFile = path.join(dir, 'config.toml');
    fs.writeFileSync(inFile, JSON.stringify({ mcpServers: { notes: { command: 'node', args: ['srv.mjs'], env: { K: 'v' } } } }));
    const res = await run(['config', 'convert', '--from', 'cursor', '--to', 'codex', '--in', inFile, '--out', outFile]);
    expect(res.code).toBe(0);
    const toml = fs.readFileSync(outFile, 'utf8');
    expect(toml).toContain('[mcp_servers.notes]');
    expect(toml).toContain('command = "node"');
  });

  it('exits 2 with a readable error on invalid input', async () => {
    const inFile = path.join(dir, 'broken.json');
    fs.writeFileSync(inFile, '{not json');
    const res = await run(['config', 'convert', '--from', 'cursor', '--to', 'vscode', '--in', inFile]);
    expect(res.code).toBe(2);
    expect(res.stderr).toContain('invalid JSON');
  });

  it('rejects unknown client names via option choices', async () => {
    const res = await run(['config', 'convert', '--from', 'nope', '--to', 'vscode', '--in', 'x']);
    expect(res.code).not.toBe(0);
    expect(res.stderr).toContain('nope');
  });
});
