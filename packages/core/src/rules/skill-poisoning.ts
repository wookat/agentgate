import { Rule, finding } from './rule.js';
import { INJECTION_PATTERNS, findHiddenInSource } from './tool-poisoning.js';

/**
 * Agent skill files: `SKILL.md` anywhere, or any markdown under a
 * `skills/` directory of an agent config tree (.agents, .claude, .cursor,
 * .codex, .opencode).
 */
export const SKILL_FILE = /(^|\/)skill\.md$|(^|\/)\.(agents|claude|cursor|codex|opencode)\/skills\/.+\.md$/i;

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
