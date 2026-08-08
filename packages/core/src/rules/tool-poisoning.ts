import { Rule, finding, toolText } from './rule.js';

/** Zero-width / bidi / tag characters that can hide instructions from human review. */
const HIDDEN_UNICODE =
  /[\u200b-\u200f\u2028\u2029\u202a-\u202e\u2060-\u2064\u206a-\u206f\ufeff\ue000-\uf8ff]|[\u{e0000}-\u{e007f}]/u;

/** Zero-width joiners between pictographs are ordinary emoji sequences (👩‍💻), not hidden instructions. */
const EMOJI_ZWJ = /(?:\p{Extended_Pictographic}|\p{Emoji_Modifier}|\p{Regional_Indicator})[\u{fe0e}\u{fe0f}]?(?:\u200d(?:\p{Extended_Pictographic}|\p{Emoji_Modifier}|\p{Regional_Indicator})[\u{fe0e}\u{fe0f}]?)+/gu;

/**
 * Same set minus the private-use area (Nerd Font / Powerline glyphs are legitimately
 * embedded in terminal code) and a leading BOM, which are noise in ordinary source files.
 */
const SOURCE_HIDDEN_UNICODE =
  /[\u200b-\u200f\u2028\u2029\u202a-\u202e\u2060-\u2069\u206a-\u206f\ufeff]|[\u{e0000}-\u{e007f}]/u;

export function hasHiddenUnicode(text: string): boolean {
  return HIDDEN_UNICODE.test(text.replace(EMOJI_ZWJ, ''));
}

/** Regional flag emoji (🏴󠁧󠁢󠁥󠁮󠁧󠁿) legitimately encode their region with Unicode tag characters. */
const EMOJI_TAG_SEQUENCE = /\u{1f3f4}[\u{e0020}-\u{e007f}]+/gu;

export function findHiddenInSource(content: string): { char: string; line: number } | undefined {
  const cleaned = content.replace(/^\ufeff/, '').replace(EMOJI_ZWJ, '').replace(EMOJI_TAG_SEQUENCE, '');
  const m = cleaned.match(SOURCE_HIDDEN_UNICODE);
  if (!m) return undefined;
  return { char: m[0], line: cleaned.slice(0, m.index ?? 0).split('\n').length };
}

export const INJECTION_PATTERNS: { re: RegExp; label: string }[] = [
  { re: /<(instructions|important|system|secret|hidden)>/i, label: 'hidden instruction tag' },
  { re: /\bignore\s+(all\s+)?(previous|prior|above)\s+(instructions|rules)/i, label: 'instruction override' },
  // "do not tell the user to <verb> ..." is phrasing guidance, and "do not show the user X until Y"
  // is workflow gating (the artifact is shown eventually), not concealment.
  { re: /\bdo\s+not\s+(tell|mention|inform|reveal|show)\s+(this\s+to\s+)?the\s+user\b(?!\s+to\s)(?![^.\n]*\buntil\b)/i, label: 'concealment instruction' },
  { re: /\bbefore\s+using\s+this\s+tool[^.]*\b(read|send|pass|include)\b/i, label: 'cross-tool coercion' },
  // Requires a sensitive target: "you must read/include the <reference|extension> file" is ordinary
  // skill-doc structure, while real exfiltration names keys, tokens, or credential paths.
  { re: /\byou\s+must\s+(first\s+)?(read|send|include|attach|forward)\b[^.\n]*\b(ssh|key|token|secret|credential|\.env|id_rsa)/i, label: 'exfiltration instruction' },
  { re: /\bsidenote\b|\bconversation_history\b/i, label: 'known poisoning marker' },
];

export const toolPoisoningRule: Rule = {
  id: 'AG-TP-001',
  category: 'tool-poisoning',
  description: 'Detects hidden Unicode and prompt-injection patterns in tool names/descriptions/schemas',
  checkTool(tool, serverName) {
    const findings = [];
    const text = toolText(tool);
    if (hasHiddenUnicode(text)) {
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
    const hit = findHiddenInSource(content);
    if (!hit) return [];
    const cp = hit.char.codePointAt(0)!;
    const codepoint = `U+${cp.toString(16).toUpperCase().padStart(4, '0')}`;
    // Bidi overrides and Unicode tag characters are Trojan-Source-grade; a stray
    // zero-width space or BOM is usually editor noise, so it is reported quietly.
    const trojan = (cp >= 0x202a && cp <= 0x202e) || (cp >= 0x2066 && cp <= 0x2069) || cp >= 0xe0000;
    // Test/fixture trees embed these characters as fixtures for the very
    // defenses under test; still reported, but quietly.
    const testPath = /(^|\/)(tests?|testing|__tests__|examples?|fixtures|mocks?)\//i.test(file) || /\.(test|spec)\.\w+$/i.test(file);
    return [
      finding(this, {
        severity: trojan && !testPath ? 'high' : 'low',
        target: file,
        file,
        line: hit.line,
        message: `Source file contains a hidden/invisible Unicode character (${codepoint}) at line ${hit.line} — possible hidden tool instructions${trojan && testPath ? '; in a test/fixture path, likely a defensive fixture — confirm' : ''}`,
      }),
    ];
  },
};
