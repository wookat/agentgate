import { Rule, finding } from './rule.js';
import { INJECTION_PATTERNS, findHiddenInSource } from './tool-poisoning.js';

/**
 * Agent instruction files executed verbatim by an agent: `SKILL.md` anywhere;
 * markdown under `skills/`, `commands/`, or `agents/` of an agent config tree
 * (.agents, .claude, .cursor, .codex, .opencode) or of a Claude Code plugin
 * (`plugins/<name>/...`); Windsurf rules/workflows (`.windsurf/rules|workflows`,
 * `.windsurfrules`); Cline rules (`.clinerules/` dir or file, `.cursorrules`);
 * Cursor rule files (`.cursor/rules/*.mdc`); Gemini CLI custom commands
 * (`.gemini/commands/**.toml`, prompt text with `!{...}` shell blocks);
 * Continue.dev workspace rules and prompts (`.continue/rules|prompts/*.md`,
 * injected into the model context); Trae project rules (`.trae/rules/*.md`,
 * plus the older `.trae/project_rules.md` / `.trae/user_rules.md`); Kiro
 * steering files (`.kiro/steering/*.md`, auto-loaded into every session);
 * Roo Code rules (`.roo/rules/` and mode-specific `.roo/rules-<mode>/`
 * directories, plus the single-file `.roorules` / `.roorules-<mode>`);
 * root instruction files read verbatim by many agents — the agents.md
 * standard (`AGENTS.md`/`AGENT.md`, nested files apply to subtrees),
 * `CLAUDE.md`, `GEMINI.md`, Zed's `.rules`, and GitHub Copilot's
 * `.github/copilot-instructions.md`, path-specific
 * `.github/instructions/**.instructions.md`, prompt files
 * `.github/prompts/*.prompt.md`, and custom agents (`.github/agents/*.md`,
 * VS Code loads any .md in that folder as an agent — typically
 * `*.agent.md` / legacy `*.chatmode.md`) and the legacy chat-mode folder
 * (`.github/chatmodes/*.chatmode.md`, still loaded); Amazon Q Developer project rules
 * (`.amazonq/rules/**.md`, auto-loaded as chat context, subdirs allowed).
 */
export const SKILL_FILE =
  /(^|\/)skill\.md$|(^|\/)\.(agents|claude|cursor|codex|opencode)\/(skills|commands|agents)\/.+\.md$|(^|\/)plugins\/[^/]+\/(skills|commands|agents)\/.+\.md$|(^|\/)\.windsurf\/(rules|workflows)\/.+\.md$|(^|\/)\.clinerules(\/.+\.(md|txt))?$|(^|\/)\.cursor\/rules\/.+\.mdc$|(^|\/)\.(windsurfrules|cursorrules)$|(^|\/)\.gemini\/commands\/.+\.toml$|(^|\/)\.continue\/(rules|prompts)\/.+\.md$|(^|\/)\.trae\/(rules\/.+|project_rules|user_rules)\.md$|(^|\/)\.kiro\/steering\/.+\.md$|(^|\/)\.roo\/rules(-[\w-]+)?\/.+\.(md|txt)$|(^|\/)\.roorules(-[\w-]+)?$|(^|\/)(agents|agent|claude|gemini)\.md$|^\.rules$|(^|\/)\.github\/copilot-instructions\.md$|(^|\/)\.github\/instructions\/.+\.instructions\.md$|(^|\/)\.github\/prompts\/.+\.prompt\.md$|(^|\/)\.github\/agents\/.+\.md$|(^|\/)\.github\/chatmodes\/.+\.chatmode\.md$|(^|\/)\.amazonq\/rules\/.+\.md$/i;

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
    if (!raw) {
      // Indented continuation line, e.g. a YAML flow list: ["Read", "Bash"]
      const next = lines[idx + 1] ?? '';
      if (/^\s+\S/.test(next)) raw = next.trim();
    }
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

