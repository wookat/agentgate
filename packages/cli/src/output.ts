import Table from 'cli-table3';
import pc from 'picocolors';
import { Finding, Severity, ruleDocUrl, sortFindings } from 'mcp-agentgate-core';

const SEVERITY_COLOR: Record<Severity, (s: string) => string> = {
  critical: (s) => pc.bold(pc.red(s)),
  high: pc.red,
  medium: pc.yellow,
  low: pc.cyan,
  info: pc.dim,
};

export function renderFindingsTable(findings: Finding[]): string {
  if (findings.length === 0) {
    return pc.green('✔ No findings.');
  }
  const table = new Table({
    head: ['Severity', 'Rule', 'Category', 'Target', 'Message'].map((h) => pc.bold(h)),
    wordWrap: true,
    colWidths: [10, 12, 18, 24, 60],
    style: { head: [] },
  });
  for (const f of sortFindings(findings)) {
    table.push([
      SEVERITY_COLOR[f.severity](f.severity.toUpperCase()),
      f.ruleId,
      f.category,
      // Paths have no spaces; wrap them mid-word instead of truncating with "…".
      { content: f.target, wordWrap: true, wrapOnWordBoundary: false },
      f.message,
    ]);
  }
  const counts = countBySeverity(findings);
  const summary = (Object.entries(counts) as [Severity, number][])
    .filter(([, n]) => n > 0)
    .map(([sev, n]) => SEVERITY_COLOR[sev](`${n} ${sev}`))
    .join(', ');
  const docLinks = [...new Map(findings.map((f) => [f.ruleId, ruleDocUrl(f.ruleId, f.category)]))]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([id, url]) => pc.dim(`  ${id} → ${url}`))
    .join('\n');
  return `${table.toString()}\n\n${findings.length} finding(s): ${summary}\n${docLinks}`;
}

const ANNOTATION_LEVEL: Record<Severity, 'error' | 'warning' | 'notice'> = {
  critical: 'error',
  high: 'error',
  medium: 'warning',
  low: 'notice',
  info: 'notice',
};

function escapeAnnotation(s: string): string {
  return s.replace(/%/g, '%25').replace(/\r/g, '%0D').replace(/\n/g, '%0A');
}

function escapeAnnotationProp(s: string): string {
  return escapeAnnotation(s).replace(/:/g, '%3A').replace(/,/g, '%2C');
}

/**
 * GitHub Actions workflow-command annotations (`::error file=…,line=…::msg`),
 * one per finding, so findings surface inline on the PR diff. Emitted only
 * when running under GitHub Actions.
 */
export function renderGitHubAnnotations(findings: Finding[]): string {
  return sortFindings(findings)
    .map((f) => {
      const level = ANNOTATION_LEVEL[f.severity];
      const props = [
        ...(f.file ? [`file=${escapeAnnotationProp(f.file)}`] : []),
        ...(f.line ? [`line=${f.line}`] : []),
        `title=${escapeAnnotationProp(`agentgate ${f.ruleId} (${f.severity})`)}`,
      ].join(',');
      return `::${level} ${props}::${escapeAnnotation(`${f.target}: ${f.message}`)}`;
    })
    .join('\n');
}

export function isGitHubActions(env = process.env): boolean {
  return env.GITHUB_ACTIONS === 'true';
}

export function countBySeverity(findings: Finding[]): Record<Severity, number> {
  const counts: Record<Severity, number> = { critical: 0, high: 0, medium: 0, low: 0, info: 0 };
  for (const f of findings) counts[f.severity] += 1;
  return counts;
}

export function maxSeverityAtLeast(findings: Finding[], threshold: Severity): boolean {
  const order: Severity[] = ['info', 'low', 'medium', 'high', 'critical'];
  const min = order.indexOf(threshold);
  return findings.some((f) => order.indexOf(f.severity) >= min);
}
