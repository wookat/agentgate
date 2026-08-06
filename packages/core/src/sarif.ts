import { createHash } from 'node:crypto';
import { ALL_RULES } from './rules/index.js';
import { ruleDocUrl } from './docs.js';
import { DEP_RULES } from './deps/score.js';
import { Finding, Severity } from './types.js';

const SARIF_LEVEL: Record<Severity, string> = {
  critical: 'error',
  high: 'error',
  medium: 'warning',
  low: 'note',
  info: 'note',
};

const SECURITY_SEVERITY: Record<Severity, string> = {
  critical: '9.5',
  high: '8.0',
  medium: '5.0',
  low: '2.5',
  info: '0.0',
};

/**
 * Default per-rule security-severity: the CVSS-like score of the typical
 * highest-severity finding each rule emits. GitHub code scanning uses this
 * rule-level value for its critical/high/medium/low filter buckets.
 */
const RULE_SECURITY_SEVERITY: Record<string, string> = {
  'AG-TP-001': '9.5',
  'AG-SK-001': '9.5',
  'AG-CL-001': '8.0',
  'AG-OP-001': '7.0',
  'AG-AM-001': '6.5',
  'AG-SS-001': '7.5',
  'AG-RC-001': '9.0',
  'AG-SC-001': '5.0',
  'AG-SC-002': '9.5',
  'AG-SC-003': '9.5',
  'AG-TF-001': '7.0',
  'AG-XS-001': '8.0',
  'AG-DP-001': '8.5',
  'AG-DP-002': '7.5',
  'AG-DP-003': '5.0',
  'AG-DP-004': '5.0',
  'AG-DP-005': '4.0',
  'AG-DP-006': '9.5',
};

/** Advisory-driven rules emitted by the scan pipeline outside ALL_RULES/DEP_RULES. */
const ADVISORY_RULES = [
  { id: 'AG-SC-002', description: 'Configured server package is a known-malicious package (OSV.dev MAL advisory)' },
  { id: 'AG-SC-003', description: 'Configured server package matches an AgentGate MCP advisory (MCPA database)' },
] as const;

function fingerprint(f: Finding, uri: string): string {
  return createHash('sha256').update(`${f.ruleId}\n${uri}\n${f.target}\n${f.message}`).digest('hex').slice(0, 32);
}

export interface SarifOptions {
  /** Version reported as tool.driver.version. */
  toolVersion?: string;
  /**
   * Directory that artifact URIs are made relative to (default: cwd).
   * GitHub code scanning requires repository-relative paths.
   */
  baseDir?: string;
}

function relativeUri(file: string, baseDir: string): string {
  const base = baseDir.endsWith('/') ? baseDir : `${baseDir}/`;
  const posix = file.replaceAll('\\', '/');
  return posix.startsWith(base) ? posix.slice(base.length) : posix;
}

/** Convert findings to SARIF 2.1.0 for GitHub code scanning and other consumers. */
export function toSarif(findings: Finding[], opts: SarifOptions = {}): object {
  const toolVersion = opts.toolVersion ?? '0.0.0';
  const baseDir = (opts.baseDir ?? process.cwd()).replaceAll('\\', '/');
  return {
    $schema: 'https://raw.githubusercontent.com/oasis-tcs/sarif-spec/master/Schemata/sarif-schema-2.1.0.json',
    version: '2.1.0',
    runs: [
      {
        tool: {
          driver: {
            name: 'agentgate',
            informationUri: 'https://github.com/wookat/agentgate',
            version: toolVersion,
            rules: [
              ...ALL_RULES.map((rule) => ({
                id: rule.id,
                name: rule.category,
                shortDescription: { text: rule.description },
                helpUri: ruleDocUrl(rule.id, rule.category),
                properties: { 'security-severity': RULE_SECURITY_SEVERITY[rule.id] ?? '8.0', tags: ['security', 'mcp', rule.category] },
              })),
              ...DEP_RULES.map((rule) => ({
                id: rule.id,
                name: 'supply-chain',
                shortDescription: { text: rule.description },
                helpUri: ruleDocUrl(rule.id, 'supply-chain'),
                properties: { 'security-severity': RULE_SECURITY_SEVERITY[rule.id] ?? '8.0', tags: ['security', 'dependencies', 'supply-chain'] },
              })),
              ...ADVISORY_RULES.map((rule) => ({
                id: rule.id,
                name: 'supply-chain',
                shortDescription: { text: rule.description },
                helpUri: ruleDocUrl(rule.id, 'supply-chain'),
                properties: { 'security-severity': RULE_SECURITY_SEVERITY[rule.id] ?? '8.0', tags: ['security', 'mcp', 'supply-chain'] },
              })),
            ],
          },
        },
        results: findings.map((f) => {
          const uri = relativeUri(f.file ?? f.target, baseDir);
          return {
            ruleId: f.ruleId,
            level: SARIF_LEVEL[f.severity],
            message: { text: f.message },
            partialFingerprints: { 'agentgateFindingKey/v1': fingerprint(f, uri) },
            properties: { 'security-severity': SECURITY_SEVERITY[f.severity], category: f.category },
            locations: [
              {
                physicalLocation: {
                  artifactLocation: { uri },
                  region: { startLine: f.line ?? 1 },
                },
              },
            ],
          };
        }),
      },
    ],
  };
}
