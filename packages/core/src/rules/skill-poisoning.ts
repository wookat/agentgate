import { Rule, finding } from './rule.js';
import { INJECTION_PATTERNS, findHiddenInSource } from './tool-poisoning.js';

/**
 * Agent skill files: `SKILL.md` anywhere, or any markdown under a
 * `skills/` directory of an agent config tree (.agents, .claude, .cursor,
 * .codex, .opencode).
 */
export const SKILL_FILE = /(^|\/)skill\.md$|(^|\/)\.(agents|claude|cursor|codex|opencode)\/skills\/.+\.md$/i;

/** Extract the `allowed-tools` frontmatter value(s) from a SKILL.md file. */
export function parseAllowedTools(content: string): string[] {
  const fm = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!fm?.[1]) return [];
  const lines = fm[1].split(/\r?\n/);
  const idx = lines.findIndex((l) => /^allowed-tools\s*:/i.test(l));
  if (idx === -1) return [];
  const inline = (lines[idx] ?? '').replace(/^allowed-tools\s*:/i, '').trim();
  let raw = inline;
  if (!inline) {
    // YAML list form: subsequent "- item" lines.
    const items: string[] = [];
    for (let i = idx + 1; i < lines.length; i++) {
      const m = (lines[i] ?? '').match(/^\s+-\s+(.+)$/);
      if (!m?.[1]) break;
      items.push(m[1].trim());
    }
    raw = items.join(',');
  }
  const tokens = raw.match(/[A-Za-z_][A-Za-z0-9_]*(\([^)]*\))?/g) ?? [];
  return tokens.map((t) => t.replace(/^['"]|['"]$/g, ''));
}

/** Tool grants that pre-approve dangerous capabilities when unscoped. */
const RISKY_GRANTS: { re: RegExp; severity: 'high' | 'medium'; risk: string }[] = [
  { re: /^bash(\(\s*(\*(:\*)?)?\s*\))?$/i, severity: 'high', risk: 'unrestricted shell execution' },
  { re: /^(write|edit)(\(\s*\*?\s*\))?$/i, severity: 'medium', risk: 'unrestricted file writes' },
  { re: /^(webfetch|websearch)(\(\s*\*?\s*\))?$/i, severity: 'medium', risk: 'unrestricted network access (exfiltration channel)' },
];

export const skillOverprivilegeRule: Rule = {
  id: 'AG-SK-002',
  category: 'overprivileged',
  description: 'Detects skill frontmatter that pre-approves dangerous unscoped tool grants (allowed-tools)',
  checkSkill(file, content) {
    const findings = [];
    for (const grant of parseAllowedTools(content)) {
      const hit = RISKY_GRANTS.find((r) => r.re.test(grant));
      if (hit) {
        findings.push(
          finding(this, {
            severity: hit.severity,
            target: file,
            file,
            message: `Skill pre-approves "${grant}" via allowed-tools — ${hit.risk} without a permission prompt; scope the grant (e.g. Bash(git add *)) or remove it`,
          }),
        );
      }
    }
    return findings;
  },
};

export const skillPoisoningRule: Rule = {
  id: 'AG-SK-001',
  category: 'tool-poisoning',
  description: 'Detects hidden Unicode and prompt-injection patterns in agent skill files (SKILL.md)',
  checkSkill(file, content) {
    const findings = [];
    const hidden = findHiddenInSource(content);
    if (hidden) {
      const codepoint = `U+${hidden.char.codePointAt(0)!.toString(16).toUpperCase().padStart(4, '0')}`;
      findings.push(
        finding(this, {
          severity: 'critical',
          target: file,
          file,
          line: hidden.line,
          message: `Skill file contains a hidden/invisible Unicode character (${codepoint}) at line ${hidden.line} — skills are executed as agent instructions`,
        }),
      );
    }
    for (const { re, label } of INJECTION_PATTERNS) {
      const m = content.match(re);
      if (m) {
        findings.push(
          finding(this, {
            severity: 'critical',
            target: file,
            file,
            line: content.slice(0, m.index ?? 0).split('\n').length,
            message: `Skill file matches prompt-injection pattern (${label}): "${m[0].slice(0, 80)}"`,
          }),
        );
      }
    }
    return findings;
  },
};