/** Claude Code settings files whose `permissions.allow` pre-approves tools for everyone using the project. */
const CLAUDE_SETTINGS_FILE = /(^|\/)\.claude\/settings(\.local)?\.json$/i;

export const skillOverprivilegeRule: Rule = {
  id: 'AG-SK-002',
  category: 'overprivileged',
  description: 'Detects skill frontmatter that pre-approves dangerous unscoped tool grants (allowed-tools)',
  checkSkill(file, content) {
    const findings = [];
    const line = content.split(/\r?\n/).findIndex((l) => /^allowed-tools\s*:/i.test(l)) + 1;
    for (const grant of parseAllowedTools(content)) {
      const hit = RISKY_GRANTS.find((r) => r.re.test(grant));
      if (hit) {
        findings.push(
          finding(this, {
            severity: hit.severity,
            target: file,
            file,
            ...(line > 0 ? { line } : {}),
            message: `Skill pre-approves "${grant}" via allowed-tools — ${hit.risk} without a permission prompt; scope the grant (e.g. Bash(git add *)) or remove it`,
          }),
        );
      }
    }
    return findings;
  },
  checkSource(file, content) {
    if (!CLAUDE_SETTINGS_FILE.test(file)) return [];
    let data: unknown;
    try {
      data = JSON.parse(content);
    } catch {
      return [];
    }
    if (typeof data !== 'object' || data === null) return [];
    const findings = [];
    const settings = data as { permissions?: { allow?: unknown; defaultMode?: unknown } };
    const allow = Array.isArray(settings.permissions?.allow) ? settings.permissions.allow : [];
    for (const entry of allow) {
      if (typeof entry !== 'string') continue;
      const hit = RISKY_GRANTS.find((r) => r.re.test(entry));
      if (hit) {
        const line = content.split(/\r?\n/).findIndex((l) => l.includes(`"${entry}"`)) + 1;
        findings.push(
          finding(this, {
            severity: hit.severity,
            target: file,
            file,
            ...(line > 0 ? { line } : {}),
            message: `Claude Code settings pre-approve "${entry}" via permissions.allow — ${hit.risk} without a permission prompt; scope the grant (e.g. Bash(npm run test *)) or remove it`,
          }),
        );
      }
    }
    if (settings.permissions?.defaultMode === 'bypassPermissions') {
      const line = content.split(/\r?\n/).findIndex((l) => l.includes('bypassPermissions')) + 1;
      findings.push(
        finding(this, {
          severity: 'high',
          target: file,
          file,
          ...(line > 0 ? { line } : {}),
          message: 'Claude Code settings set permissions.defaultMode to "bypassPermissions" — every tool runs without prompts for anyone opening this project',
        }),
      );
    }
    return findings;
  },
};

/**
 * Extract dynamic-context commands: inline `` !`cmd` `` placeholders
 * (recognized at line start or after whitespace), ```! fenced blocks, and
 * Gemini CLI `!{cmd}` shell-injection blocks. These run as shell commands
 * when the skill or command loads.
 */
