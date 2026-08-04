import fs from 'node:fs';
import path from 'node:path';
import pc from 'picocolors';
import {
  Finding,
  Severity,
  collectDependencies,
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

export async function runDeps(target: string | undefined, opts: DepsOptions): Promise<number> {
  const dir = path.resolve(target ?? process.cwd());
  if (!fs.existsSync(dir) || !fs.statSync(dir).isDirectory()) {
    console.error(pc.red(`error: target directory not found: ${dir}`));
    return 2;
  }

  const { refs, scannedFiles } = collectDependencies(dir, {
    ignore: opts.ignore,
    includeImports: opts.imports !== false,
  });
  debugLog(`collected ${refs.length} dependency ref(s) from ${scannedFiles.length} file(s)`);

  let findings: Finding[];
  const warnings: string[] = [];
  if (opts.offline) {
    findings = scoreOffline(refs);
    warnings.push('offline mode: registry existence/metadata checks skipped, name-shape checks only');
  } else {
    const results = await verifyDependencies(refs, {
      timeoutMs: Number(opts.timeout),
      concurrency: Number(opts.concurrency),
    });
    findings = scoreDependencies(results);
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

  let rendered: string;
  if (opts.format === 'json') {
    rendered = JSON.stringify(report, null, 2);
  } else if (opts.format === 'sarif') {
    rendered = JSON.stringify(toSarif(sorted), null, 2);
  } else {
    for (const w of warnings) console.error(pc.yellow(`warning: ${w}`));
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
