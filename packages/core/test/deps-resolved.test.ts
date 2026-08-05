import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { loadResolvedVersions } from '../src/deps/resolved.js';

const dirs: string[] = [];
function tmpProject(files: Record<string, string>): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ag-resolved-'));
  dirs.push(dir);
  for (const [name, content] of Object.entries(files)) {
    const full = path.join(dir, name);
    fs.mkdirSync(path.dirname(full), { recursive: true });
    fs.writeFileSync(full, content);
  }
  return dir;
}

afterEach(() => {
  for (const dir of dirs.splice(0)) fs.rmSync(dir, { recursive: true, force: true });
});

describe('loadResolvedVersions', () => {
  it('prefers node_modules, falls back to package-lock v3', () => {
    const dir = tmpProject({
      'node_modules/debug/package.json': JSON.stringify({ version: '4.4.3' }),
      'package-lock.json': JSON.stringify({
        packages: { 'node_modules/debug': { version: '4.4.1' }, 'node_modules/@scope/pkg': { version: '2.0.0' } },
      }),
    });
    const resolved = loadResolvedVersions(dir);
    expect(resolved.get('debug', 'npm')).toBe('4.4.3');
    expect(resolved.get('@scope/pkg', 'npm')).toBe('2.0.0');
    expect(resolved.get('missing', 'npm')).toBeUndefined();
  });

  it('reads nested package-lock entries and v1 dependencies', () => {
    const dir = tmpProject({
      'package-lock.json': JSON.stringify({
        packages: { 'node_modules/a/node_modules/debug': { version: '4.4.2' } },
        dependencies: { legacy: { version: '1.0.0' } },
      }),
    });
    const resolved = loadResolvedVersions(dir);
    expect(resolved.get('debug', 'npm')).toBe('4.4.2');
    expect(resolved.get('legacy', 'npm')).toBe('1.0.0');
  });

  it('reads pnpm-lock.yaml package keys', () => {
    const dir = tmpProject({
      'pnpm-lock.yaml': ['packages:', '', '  /debug@4.4.3:', '    resolution: {}', '', '  "@scope/pkg@1.0.0(peer@2)":', '    resolution: {}'].join(
        '\n',
      ),
    });
    const resolved = loadResolvedVersions(dir);
    expect(resolved.get('debug', 'npm')).toBe('4.4.3');
  });

  it('reads yarn.lock v1 blocks', () => {
    const dir = tmpProject({
      'yarn.lock': ['debug@^4.4.0:', '  version "4.4.3"', '  resolved "…"', '', 'left-pad@^1.0.0:', '  version "1.3.0"'].join('\n\n').replace(
        /\n\n {2}/g,
        '\n  ',
      ),
    });
    const resolved = loadResolvedVersions(dir);
    expect(resolved.get('debug', 'npm')).toBe('4.4.3');
    expect(resolved.get('left-pad', 'npm')).toBe('1.3.0');
  });

  it('reads poetry.lock / uv.lock TOML package blocks with name normalization', () => {
    const dir = tmpProject({
      'poetry.lock': '[[package]]\nname = "Flask_Login"\nversion = "0.6.3"\n\n[[package]]\nname = "requests"\nversion = "2.32.3"\n',
    });
    const resolved = loadResolvedVersions(dir);
    expect(resolved.get('flask-login', 'pypi')).toBe('0.6.3');
    expect(resolved.get('requests', 'pypi')).toBe('2.32.3');
  });

  it('ignores unparsable lockfiles', () => {
    const dir = tmpProject({ 'package-lock.json': 'not json', 'pnpm-lock.yaml': ':::', 'poetry.lock': '???' });
    expect(loadResolvedVersions(dir).get('anything', 'npm')).toBeUndefined();
  });
});
