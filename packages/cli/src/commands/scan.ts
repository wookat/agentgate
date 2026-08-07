import fs from 'node:fs';
import path from 'node:path';
import pc from 'picocolors';
import {
  Finding,
  Severity,
  checkIncludeToolsCoverage,
  fetchLiveMcpaAdvisories,
  matchMcpaAdvisories,
  queryOsvMalware,
  scanConfiguration,
  scanRepo,
  scanServers,
  scanTools,
  scoreAdvisories,
  scoreMcpaMatches,
  serverPackageRef,
  sortFindings,
  toSarif,
} from 'mcp-agentgate-core';
import { gatherServers, gatherSurfaces } from '../context.js';
import { isGitHubActions, maxSeverityAtLeast, renderFindingsTable, renderGitHubAnnotations } from '../output.js';
import { CLI_VERSION } from '../version.js';

export interface ScanOptions {
  live?: boolean;
  config?: string;
  server?: string[];
  format: 'table' | 'json' | 'sarif';
  output?: string;
  failOn?: Severity;
  ignore?: string[];
  timeout: string;
  /** Skip the interactive confirmation before `--live` spawns stdio servers. */
  yes?: boolean;
}

/** Ask once, listing every command that would be spawned. Non-interactive runs must pass --yes. */
async function confirmSpawn(commands: string[]): Promise<boolean> {
  console.error(pc.bold('\nagentgate --live starts these stdio servers as subprocesses to read their tool surface:'));
  for (const c of commands) console.error(`  ${c}`);
  if (!process.stdin.isTTY) {
    console.error(pc.yellow('non-interactive session: re-run with --yes to allow starting them (skipping live scan)\n'));
    return false;
  }
  process.stderr.write(pc.bold('\nStart them? [y/N]: '));
  const answer = await new Promise<string>((resolve) => {
    process.stdin.setEncoding('utf8');
    process.stdin.once('data', (d) => resolve(String(d)));
  });
  process.stdin.pause();
  return /^\s*y(es)?\s*$/i.test(answer);
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
  // the repo walk may have already visited a discovered config (e.g. a skill's mcp.json)
  scannedFiles.push(...files.filter((f) => !scannedFiles.includes(f)));
  scannedServers.push(...servers.map((s) => s.name));
  findings.push(...scanServers(servers));

  // Advisory check: server packages launched through npx/uvx-style runners
  // against OSV.dev known-malware entries. Pinned versions in the spec are
  // compared against version-scoped advisories.
  const pkgRefs = servers.map(serverPackageRef).filter((r) => r !== undefined);
  // AgentGate MCP advisory database: bundled copy (works offline) merged
  // with any fresher records from the live advisory API.
  if (pkgRefs.length > 0) {
    const mcpa = await fetchLiveMcpaAdvisories({ timeoutMs: Number(opts.timeout) });
    if (mcpa.error) {
      warnings.push(`AgentGate advisory API unreachable (${mcpa.error}): using the advisory database bundled with this release`);
    }
    for (const ref of pkgRefs) {
      const matches = matchMcpaAdvisories(ref.name, ref.ecosystem, ref.version, mcpa.advisories);
      findings.push(...scoreMcpaMatches(matches, ref, { serverName: ref.context?.match(/"(.+)"/)?.[1] ?? ref.name, file: ref.file }));
    }
  }
  if (pkgRefs.length > 0) {
    const osv = await queryOsvMalware(pkgRefs, { timeoutMs: Number(opts.timeout) });
    findings.push(
      ...scoreAdvisories(osv.advisories, (ref) => pkgRefs.find((r) => r.name === ref.name && r.ecosystem === ref.ecosystem)?.version).map(
        (f): Finding => ({ ...f, ruleId: 'AG-SC-002', message: `${f.message} (${pkgRefs.find((r) => `${r.ecosystem}:${r.name}` === f.target)?.context ?? 'configured server'})` }),
      ),
    );
    if (osv.error) {
      warnings.push(`OSV.dev unreachable (${osv.error}): known-malware advisory check for server packages skipped`);
    }
  }

  const stdioServers = servers.filter((s) => s.command);
  if (opts.live) {
    const allowed =
      stdioServers.length === 0 ||
      opts.yes ||
      (await confirmSpawn(stdioServers.map((s) => [s.command, ...(s.args ?? [])].join(' '))));
    if (allowed) {
      const { surfaces, errors } = await gatherSurfaces(servers, Number(opts.timeout));
      for (const { server, error } of errors) {
        warnings.push(`live scan skipped for "${server}": ${error}`);
      }
      for (const [name, tools] of Object.entries(surfaces)) {
        findings.push(...scanTools(name, tools));
        const server = servers.find((s) => s.name === name);
        if (server) findings.push(...checkIncludeToolsCoverage(server, tools));
      }
      findings.push(...scanConfiguration(surfaces));
    } else {
      warnings.push(`live scan declined: ${stdioServers.length} stdio server(s) were not started; only static checks ran`);
    }
  } else if (stdioServers.length > 0) {
    warnings.push(
      `${stdioServers.length} stdio server(s) were not started, so their live tool surface (descriptions, schemas) was not inspected — re-run with --live to catch tool poisoning`,
    );
  }

  if (scannedServers.length === 0 && scannedFiles.length === 0) {
    warnings.push(
      'nothing was scanned: no MCP client configs were discovered — pass a config file or directory, or use --config',
    );
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

  for (const w of warnings) console.error(pc.yellow(`warning: ${w}`));
  let rendered: string;
  if (opts.format === 'json') {
    rendered = JSON.stringify(report, null, 2);
  } else if (opts.format === 'sarif') {
    rendered = JSON.stringify(toSarif(sorted, { toolVersion: CLI_VERSION }), null, 2);
  } else {
    rendered = [
      pc.dim(
        scannedServers.length === 0 && scannedFiles.length > 0
          ? `Scanned ${scannedFiles.length} source file(s), no MCP servers configured`
          : `Scanned ${scannedServers.length} server(s) across ${scannedFiles.length} file(s)${opts.live ? ' (live)' : ''}`,
      ),
      renderFindingsTable(sorted),
    ].join('\n');
  }

  if (opts.output) {
    fs.writeFileSync(opts.output, `${rendered}\n`);
    console.log(pc.dim(`Report written to ${opts.output}`));
  } else {
    console.log(rendered);
  }

  if (isGitHubActions() && opts.format === 'table' && sorted.length > 0) {
    console.log(renderGitHubAnnotations(sorted));
  }

  if (opts.failOn && maxSeverityAtLeast(sorted, opts.failOn)) {
    return 1;
  }
  return 0;
}
