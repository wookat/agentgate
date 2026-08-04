import { ALL_RULES } from './rules/index.js';
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

/** Convert findings to SARIF 2.1.0 for GitHub code scanning and other consumers. */
export function toSarif(findings: Finding[], toolVersion = '0.1.0'): object {
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
                properties: { 'security-severity': '8.0', tags: ['security', 'mcp', rule.category] },
              })),
              ...DEP_RULES.map((rule) => ({
                id: rule.id,
                name: 'supply-chain',
                shortDescription: { text: rule.description },
                properties: { 'security-severity': '8.0', tags: ['security', 'dependencies', 'supply-chain'] },
              })),
            ],
          },
        },
        results: findings.map((f) => ({
          ruleId: f.ruleId,
          level: SARIF_LEVEL[f.severity],
          message: { text: f.message },
          properties: { 'security-severity': SECURITY_SEVERITY[f.severity], category: f.category },
          locations: [
            {
              physicalLocation: {
                artifactLocation: { uri: f.file ?? f.target },
                region: { startLine: f.line ?? 1 },
              },
            },
          ],
        })),
      },
    ],
  };
}
