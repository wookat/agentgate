import { describe, expect, it } from 'vitest';
import { canonicalJson, createLockfile, lockServer, lockTool, parseLockfile, serializeLockfile, sha256 } from '../src/lockfile.js';
import { ToolSurface } from '../src/types.js';

const tool: ToolSurface = {
  name: 'read_file',
  description: 'Read a file from disk',
  inputSchema: { type: 'object', properties: { path: { type: 'string' } }, required: ['path'] },
};

describe('canonicalJson', () => {
  it('sorts object keys recursively', () => {
    expect(canonicalJson({ b: 1, a: { d: 2, c: 3 } })).toBe('{"a":{"c":3,"d":2},"b":1}');
  });

  it('preserves array order', () => {
    expect(canonicalJson([2, 1, { b: 0, a: 0 }])).toBe('[2,1,{"a":0,"b":0}]');
  });

  it('handles null and primitives', () => {
    expect(canonicalJson(null)).toBe('null');
    expect(canonicalJson('x')).toBe('"x"');
    expect(canonicalJson(3)).toBe('3');
  });
});

describe('lockTool', () => {
  it('produces stable sha256 hashes', () => {
    const locked = lockTool(tool);
    expect(locked.nameHash).toBe(sha256('read_file'));
    expect(locked.descriptionHash).toBe(sha256('Read a file from disk'));
    expect(locked.nameHash).toMatch(/^[0-9a-f]{64}$/);
  });

  it('is insensitive to schema key order', () => {
    const reordered: ToolSurface = {
      ...tool,
      inputSchema: { required: ['path'], properties: { path: { type: 'string' } }, type: 'object' },
    };
    expect(lockTool(reordered).inputSchemaHash).toBe(lockTool(tool).inputSchemaHash);
  });

  it('changes hash when description changes', () => {
    expect(lockTool({ ...tool, description: 'Read any file' }).descriptionHash).not.toBe(lockTool(tool).descriptionHash);
  });
});

describe('lockServer', () => {
  it('sorts tools by name and computes a surface hash', () => {
    const a: ToolSurface = { name: 'a', description: '', inputSchema: {} };
    const b: ToolSurface = { name: 'b', description: '', inputSchema: {} };
    const lock1 = lockServer([b, a]);
    const lock2 = lockServer([a, b]);
    expect(lock1.tools.map((t) => t.name)).toEqual(['a', 'b']);
    expect(lock1.surfaceHash).toBe(lock2.surfaceHash);
  });

  it('surface hash changes when any tool changes', () => {
    const base = lockServer([tool]);
    const changed = lockServer([{ ...tool, description: 'Read a file from disk!' }]);
    expect(changed.surfaceHash).not.toBe(base.surfaceHash);
  });
});

describe('lockfile round-trip', () => {
  it('serializes and parses back', () => {
    const lockfile = createLockfile({ fs: [tool] });
    const parsed = parseLockfile(serializeLockfile(lockfile));
    expect(parsed).toEqual(lockfile);
    expect(parsed.lockfileVersion).toBe(1);
  });

  it('rejects malformed lockfiles', () => {
    expect(() => parseLockfile('{"lockfileVersion":2,"servers":{}}')).toThrow();
  });
});