export function extractDynamicCommands(content: string): { command: string; line: number }[] {
  const out: { command: string; line: number }[] = [];
  const lines = content.split(/\r?\n/);
  let fence: { start: number; body: string[] } | null = null;
  for (let i = 0; i < lines.length; i++) {
    const text = lines[i] ?? '';
    if (fence) {
      if (/^```/.test(text.trim())) {
        out.push({ command: fence.body.join('\n'), line: fence.start });
        fence = null;
      } else {
        fence.body.push(text);
      }
      continue;
    }
    if (/^```!/.test(text.trim())) {
      fence = { start: i + 1, body: [] };
      continue;
    }
    for (const m of text.matchAll(/(?:^|\s)!`([^`]+)`/g)) {
      out.push({ command: m[1] ?? '', line: i + 1 });
    }
    for (const m of text.matchAll(/!\{([^}]+)\}/g)) {
      out.push({ command: m[1] ?? '', line: i + 1 });
    }
  }
  return out;
}

/** Load-time command patterns that go beyond gathering local context. */
const RISKY_COMMANDS: { re: RegExp; severity: 'critical' | 'high'; risk: string }[] = [
  { re: /\b(curl|wget)\b[^|;&]*\|\s*(ba|z|da)?sh\b/, severity: 'critical', risk: 'downloads and executes a remote script at skill load time' },
  { re: /\b(curl|wget)\b[^\n]*\s(-d|--data(-\w+)?|-F|--form|--upload-file|-T)\b/, severity: 'high', risk: 'sends data to a remote host at skill load time' },
  { re: /(~\/\.ssh\b|id_rsa|id_ed25519|\.aws\/credentials|\.npmrc\b|\.netrc\b)/, severity: 'high', risk: 'reads credential material into the prompt at skill load time' },
  { re: /(^|[\s;|&])(cat|grep|head|tail|cp|base64)\b[^\n]*\.env\b/, severity: 'high', risk: 'reads .env secrets into the prompt at skill load time' },
];

export const skillDynamicContextRule: Rule = {
  id: 'AG-SK-003',
  category: 'rce-vectors',
  description: 'Detects dangerous load-time dynamic-context commands in skill files',
  checkSkill(file, content) {
    const findings = [];
    for (const { command, line } of extractDynamicCommands(content)) {
      const hit = RISKY_COMMANDS.find((r) => r.re.test(command));
      if (hit) {
        findings.push(
          finding(this, {
            severity: hit.severity,
            target: file,
            file,
            line,
            message: `Skill dynamic-context command ${hit.risk}: "${command.slice(0, 80)}" — it runs before anyone reviews the rendered prompt`,
          }),
        );
      }
    }
    return findings;
  },
};

/** 1-based line numbers that sit inside a fenced code block (``` or ~~~). */
export function fencedCodeLines(content: string): Set<number> {
  const inFence = new Set<number>();
  const lines = content.split(/\r?\n/);
  let fence: string | null = null;
  for (let i = 0; i < lines.length; i++) {
    const m = (lines[i] ?? '').trimStart().match(/^(`{3,}|~{3,})/);
    if (m?.[1]) {
      if (!fence) {
        fence = m[1][0] as string;
        inFence.add(i + 1);
        continue;
      }
      if (m[1].startsWith(fence)) {
        inFence.add(i + 1);
        fence = null;
        continue;
      }
    }
    if (fence) inFence.add(i + 1);
  }
  return inFence;
}

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
    const codeLines = fencedCodeLines(content);
    for (const { re, label } of INJECTION_PATTERNS) {
      // Prefer a match outside fenced code (critical) over a quoted example
      // (low), so an early code-block example can't mask a real injection.
      const all = [...content.matchAll(new RegExp(re.source, `${re.flags.replace('g', '')}g`))].map((m) => ({
        m,
        line: content.slice(0, m.index ?? 0).split('\n').length,
      }));
      // Skill files ARE instructions, so <instructions>/<important> tags are
      // ordinary prompt-template structure there — not a concealment channel
      // like they are in a tool description.
      const isStructural = (s: string) => label === 'hidden instruction tag' && /^<(instructions|important)>$/i.test(s);
      const best =
        all.find(({ m, line }) => !codeLines.has(line) && !isStructural(m[0])) ??
        all.find(({ line }) => !codeLines.has(line)) ??
        all[0];
      if (best) {
        const { m, line } = best;
        const quoted = codeLines.has(line);
        const structural = isStructural(m[0]);
        findings.push(
          finding(this, {
            severity: quoted || structural ? 'low' : 'critical',
            target: file,
            file,
            line,
            message: quoted
              ? `Skill file matches prompt-injection pattern (${label}) inside a fenced code block: "${m[0].slice(0, 80)}" — likely quoted example content, but review it`
              : structural
                ? `Skill file uses a "${m[0]}" tag — common prompt-template structure in instruction files, but review that it does not conceal directives`
                : `Skill file matches prompt-injection pattern (${label}): "${m[0].slice(0, 80)}"`,
          }),
        );
      }
    }
    return findings;
  },
};
