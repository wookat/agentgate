import fs from 'node:fs';
import path from 'node:path';
import { DepEcosystem } from './types.js';

/**
 * Resolved dependency versions for a project, read from installed trees and
 * lockfiles (best-effort, no lockfile spec is fully re-implemented):
 * `node_modules`, `package-lock.json` v2/v3, `pnpm-lock.yaml`, `yarn.lock`
 * (v1), `poetry.lock`, and `uv.lock`.
 */
export interface ResolvedVersions {
  get(name: string, ecosystem: DepEcosystem): string | undefined;
}

export function loadResolvedVersions(dir: string): ResolvedVersions {
  const npm = new Map<string, string>();
  const pypi = new Map<string, string>();

  readPackageLock(dir, npm);
  readPnpmLock(dir, npm);
  readYarnLock(dir, npm);
  readPythonLocks(dir, pypi);

  return {
    get(name, ecosystem) {
      if (ecosystem === 'npm') return nodeModulesVersion(dir, name) ?? npm.get(name);
      return pypi.get(name.toLowerCase().replace(/[-_.]+/g, '-'));
    },
  };
}

function nodeModulesVersion(dir: string, name: string): string | undefined {
  try {
    const pkg = JSON.parse(fs.readFileSync(path.join(dir, 'node_modules', ...name.split('/'), 'package.json'), 'utf8')) as {
      version?: string;
    };
    return typeof pkg.version === 'string' ? pkg.version : undefined;
  } catch {
    return undefined;
  }
}

function readPackageLock(dir: string, out: Map<string, string>): void {
  try {
    const lock = JSON.parse(fs.readFileSync(path.join(dir, 'package-lock.json'), 'utf8')) as {
      packages?: Record<string, { version?: string }>;
      dependencies?: Record<string, { version?: string }>;
    };
    // v2/v3: keys are node_modules paths; the last node_modules segment is the package name
    for (const [key, entry] of Object.entries(lock.packages ?? {})) {
      const idx = key.lastIndexOf('node_modules/');
      if (idx === -1 || !entry.version) continue;
      out.set(key.slice(idx + 'node_modules/'.length), entry.version);
    }
    // v1 fallback
    for (const [name, entry] of Object.entries(lock.dependencies ?? {})) {
      if (entry.version && !out.has(name)) out.set(name, entry.version);
    }
  } catch {
    // no lockfile or unparsable — fine
  }
}

function readPnpmLock(dir: string, out: Map<string, string>): void {
  try {
    const text = fs.readFileSync(path.join(dir, 'pnpm-lock.yaml'), 'utf8');
    // packages section keys look like "  /name@1.2.3:", "  /@scope/name@1.2.3(peer)":
    // or (lockfile v9) "  name@1.2.3:". Regex-level on purpose — see docs.
    for (const m of text.matchAll(/^ {2}\/?((?:@[^\s/@]+\/)?[^\s/@]+)@(\d[^\s(:]*)[^:]*:\s*$/gm)) {
      out.set(m[1]!, m[2]!);
    }
  } catch {
    // ignore
  }
}

function readYarnLock(dir: string, out: Map<string, string>): void {
  try {
    const text = fs.readFileSync(path.join(dir, 'yarn.lock'), 'utf8');
    // yarn v1: header line `name@^1.0.0, name@~1.0.1:` followed by `  version "1.0.2"`
    const blocks = text.split(/\n\n/);
    for (const block of blocks) {
      const header = block.match(/^"?((?:@[^\s/@]+\/)?[^\s/@"]+)@[^\n]*:\s*$/m);
      const version = block.match(/^ {2}version "?([^\s"]+)"?\s*$/m);
      if (header && version) out.set(header[1]!, version[1]!);
    }
  } catch {
    // ignore
  }
}

function readPythonLocks(dir: string, out: Map<string, string>): void {
  for (const file of ['poetry.lock', 'uv.lock']) {
    try {
      const text = fs.readFileSync(path.join(dir, file), 'utf8');
      // TOML [[package]] blocks with name = "…" / version = "…"
      for (const m of text.matchAll(/\[\[package\]\]\s*\nname = "([^"]+)"\s*\nversion = "([^"]+)"/g)) {
        out.set(m[1]!.toLowerCase().replace(/[-_.]+/g, '-'), m[2]!);
      }
    } catch {
      // ignore
    }
  }
}
