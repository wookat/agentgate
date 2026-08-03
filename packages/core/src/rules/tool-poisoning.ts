import { Rule, finding } from './rule.js';

/** Zero-width / bidi / tag characters that can hide instructions from human review. */
const HIDDEN_UNICODE =
  /[\u200b-\u200f\u2028\u2029\u202a-\u202e\u2060-\u2064\u206a-\u206f\ufeff\ue000-\uf8ff]|[\u{e0000}-\u{e007f}]/u;

const INJECTION_PATTERNS: { re: RegExp; label: string }[] = [
  { re: /<(instructions|important|system|secret|hidden)>/i, label: 'hidden instruction tag' },
  { re: /\bignore\s+(all\s+)?(previous|prior|above)\s+(instructions|rules)/i, label: 'instruction override' },
  { re: /\bdo\s+not\s+(tell|mention|inform|reveal|show)\s+(this\s+to\s+)?the\s+user\b/i, label: 'concealment instruction' },
  { re: /\bbefore\s+using\s+this\s+tool[^.]*\b(read|send|pass|include)\b/i, label: 'cross-tool coercion' },
  { re: /\byou\s+must\s+(first\s+)?(read|send|include|attach|forward)\b[^.]*\b(file|ssh|key|token|secret|credential|\.env|id_rsa)/i, label: 'exfiltration instruction' },
  { re: /\bsidenote\b|\bconversation_history\b/i, label: 'known poisoning marker' },
];

export const toolPoisoningRule: Rule = {
  id: 'AG-TP-001',
  category: 'tool-poisoning',
  description: 'Detects hidden Unicode and prompt-injection patterns in tool names/descriptions/schemas',
  checkTool(tool, serverName) {
    const findings = [];
    const text = `${tool.name}\n${tool.description}\n${JSON.stringify(tool.inputSchema ?? {})}`;
    if (HIDDEN_UNICODE.test(text)) {
      findings.push(
        finding(this, {
          severity: 'critical',
          target: `${serverName}/${tool.name}`,
          message: `Tool "${tool.name}" contains hidden/invisible Unicode characters (possible hidden instructions)`,
        }),
      );
    }
    for (const { re, label } of INJECTION_PATTERNS) {
      const m = text.match(re);
      if (m) {
        findings.push(
          finding(this, {
            severity: 'critical',
            target: `${serverName}/${tool.name}`,
            message: `Tool "${tool.name}" description matches prompt-injection pattern (${label}): "${m[0].slice(0, 80)}"`,
          }),
        );
      }
    }
    return findings;
  },
  checkSource(file, content) {
    if (!HIDDEN_UNICODE.test(content)) return [];
    return [
      finding(this, {
        severity: 'high',
        target: file,
        file,
        message: 'Source file contains hidden/invisible Unicode characters (possible hidden tool instructions)',
      }),
    ];
  },
};
