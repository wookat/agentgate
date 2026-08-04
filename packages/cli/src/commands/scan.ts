import fs from 'node:fs';
import path from 'node:path';
import pc from 'picocolors';
import { Finding, Severity, scanRepo, scanServers, scanTools, sortFindings, toSarif } from 'mcp-agentgate-core';
import { gatherServers, gatherSurfaces } from '../context.js';
import { maxSeverityAtLeast, renderFindingsTable } from '../output.js';

export interface ScanOptions {
  live?: boolean;
  config?: string;
  server?: string[];
  format: 'table' | 'json' | 'sarif';
  output?: string;
  failOn?: Severity;
  ignore?: string[];
  timeout: string;
}

export async function runScan(target: string | undefined, opts: ScanOptions): Promise<number> {
  const findings: Finding[] = [];
  const scannedFiles: string[] = [];
  const scannedServers: string[] = [];
  const warnings: string[] = [];

  let projectDir = process.cwd();
  if (target) {
    const resolved = path.resolve(target);
    if (!fs.existsSync(resolved)) {
      console.error(pc.red(`error: target not found: ${resolved}`));
      return 2;
    }
    if (fs.statSync(resolved).isDirectory()) {
      projectDir = resolved;
      const repo = scanRepo(resolved, { ignore: opts.ignore });
      findings.push(...repo.findings);
      scannedFiles.push(...repo.scannedFiles);
    } else {
      opts.config = resolved;
    }
  }

  const { servers, files } = gatherServers({ config: opts.config, projectDir, server: opts.server });
  scannedFiles.push(...files);
  scannedServers.push(...servers.map((s) => s.name));
  findings.push(...scanServers(servers));

  if (opts.live) {
    const { surfaces, errors } = await gatherSurfaces(servers, Number(opts.timeout));
    for (const { server, error } of errors) {
      warnings.push(`live scan skipped for "${server}": ${error}`);
    }
    for (const [name, tools] of Object.entries(surfaces)) {
      findings.push(...scanTools(name, tools));
    }
  }

  const sorted = sortFindings(findings);
  const report = {
    version: 1,
    scannedAt: new Date().toISOString(),
    scannedServers,
    scannedFiles,
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
      pc.dim(`Scanned ${scannedServers.length} server(s) across ${scannedFiles.length} file(s)${opts.live ? ' (live)' : ''}`),
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
