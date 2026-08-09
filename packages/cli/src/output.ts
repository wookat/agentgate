import path from 'node:path';
import Table from 'cli-table3';
import pc from 'picocolors';
import { DriftEntry, Finding, Severity, ruleDocUrl, sortFindings } from 'mcp-agentgate-core';

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
  for (const { first: f, size } of groupIdenticalFindings(sortFindings(findings))) {
    table.push([
      SEVERITY_COLOR[f.severity](f.severity.toUpperCase()),
      f.ruleId,
      f.category,
      // Paths have no spaces; wrap them mid-word instead of truncating with "…".
      { content: renderTarget(f, size), wordWrap: true, wrapOnWordBoundary: false },
      renderMessage(f.message),
    ]);
  }
  const counts = countBySeverity(findings);
  const summary = (Object.entries(counts) as [Severity, number][])
    .filter(([, n]) => n > 0)
    .map(([sev, n]) => SEVERITY_COLOR[sev](`${n} ${sev}`))
    .join(', ');
  const ruleCounts = new Map<string, number>();
  for (const f of findings) ruleCounts.set(f.ruleId, (ruleCounts.get(f.ruleId) ?? 0) + 1);
  const docLinks = [...new Map(findings.map((f) => [f.ruleId, ruleDocUrl(f.ruleId, f.category)]))]
    .sort(([a], [b]) => (ruleCounts.get(b)! - ruleCounts.get(a)!) || a.localeCompare(b))
    .map(([id, url]) => pc.dim(`  ${id} ×${ruleCounts.get(id)} → ${url}`))
    .join('\n');
  return `${table.toString()}\n\n${findings.length} finding(s): ${summary}\n${docLinks}`;
}

/** Content width of the Message column (column width minus cell padding). */
const MESSAGE_WIDTH = 58;

/**
 * Word-boundary wrapping truncates tokens wider than the column with "…",
 * which cuts off source URLs and long package specs; those messages wrap
 * mid-word instead so the full text stays visible.
 */
function renderMessage(message: string): string | { content: string; wordWrap: true; wrapOnWordBoundary: false } {
  const hasOverwideToken = message.split(/\s+/).some((t) => t.length > MESSAGE_WIDTH);
  return hasOverwideToken ? { content: message, wordWrap: true, wrapOnWordBoundary: false } : message;
}

/**
 * Server-scoped findings carry the server name as target; when the same server
 * is declared in several client configs the rows are otherwise identical, so
 * show which config file each one came from.
 */
function renderTarget(f: Finding, groupSize = 1): string {
  if (!f.file || f.file.endsWith(f.target)) return f.target;
  const rel = path.relative(process.cwd(), f.file);
  const first = rel.startsWith('..') ? f.file : rel;
  const more = groupSize > 1 ? `\n…and ${groupSize - 1} more file(s)` : '';
  return `${f.target}\n${pc.dim(first + more)}`;
}

/**
 * The same server or component copied verbatim across many config files
 * produces rows identical except for the file path; collapsing them keeps the
 * table readable (one repo in the wild ships 650 copies of one manifest).
 * JSON/SARIF output still lists every finding.
 */
const GROUP_MIN = 4;

function groupIdenticalFindings(sorted: Finding[]): { first: Finding; size: number }[] {
  const keyOf = (f: Finding) =>
    f.file && !f.file.endsWith(f.target) ? `${f.ruleId}\u0000${f.severity}\u0000${f.target}\u0000${f.message}` : null;
  const sizes = new Map<string, number>();
  for (const f of sorted) {
    const key = keyOf(f);
    if (key !== null) sizes.set(key, (sizes.get(key) ?? 0) + 1);
  }
  const out: { first: Finding; size: number }[] = [];
  const emitted = new Set<string>();
  for (const f of sorted) {
    const key = keyOf(f);
    const size = key === null ? 1 : (sizes.get(key) ?? 1);
    if (key !== null && size >= GROUP_MIN) {
      if (emitted.has(key)) continue;
      emitted.add(key);
      out.push({ first: f, size });
    } else {
      out.push({ first: f, size: 1 });
    }
  }
  return out;
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

/** GitHub renders at most this many annotations per level (error/warning/notice) per step; extras are dropped silently. */
const ANNOTATIONS_PER_LEVEL = 10;

/**
 * GitHub Actions workflow-command annotations (`::error file=…,line=…::msg`),
 * so findings surface inline on the PR diff. Emitted only when running under
 * GitHub Actions. Capped at 10 per level (GitHub's per-step display limit) in
 * severity order, with a summary annotation when findings were left out.
 */
export function renderGitHubAnnotations(findings: Finding[]): string {
  const perLevel: Record<'error' | 'warning' | 'notice', number> = { error: 0, warning: 0, notice: 0 };
  const lines: string[] = [];
  let dropped = 0;
  for (const f of sortFindings(findings)) {
    const level = ANNOTATION_LEVEL[f.severity];
    if (perLevel[level] >= ANNOTATIONS_PER_LEVEL) {
      dropped += 1;
      continue;
    }
    perLevel[level] += 1;
    const props = [
      ...(f.file ? [`file=${escapeAnnotationProp(f.file)}`] : []),
      ...(f.line ? [`line=${f.line}`] : []),
      `title=${escapeAnnotationProp(`agentgate ${f.ruleId} (${f.severity})`)}`,
    ].join(',');
    lines.push(`::${level} ${props}::${escapeAnnotation(`${f.target}: ${f.message}`)}`);
  }
  if (dropped > 0) {
    const level = (['notice', 'warning', 'error'] as const).find((l) => perLevel[l] < ANNOTATIONS_PER_LEVEL) ?? 'notice';
    lines.push(
      `::${level} title=${escapeAnnotationProp('agentgate')}::${escapeAnnotation(`${dropped} more finding(s) not annotated (GitHub shows at most ${ANNOTATIONS_PER_LEVEL} annotations per level per step); see the step log or a report file for the full list`)}`,
    );
  }
  return lines.join('\n');
}

/**
 * GitHub Actions annotations for lockfile drift entries, one `::error` per
 * entry. Skill drift entries carry the file path so they land on the PR diff.
 * Capped like findings annotations; extras are summarized.
 */
export function renderDriftAnnotations(entries: DriftEntry[]): string {
  const lines = entries
    .slice(0, ANNOTATIONS_PER_LEVEL)
    .map((e) => {
      const props = [
        ...(e.file ? [`file=${escapeAnnotationProp(e.file)}`] : []),
        `title=${escapeAnnotationProp(`agentgate drift (${e.kind})`)}`,
      ].join(',');
      return `::error ${props}::${escapeAnnotation(e.detail)}`;
    });
  if (entries.length > ANNOTATIONS_PER_LEVEL) {
    lines.push(
      `::notice title=${escapeAnnotationProp('agentgate')}::${escapeAnnotation(`${entries.length - ANNOTATIONS_PER_LEVEL} more drift entries not annotated (GitHub shows at most ${ANNOTATIONS_PER_LEVEL} annotations per level per step); see the step log for the full list`)}`,
    );
  }
  return lines.join('\n');
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
