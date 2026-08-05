import fs from 'node:fs';
import path from 'node:path';
import pc from 'picocolors';
import {
  Finding,
  Severity,
  collectDependencies,
  loadResolvedVersions,
  queryOsvMalware,
  scoreAdvisories,
  scoreDependencies,
  scoreOffline,
  sortFindings,
  toSarif,
  verifyDependencies,
} from 'mcp-agentgate-core';
import { debugLog } from '../debug.js';
import { maxSeverityAtLeast, renderFindingsTable } from '../output.js';

export interface DepsOptions {
  format: 'table' | 'json' | 'sarif';
  output?: string;
  failOn?: Severity;
  ignore?: string[];
  offline?: boolean;
  /** commander `--no-imports` flag; defaults to true. */
  imports?: boolean;
  timeout: string;
  concurrency: string;
}

/** Resolved version of an npm dependency, read from node_modules when installed. */
function installedVersion(dir: string, ref: { name: string; ecosystem: string }): string | undefined {
  if (ref.ecosystem !== 'npm') return undefined;
  try {
    const pkg = JSON.parse(fs.readFileSync(path.join(dir, 'node_modules', ...ref.name.split('/'), 'package.json'), 'utf8')) as {
      version?: string;
    };
    return typeof pkg.version === 'string' ? pkg.version : undefined;
  } catch {
    return undefined;
  }
}

export async function runDeps(target: string | undefined, opts: DepsOptions): Promise<number> {
  const dir = path.resolve(target ?? process.cwd());
  if (!fs.existsSync(dir) || !fs.statSync(dir).isDirectory()) {
    console.error(pc.red(`error: target directory not found: ${dir}`));
    return 2;
  }

  const { refs, scannedFiles, warnings: collectWarnings } = collectDependencies(dir, {
    ignore: opts.ignore,
    includeImports: opts.imports !== false,
  });
  debugLog(`collected ${refs.length} dependency ref(s) from ${scannedFiles.length} file(s)`);

  let findings: Finding[];
  const warnings: string[] = [...collectWarnings];
  if (opts.offline) {
    findings = scoreOffline(refs);
    warnings.push('offline mode: registry existence/metadata checks skipped, name-shape checks only');
  } else {
    const results = await verifyDependencies(refs, {
      timeoutMs: Number(opts.timeout),
      concurrency: Number(opts.concurrency),
    });
    findings = scoreDependencies(results);
    // When the registry is unreachable every ref fails identically; one warning
    // beats a page of per-package "could not verify" rows.
    const unverified = findings.filter((f) => f.ruleId === 'AG-DP-001' && f.severity === 'info' && f.message.startsWith('could not verify'));
    if (unverified.length > 1 && unverified.length === refs.length) {
      const reason = unverified[0]!.message.split(': ').slice(1).join(': ');
      findings = findings.filter((f) => !unverified.includes(f));
      warnings.push(
        `registry unreachable (${reason}): ${unverified.length} package(s) could not be verified — re-run with network access or use --offline for name-shape checks only`,
      );
    }
    const osv = await queryOsvMalware(refs, { timeoutMs: Number(opts.timeout) });
    const resolved = loadResolvedVersions(dir);
    findings.push(...scoreAdvisories(osv.advisories, (ref) => resolved.get(ref.name, ref.ecosystem)));
    debugLog(`OSV: ${osv.advisories.length} malware advisory hit(s)${osv.error ? ` (error: ${osv.error})` : ''}`);
    if (osv.error) {
      warnings.push(`OSV.dev unreachable (${osv.error}): known-malware advisory check skipped`);
    }
  }

  const sorted = sortFindings(findings);
  const report = {
    version: 1,
    scannedAt: new Date().toISOString(),
    scannedFiles,
    dependencies: refs.map((r) => ({ name: r.name, ecosystem: r.ecosystem, origin: r.origin, file: r.file })),
    findings: sorted,
    warnings,
  };

  for (const w of warnings) console.error(pc.yellow(`warning: ${w}`));
  let rendered: string;
  if (opts.format === 'json') {
    rendered = JSON.stringify(report, null, 2);
  } else if (opts.format === 'sarif') {
    rendered = JSON.stringify(toSarif(sorted), null, 2);
  } else {
    rendered = [
      pc.dim(`Checked ${refs.length} dependency reference(s) across ${scannedFiles.length} file(s)${opts.offline ? ' (offline)' : ''}`),
      renderFindingsTable(sorted),
    ].join('\n');
  }

  if (opts.output) {
    fs.writeFileSync(opts.output, `${rendered}\n`);
    console.log(pc.dim(`Report written to ${opts.output}`));
  } else {
    console.log(rendered);
  }

  if (opts.failOn && maxSeverityAtLeast(sorted, opts.failOn)) {
    return 1;
  }
  return 0;
}
