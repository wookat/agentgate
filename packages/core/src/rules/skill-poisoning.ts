import { parse as parseYaml } from 'yaml';
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
  /(^|\/)skill\.md$|(^|\/)\.(agents|claude|cursor|codex|opencode)\/(skills|commands|agents)\/.+\.md$|(^|\/)plugins\/[^/]+\/(skills|commands|agents)\/.+\.md$|(^|\/)\.windsurf\/(rules|workflows)\/.+\.md$|(^|\/)\.clinerules(\/.+\.(md|txt))?$|(^|\/)\.cursor\/rules\/.+\.mdc$|(^|\/)\.(windsurfrules|cursorrules)$|(^|\/)\.gemini\/commands\/.+\.toml$|(^|\/)\.continue\/(rules|prompts)\/.+\.md$|(^|\/)\.trae\/(rules\/.+|project_rules|user_rules)\.md$|(^|\/)\.kiro\/(steering|agents)\/.+\.md$|(^|\/)\.roo\/rules(-[\w-]+)?\/.+\.(md|txt)$|(^|\/)\.roorules(-[\w-]+)?$|(^|\/)(agents|agent|claude|gemini)\.md$|^\.rules$|(^|\/)\.github\/copilot-instructions\.md$|(^|\/)\.github\/instructions\/.+\.instructions\.md$|(^|\/)\.github\/prompts\/.+\.prompt\.md$|(^|\/)\.github\/agents\/.+\.md$|(^|\/)\.github\/chatmodes\/.+\.chatmode\.md$|(^|\/)\.amazonq\/rules\/.+\.md$/i;

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

/** OpenCode config whose `permission` block can pre-approve tools for everyone using the project. */
const OPENCODE_CONFIG_FILE = /(^|\/)opencode\.jsonc?$/i;

/** Dangerous OpenCode permission keys and severities when their effective action is "allow". */
const OPENCODE_RISKY_KEYS: { key: string; severity: 'high' | 'medium'; risk: string }[] = [
  { key: 'bash', severity: 'high', risk: 'unrestricted shell execution' },
  { key: 'edit', severity: 'medium', risk: 'unrestricted file edits' },
  { key: 'write', severity: 'medium', risk: 'unrestricted file writes' },
  { key: 'webfetch', severity: 'medium', risk: 'unrestricted network access (exfiltration channel)' },
  { key: 'websearch', severity: 'medium', risk: 'unrestricted network access (exfiltration channel)' },
];

/** True when an OpenCode permission value's catch-all resolves to "allow". */
function opencodeAllowsAll(value: unknown): boolean {
  if (value === 'allow') return true;
  if (typeof value === 'object' && value !== null) {
    return (value as Record<string, unknown>)['*'] === 'allow';
  }
  return false;
}

/** Collect the permission blocks in an OpenCode config: top-level and per-agent. */
function opencodePermissionBlocks(data: object): { scope: string; permission: unknown }[] {
  const out: { scope: string; permission: unknown }[] = [{ scope: 'permission', permission: (data as { permission?: unknown }).permission }];
  const agents = (data as { agent?: unknown }).agent;
  if (typeof agents === 'object' && agents !== null) {
    for (const [name, agent] of Object.entries(agents)) {
      if (typeof agent === 'object' && agent !== null && 'permission' in agent) {
        out.push({ scope: `agent.${name}.permission`, permission: (agent as { permission?: unknown }).permission });
      }
    }
  }
  return out;
}

/** Gemini CLI project settings whose `tools.allowed` bypasses the confirmation dialog. */
const GEMINI_SETTINGS_FILE = /(^|\/)\.gemini\/settings\.json$/i;

/** Dangerous Gemini CLI tool names when granted without a scoping `(...)` suffix. */
const GEMINI_RISKY_TOOLS: { re: RegExp; severity: 'high' | 'medium'; risk: string }[] = [
  { re: /^run_shell_command$/i, severity: 'high', risk: 'unrestricted shell execution' },
  { re: /^(write_file|replace)$/i, severity: 'medium', risk: 'unrestricted file writes' },
  { re: /^(web_fetch|google_web_search)$/i, severity: 'medium', risk: 'unrestricted network access (exfiltration channel)' },
];

/** Roo Code project MCP config whose per-server `alwaysAllow`/`autoApprove` lists skip tool approval. */
const ROO_MCP_FILE = /(^|\/)\.roo\/mcp\.json$/i;

/** Auto-approved tool names that suggest shell execution, data mutation, or exfiltration. */
const DANGEROUS_TOOL_NAME = /exec|shell|command|terminal|run_|sql|migrat|write|delete|remove|drop|deploy|fetch_url/i;

/** VS Code workspace settings whose chat tool auto-approval bypasses all confirmations. */
const VSCODE_SETTINGS_FILE = /(^|\/)\.vscode\/settings\.json$/i;

/** VS Code settings keys that globally auto-approve chat tool calls (current and legacy names). */
const VSCODE_AUTOAPPROVE_KEYS = ['chat.tools.global.autoApprove', 'chat.tools.autoApprove'];

/** Commands VS Code itself ships as default-deny in terminal auto-approval, plus shells/privilege escalation. */
const VSCODE_DANGEROUS_COMMANDS = new Set([
  'rm', 'rmdir', 'del', 'kill', 'curl', 'wget', 'eval', 'chmod', 'chown',
  'sudo', 'sh', 'bash', 'zsh', 'fish', 'powershell', 'pwsh', 'cmd', 'iex', 'invoke-expression',
]);

/** Regex sources that match any command (catch-all terminal auto-approval). */
const CATCH_ALL_REGEX = new Set(['.*', '^.*$', '.+', '^.+$', '.', '^.']);

/** Zed project settings whose agent permissions auto-approve tool actions for anyone opening the project. */
const ZED_SETTINGS_FILE = /(^|\/)\.zed\/settings\.json$/i;

/** Zed tools whose auto-approval means arbitrary shell execution. */
const ZED_HIGH_RISK_TOOLS = new Set(['terminal']);

/** Zed tools whose auto-approval means unrestricted writes/deletes or network egress. */
const ZED_MEDIUM_RISK_TOOLS = new Set(['edit_file', 'write_file', 'delete_path', 'move_path', 'fetch']);

/** Kiro project custom-agent files (JSON form) with embedded permission rules. */
const KIRO_AGENT_JSON = /(^|\/)\.kiro\/agents\/.+\.json$/i;

/** Kiro project custom-agent files (Markdown form, permissions in YAML frontmatter). */
const KIRO_AGENT_MD = /(^|\/)\.kiro\/agents\/.+\.md$/i;

/** Kiro capabilities whose catch-all pre-approval means shell execution (incl. meta-capabilities). */
const KIRO_HIGH_CAPS = new Set(['shell', 'all', 'builtin']);

/** Kiro capabilities whose catch-all pre-approval means unrestricted writes or network egress. */
const KIRO_MEDIUM_CAPS = new Set(['filesystem', 'fs_write', 'mcp', 'web_fetch']);

/** Evaluate Kiro agent permission rules; returns risky catch-all allows. */
function kiroRiskyAllows(rules: unknown): { capability: string; severity: 'high' | 'medium' }[] {
  if (!Array.isArray(rules)) return [];
  const isCatchAll = (match: unknown) =>
    match === undefined || (Array.isArray(match) && (match.length === 0 || match.some((m) => typeof m === 'string' && CATCH_ALL_GLOB.has(m.trim()))));
  const deniedAll = new Set(
    rules
      .filter((r) => typeof r === 'object' && r !== null && (r as { effect?: unknown }).effect === 'deny' && isCatchAll((r as { match?: unknown }).match))
      .map((r) => String((r as { capability?: unknown }).capability ?? '')),
  );
  const out: { capability: string; severity: 'high' | 'medium' }[] = [];
  for (const r of rules) {
    if (typeof r !== 'object' || r === null) continue;
    const { capability, effect, match } = r as { capability?: unknown; effect?: unknown; match?: unknown };
    if (effect !== 'allow' || typeof capability !== 'string' || !isCatchAll(match)) continue;
    // Deny always wins regardless of scope (official priority: deny > ask > allow).
    if (deniedAll.has(capability) || deniedAll.has('all')) continue;
    const severity = KIRO_HIGH_CAPS.has(capability) ? 'high' : KIRO_MEDIUM_CAPS.has(capability) ? 'medium' : undefined;
    if (severity) out.push({ capability, severity });
  }
  return out;
}

/** Cursor CLI project permission config. */
const CURSOR_CLI_FILE = /(^|\/)\.cursor\/cli\.json$/i;

/** Risky Cursor CLI permission tokens in permissions.allow. */
const CURSOR_RISKY_TOKENS: { re: RegExp; severity: 'high' | 'medium'; risk: string }[] = [
  { re: /^Shell\(\s*\*(\s*:\s*\*)?\s*\)$/i, severity: 'high', risk: 'arbitrary shell commands run' },
  { re: /^Mcp\(\s*\*\s*:\s*\*\s*\)$/i, severity: 'high', risk: 'every tool of every MCP server runs' },
  { re: /^Write\(\s*(\*\*?(\/\*+)?)\s*\)$/i, severity: 'medium', risk: 'unrestricted file writes run' },
  { re: /^WebFetch\(\s*\*\s*\)$/i, severity: 'medium', risk: 'fetches to any domain (exfiltration channel) run' },
  { re: /^Mcp\(\s*[^:*)]+\s*:\s*\*\s*\)$/i, severity: 'medium', risk: 'every tool of that MCP server runs' },
];

/** Secret-shaped path fragments whose pre-approved Read/Write means silent credential access. */
const CURSOR_SENSITIVE_PATH = /\.env|\.pem|\.key\b|\.p12|\.pfx|secret|credential|id_rsa/i;

/** Glob patterns that match every file (catch-all edit auto-approval). */
const CATCH_ALL_GLOB = new Set(['**', '**/*', '*']);

/** Sensitive-path fragments whose edit auto-approval lets the agent rewrite its own guardrails or secrets. */
const SENSITIVE_EDIT_GLOB = /\.env|\.vscode|\.github|settings\.json|\.pem|secret|credential/i;

/** Amazon Q CLI project custom-agent files whose allowedTools list pre-approves tool use. */
const AMAZONQ_AGENT_FILE = /(^|\/)\.amazonq\/cli-agents\/[^/]+\.json$/i;

/** Amazon Q built-in tools whose unrestricted pre-approval means shell execution or AWS API access. */
const AMAZONQ_HIGH_RISK_TOOLS = new Set(['execute_bash', 'use_aws']);

/** True when an allowedTools glob entry (using * and ?) matches the given built-in tool name. */
function amazonqGlobMatches(entry: string, tool: string): boolean {
  if (!/[*?]/.test(entry) || entry.startsWith('@')) return false;
  const re = new RegExp(`^${entry.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*').replace(/\?/g, '.')}$`);
  return re.test(tool);
}

/** toolsSettings keys that scope a pre-approved Amazon Q tool to an allowlist. */
const AMAZONQ_SCOPING_KEYS: Record<string, string> = {
  execute_bash: 'allowedCommands',
  use_aws: 'allowedServices',
  fs_write: 'allowedPaths',
};

/** True when a terminal auto-approve map value means "approve". */
function vscodeApproves(value: unknown): boolean {
  return value === true || (typeof value === 'object' && value !== null && (value as { approve?: unknown }).approve === true);
}

/** Parse JSON tolerating the JSONC forms Claude Code accepts: comments and trailing commas. */
export function parseJsonc(content: string): unknown {
  try {
    return JSON.parse(content);
  } catch {
    // Strip comments (outside strings) and trailing commas, then retry.
    let out = '';
    let inString = false;
    let i = 0;
    while (i < content.length) {
      const ch = content[i]!;
      if (inString) {
        out += ch;
        if (ch === '\\') {
          out += content[i + 1] ?? '';
          i += 2;
          continue;
        }
        if (ch === '"') inString = false;
        i++;
        continue;
      }
      if (ch === '"') {
        inString = true;
        out += ch;
        i++;
        continue;
      }
      if (ch === '/' && content[i + 1] === '/') {
        while (i < content.length && content[i] !== '\n') i++;
        continue;
      }
      if (ch === '/' && content[i + 1] === '*') {
        i += 2;
        while (i < content.length && !(content[i] === '*' && content[i + 1] === '/')) i++;
        i += 2;
        continue;
      }
      out += ch;
      i++;
    }
    try {
      return JSON.parse(out.replace(/,(\s*[\]}])/g, '$1'));
    } catch {
      return undefined;
    }
  }
}

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
    if (KIRO_AGENT_MD.test(file)) {
      const fm = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
      let data: unknown;
      try {
        data = fm?.[1] ? parseYaml(fm[1]) : undefined;
      } catch {
        data = undefined;
      }
      const rules = (data as { permissions?: { rules?: unknown } } | undefined)?.permissions?.rules;
      for (const risky of kiroRiskyAllows(rules)) {
        const capLine = content.split(/\r?\n/).findIndex((l) => l.includes(`capability: ${risky.capability}`)) + 1;
        findings.push(
          finding(this, {
            severity: risky.severity,
            target: file,
            file,
            ...(capLine > 0 ? { line: capLine } : {}),
            message: `Kiro agent pre-approves the "${risky.capability}" capability with a catch-all allow rule — it runs without prompting for anyone using this checked-in agent`,
          }),
        );
      }
    }
    return findings;
  },
  checkSource(file, content) {
    const isClaude = CLAUDE_SETTINGS_FILE.test(file);
    const isOpencode = OPENCODE_CONFIG_FILE.test(file);
    const isGemini = GEMINI_SETTINGS_FILE.test(file);
    const isRooMcp = ROO_MCP_FILE.test(file);
    const isVscode = VSCODE_SETTINGS_FILE.test(file);
    const isZed = ZED_SETTINGS_FILE.test(file);
    const isAmazonqAgent = AMAZONQ_AGENT_FILE.test(file);
    const isCursorCli = CURSOR_CLI_FILE.test(file);
    const isKiroAgent = KIRO_AGENT_JSON.test(file);
    if (!isClaude && !isOpencode && !isGemini && !isRooMcp && !isVscode && !isZed && !isAmazonqAgent && !isCursorCli && !isKiroAgent) return [];
    const data = parseJsonc(content);
    if (typeof data !== 'object' || data === null) return [];
    if (isRooMcp) {
      const findings = [];
      const servers = (data as { mcpServers?: unknown }).mcpServers;
      if (typeof servers === 'object' && servers !== null) {
        for (const [name, server] of Object.entries(servers)) {
          if (typeof server !== 'object' || server === null) continue;
          const approved = ['alwaysAllow', 'autoApprove'].flatMap((key) => {
            const list = (server as Record<string, unknown>)[key];
            return Array.isArray(list) ? list.filter((t): t is string => typeof t === 'string') : [];
          });
          if (approved.includes('*')) {
            const line = content.split(/\r?\n/).findIndex((l) => l.includes(`"${name}"`)) + 1;
            findings.push(
              finding(this, {
                severity: 'high',
                target: file,
                file,
                ...(line > 0 ? { line } : {}),
                message: `Roo Code MCP config auto-approves every tool of server "${name}" ("*") — all its tool calls run without approval for anyone opening this project`,
              }),
            );
            continue;
          }
          const dangerous = approved.filter((t) => DANGEROUS_TOOL_NAME.test(t));
          if (dangerous.length > 0) {
            const line = content.split(/\r?\n/).findIndex((l) => l.includes(`"${dangerous[0]}"`)) + 1;
            findings.push(
              finding(this, {
                severity: 'medium',
                target: file,
                file,
                ...(line > 0 ? { line } : {}),
                message: `Roo Code MCP config auto-approves destructive-looking tool(s) ${dangerous
                  .slice(0, 4)
                  .map((t) => `"${t}"`)
                  .join(', ')} of server "${name}" — they run without approval for anyone opening this project`,
              }),
            );
          }
        }
      }
      return findings;
    }
    if (isVscode) {
      const findings = [];
      for (const key of VSCODE_AUTOAPPROVE_KEYS) {
        if ((data as Record<string, unknown>)[key] === true) {
          const line = content.split(/\r?\n/).findIndex((l) => l.includes(`"${key}"`)) + 1;
          findings.push(
            finding(this, {
              severity: 'high',
              target: file,
              file,
              ...(line > 0 ? { line } : {}),
              message: `VS Code workspace settings set ${key} to true — every chat tool call (including terminal commands and file edits) runs without approval for anyone opening this project`,
            }),
          );
          break;
        }
      }
      const terminal = (data as Record<string, unknown>)['chat.tools.terminal.autoApprove'];
      if (typeof terminal === 'object' && terminal !== null) {
        for (const [key, value] of Object.entries(terminal)) {
          if (!vscodeApproves(value)) continue;
          const regexMatch = /^\/(.*)\/[a-z]*$/i.exec(key);
          const isCatchAll = regexMatch !== null && CATCH_ALL_REGEX.has(regexMatch[1]!.trim());
          const commandWord = (regexMatch ? '' : key).trim().split(/\s+/)[0]!.toLowerCase();
          if (!isCatchAll && !VSCODE_DANGEROUS_COMMANDS.has(commandWord)) continue;
          const line = content.split(/\r?\n/).findIndex((l) => l.includes(`"${key}"`)) + 1;
          findings.push(
            finding(this, {
              severity: isCatchAll ? 'high' : 'medium',
              target: file,
              file,
              ...(line > 0 ? { line } : {}),
              message: isCatchAll
                ? `VS Code workspace settings auto-approve every terminal command ("${key}" in chat.tools.terminal.autoApprove) — arbitrary shell execution without approval for anyone opening this project`
                : `VS Code workspace settings auto-approve terminal command "${key}" — ${commandWord} is in VS Code's own default-deny list; it runs without approval for anyone opening this project`,
            }),
          );
        }
      }
      const edits = (data as Record<string, unknown>)['chat.tools.edits.autoApprove'];
      if (typeof edits === 'object' && edits !== null) {
        const entries = Object.entries(edits);
        const hasReDeny = entries.some(([, v]) => v === false);
        for (const [key, value] of entries) {
          if (value !== true) continue;
          const isCatchAll = CATCH_ALL_GLOB.has(key.trim());
          if (isCatchAll && hasReDeny) continue;
          if (!isCatchAll && !SENSITIVE_EDIT_GLOB.test(key)) continue;
          const line = content.split(/\r?\n/).findIndex((l) => l.includes(`"${key}"`)) + 1;
          findings.push(
            finding(this, {
              severity: 'medium',
              target: file,
              file,
              ...(line > 0 ? { line } : {}),
              message: isCatchAll
                ? `VS Code workspace settings auto-approve edits to every file ("${key}" in chat.tools.edits.autoApprove) with no re-denied sensitive paths — the agent can rewrite .env, workspace settings, and workflows without approval`
                : `VS Code workspace settings auto-approve edits to sensitive path "${key}" — the agent can rewrite it (settings, secrets, or CI) without approval for anyone opening this project`,
            }),
          );
        }
      }
      return findings;
    }
    if (isCursorCli) {
      const findings = [];
      const perms = (data as { permissions?: { allow?: unknown; deny?: unknown } }).permissions;
      const allow = Array.isArray(perms?.allow) ? perms.allow : [];
      const deny = new Set(
        (Array.isArray(perms?.deny) ? perms.deny : []).filter((t): t is string => typeof t === 'string').map((t) => t.replace(/\s+/g, '')),
      );
      for (const token of allow) {
        if (typeof token !== 'string') continue;
        // Deny rules take precedence over allow rules.
        if (deny.has(token.replace(/\s+/g, ''))) continue;
        const trimmed = token.trim();
        const hit = CURSOR_RISKY_TOKENS.find((r) => r.re.test(trimmed));
        const sensitiveMatch = !hit && /^(Read|Write)\((.+)\)$/i.exec(trimmed);
        if (!hit && !(sensitiveMatch && CURSOR_SENSITIVE_PATH.test(sensitiveMatch[2]!))) continue;
        const line = content.split(/\r?\n/).findIndex((l) => l.includes(`"${token}"`)) + 1;
        findings.push(
          finding(this, {
            severity: hit ? hit.severity : 'medium',
            target: file,
            file,
            ...(line > 0 ? { line } : {}),
            message: hit
              ? `Cursor CLI project config pre-approves "${token}" in permissions.allow — ${hit.risk} without prompting for anyone using this checked-in config`
              : `Cursor CLI project config pre-approves "${token}" in permissions.allow — the agent ${/^Read/i.test(trimmed) ? 'reads' : 'writes'} secret-shaped paths without prompting for anyone using this checked-in config`,
          }),
        );
      }
      return findings;
    }
    if (isKiroAgent) {
      const findings = [];
      const rules = (data as { permissions?: { rules?: unknown } }).permissions?.rules;
      for (const risky of kiroRiskyAllows(rules)) {
        const line = content.split(/\r?\n/).findIndex((l) => l.includes(`"${risky.capability}"`)) + 1;
        findings.push(
          finding(this, {
            severity: risky.severity,
            target: file,
            file,
            ...(line > 0 ? { line } : {}),
            message: `Kiro agent pre-approves the "${risky.capability}" capability with a catch-all allow rule — it runs without prompting for anyone using this checked-in agent`,
          }),
        );
      }
      return findings;
    }
    if (isAmazonqAgent) {
      const findings = [];
      const allowed = (data as { allowedTools?: unknown }).allowedTools;
      const settings = (data as { toolsSettings?: Record<string, unknown> }).toolsSettings ?? {};
      const isScoped = (tool: string) => {
        const cfg = settings[tool];
        if (typeof cfg !== 'object' || cfg === null) return false;
        const list = (cfg as Record<string, unknown>)[AMAZONQ_SCOPING_KEYS[tool] ?? ''];
        return Array.isArray(list) && list.length > 0;
      };
      for (const entry of Array.isArray(allowed) ? allowed : []) {
        if (typeof entry !== 'string') continue;
        const line = content.split(/\r?\n/).findIndex((l) => l.includes(`"${entry}"`)) + 1;
        if (entry === '*' || entry === '@*' || entry === '@*/*') {
          findings.push(
            finding(this, {
              severity: 'high',
              target: file,
              file,
              ...(line > 0 ? { line } : {}),
              message: `Amazon Q agent pre-approves every tool ("${entry}" in allowedTools) — all tool calls run without prompting for anyone using this checked-in agent`,
            }),
          );
          continue;
        }
        const highTool = AMAZONQ_HIGH_RISK_TOOLS.has(entry)
          ? entry
          : [...AMAZONQ_HIGH_RISK_TOOLS].find((t) => amazonqGlobMatches(entry, t));
        if (highTool && !isScoped(highTool)) {
          findings.push(
            finding(this, {
              severity: 'high',
              target: file,
              file,
              ...(line > 0 ? { line } : {}),
              message: `Amazon Q agent pre-approves "${entry}"${entry === highTool ? '' : ` (matches ${highTool})`} without a toolsSettings allowlist — ${highTool === 'execute_bash' ? 'arbitrary shell commands run' : 'AWS CLI calls run'} without prompting for anyone using this checked-in agent`,
            }),
          );
          continue;
        }
        if ((entry === 'fs_write' || amazonqGlobMatches(entry, 'fs_write')) && !isScoped('fs_write')) {
          findings.push(
            finding(this, {
              severity: 'medium',
              target: file,
              file,
              ...(line > 0 ? { line } : {}),
              message: `Amazon Q agent pre-approves "${entry}"${entry === 'fs_write' ? '' : ' (matches fs_write)'} without a toolsSettings allowedPaths allowlist — unrestricted file writes without prompting`,
            }),
          );
          continue;
        }
        if (/^@[^/]+(\/\*)?$/.test(entry)) {
          findings.push(
            finding(this, {
              severity: 'medium',
              target: file,
              file,
              ...(line > 0 ? { line } : {}),
              message: `Amazon Q agent pre-approves every tool of MCP server "${entry}" — all its tool calls run without prompting for anyone using this checked-in agent`,
            }),
          );
        }
      }
      return findings;
    }
    if (isZed) {
      const findings = [];
      const agent = (data as { agent?: Record<string, unknown> }).agent;
      if (typeof agent === 'object' && agent !== null) {
        const lineOf = (needle: string) => content.split(/\r?\n/).findIndex((l) => l.includes(needle)) + 1;
        if (agent['always_allow_tool_actions'] === true) {
          const line = lineOf('"always_allow_tool_actions"');
          findings.push(
            finding(this, {
              severity: 'high',
              target: file,
              file,
              ...(line > 0 ? { line } : {}),
              message: 'Zed project settings set agent.always_allow_tool_actions to true — every agent tool action (terminal commands, file edits) runs without approval for anyone opening this project',
            }),
          );
        }
        const perms = agent['tool_permissions'];
        if (typeof perms === 'object' && perms !== null) {
          if ((perms as Record<string, unknown>)['default'] === 'allow') {
            const line = lineOf('"default"');
            findings.push(
              finding(this, {
                severity: 'high',
                target: file,
                file,
                ...(line > 0 ? { line } : {}),
                message: 'Zed project settings set agent.tool_permissions.default to "allow" — tool actions without a matching deny/confirm rule run unapproved for anyone opening this project',
              }),
            );
          }
          const tools = (perms as { tools?: Record<string, unknown> }).tools;
          if (typeof tools === 'object' && tools !== null) {
            for (const [name, cfg] of Object.entries(tools)) {
              if (typeof cfg !== 'object' || cfg === null) continue;
              if ((cfg as Record<string, unknown>)['default'] !== 'allow') continue;
              const mcpTool = name.startsWith('mcp:') ? name.split(':')[2] : undefined;
              const severity = ZED_HIGH_RISK_TOOLS.has(name)
                ? 'high'
                : ZED_MEDIUM_RISK_TOOLS.has(name) || (mcpTool && DANGEROUS_TOOL_NAME.test(mcpTool))
                  ? 'medium'
                  : undefined;
              if (!severity) continue;
              const line = lineOf(`"${name}"`);
              findings.push(
                finding(this, {
                  severity,
                  target: file,
                  file,
                  ...(line > 0 ? { line } : {}),
                  message: `Zed project settings default the "${name}" tool to "allow" — its actions run without approval for anyone opening this project`,
                }),
              );
            }
          }
        }
      }
      return findings;
    }
    if (isGemini) {
      const findings = [];
      const tools = (data as { tools?: { allowed?: unknown } }).tools;
      const allowed = Array.isArray(tools?.allowed) ? tools.allowed : [];
      for (const entry of allowed) {
        if (typeof entry !== 'string') continue;
        const hit = GEMINI_RISKY_TOOLS.find((r) => r.re.test(entry));
        if (hit) {
          const line = content.split(/\r?\n/).findIndex((l) => l.includes(`"${entry}"`)) + 1;
          findings.push(
            finding(this, {
              severity: hit.severity,
              target: file,
              file,
              ...(line > 0 ? { line } : {}),
              message: `Gemini CLI settings pre-approve "${entry}" via tools.allowed — ${hit.risk} without a confirmation dialog; scope the grant (e.g. run_shell_command(git)) or remove it`,
            }),
          );
        }
      }
      const servers = (data as { mcpServers?: unknown }).mcpServers;
      if (typeof servers === 'object' && servers !== null) {
        for (const [name, server] of Object.entries(servers)) {
          if (typeof server === 'object' && server !== null && (server as { trust?: unknown }).trust === true) {
            const line = content.split(/\r?\n/).findIndex((l) => l.includes(`"${name}"`)) + 1;
            findings.push(
              finding(this, {
                severity: 'medium',
                target: file,
                file,
                ...(line > 0 ? { line } : {}),
                message: `Gemini CLI settings mark MCP server "${name}" as trusted — all its tool calls bypass confirmation for anyone opening this project`,
              }),
            );
          }
        }
      }
      const general = (data as { general?: { defaultApprovalMode?: unknown } }).general;
      if (general?.defaultApprovalMode === 'auto_edit') {
        const line = content.split(/\r?\n/).findIndex((l) => l.includes('auto_edit')) + 1;
        findings.push(
          finding(this, {
            severity: 'medium',
            target: file,
            file,
            ...(line > 0 ? { line } : {}),
            message: 'Gemini CLI settings set general.defaultApprovalMode to "auto_edit" — edit tools run without approval for anyone opening this project',
          }),
        );
      }
      return findings;
    }
    if (isOpencode) {
      const findings = [];
      for (const { scope, permission } of opencodePermissionBlocks(data)) {
        if (opencodeAllowsAll(permission)) {
          const line = content.split(/\r?\n/).findIndex((l) => l.includes('"permission"')) + 1;
          findings.push(
            finding(this, {
              severity: 'high',
              target: file,
              file,
              ...(line > 0 ? { line } : {}),
              message: `OpenCode config sets a catch-all "allow" ${scope} — every tool (including shell) runs without prompts for anyone opening this project`,
            }),
          );
        } else if (typeof permission === 'object' && permission !== null) {
          for (const { key, severity, risk } of OPENCODE_RISKY_KEYS) {
            if (opencodeAllowsAll((permission as Record<string, unknown>)[key])) {
              const line = content.split(/\r?\n/).findIndex((l) => l.includes(`"${key}"`)) + 1;
              findings.push(
                finding(this, {
                  severity,
                  target: file,
                  file,
                  ...(line > 0 ? { line } : {}),
                  message: `OpenCode config sets ${scope}.${key} to "allow" — ${risk} without a permission prompt; use granular rules (e.g. "git *": "allow") or "ask"`,
                }),
              );
            }
          }
        }
      }
      return findings;
    }
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
    if ((data as { enableAllProjectMcpServers?: unknown }).enableAllProjectMcpServers === true) {
      const line = content.split(/\r?\n/).findIndex((l) => l.includes('enableAllProjectMcpServers')) + 1;
      findings.push(
        finding(this, {
          severity: 'medium',
          target: file,
          file,
          ...(line > 0 ? { line } : {}),
          message: 'Claude Code settings enable enableAllProjectMcpServers — every MCP server in project .mcp.json files is auto-approved without review',
        }),
      );
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
  // A read verb is required so guard hooks that merely pattern-match credential paths stay clean.
  {
    re: /(^|[\s;|&])(cat|grep|head|tail|cp|scp|base64|openssl|dd|less|more|curl|wget|type|Get-Content)\b[^\n]*(~\/\.ssh\b|id_rsa|id_ed25519|\.aws\/credentials|\.npmrc\b|\.netrc\b)/i,
    severity: 'high',
    risk: 'reads credential material into the prompt at skill load time',
  },
  { re: /(^|[\s;|&])(cat|grep|head|tail|cp|base64)\b[^\n]*\.env\b/, severity: 'high', risk: 'reads .env secrets into the prompt at skill load time' },
];

/** Collect `type: "command"` hook commands from a Claude Code settings `hooks` object. */
export function extractHookCommands(hooks: unknown): string[] {
  if (typeof hooks !== 'object' || hooks === null) return [];
  const out: string[] = [];
  for (const matchers of Object.values(hooks)) {
    if (!Array.isArray(matchers)) continue;
    for (const matcher of matchers) {
      const inner = (matcher as { hooks?: unknown })?.hooks;
      if (!Array.isArray(inner)) continue;
      for (const hook of inner) {
        const h = hook as { type?: unknown; command?: unknown };
        if (h?.type === 'command' && typeof h.command === 'string') out.push(h.command);
      }
    }
  }
  return out;
}

/** Amazon Q CLI agent files, whose `hooks` field runs commands at lifecycle trigger points. */
const AMAZONQ_AGENT_HOOKS_FILE = /(^|\/)\.amazonq\/cli-agents\/[^/]+\.json$/i;

/** Collect commands from an Amazon Q agent `hooks` field ({ trigger: [{ command }] }). */
export function extractAmazonqHookCommands(hooks: unknown): string[] {
  if (typeof hooks !== 'object' || hooks === null) return [];
  const out: string[] = [];
  for (const entries of Object.values(hooks)) {
    if (!Array.isArray(entries)) continue;
    for (const entry of entries) {
      const command = (entry as { command?: unknown })?.command;
      if (typeof command === 'string') out.push(command);
    }
  }
  return out;
}

/** Kiro project hook files (`.kiro/hooks/*.json`) whose command actions run automatically on session events. */
const KIRO_HOOK_FILE = /(^|\/)\.kiro\/hooks\/.+\.json$/i;

/** Collect `action.type: "command"` commands from a Kiro hook file's `hooks` array. */
export function extractKiroHookCommands(hooks: unknown): string[] {
  if (!Array.isArray(hooks)) return [];
  const out: string[] = [];
  for (const hook of hooks) {
    const action = (hook as { action?: { type?: unknown; command?: unknown } })?.action;
    // Documented action type is "command"; some in-the-wild hooks use "shell".
    if ((action?.type === 'command' || action?.type === 'shell') && typeof action.command === 'string') out.push(action.command);
  }
  return out;
}

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
  checkSource(file, content) {
    const isKiroHook = KIRO_HOOK_FILE.test(file);
    const isAmazonqAgent = AMAZONQ_AGENT_HOOKS_FILE.test(file);
    if (!CLAUDE_SETTINGS_FILE.test(file) && !isKiroHook && !isAmazonqAgent) return [];
    const data = parseJsonc(content);
    if (typeof data !== 'object' || data === null) return [];
    const findings = [];
    if (isKiroHook) {
      // v1 schema wraps hooks in a `hooks` array; some in-the-wild files put a single hook at the root.
      const hookList = (data as { hooks?: unknown }).hooks ?? [data];
      for (const command of extractKiroHookCommands(hookList)) {
        const hit = RISKY_COMMANDS.find((r) => r.re.test(command));
        if (!hit) continue;
        const line = content.split(/\r?\n/).findIndex((l) => l.includes(command.slice(0, 40))) + 1;
        findings.push(
          finding(this, {
            severity: hit.severity,
            target: file,
            file,
            ...(line > 0 ? { line } : {}),
            message: `Kiro hook command ${hit.risk.replace('at skill load time', 'automatically on session events')}: "${command.slice(0, 80)}"`,
          }),
        );
      }
      return findings;
    }
    if (isAmazonqAgent) {
      for (const command of extractAmazonqHookCommands((data as { hooks?: unknown }).hooks)) {
        const hit = RISKY_COMMANDS.find((r) => r.re.test(command));
        if (!hit) continue;
        const line = content.split(/\r?\n/).findIndex((l) => l.includes(command.slice(0, 40))) + 1;
        findings.push(
          finding(this, {
            severity: hit.severity,
            target: file,
            file,
            ...(line > 0 ? { line } : {}),
            message: `Amazon Q agent hook command ${hit.risk.replace('at skill load time', 'automatically on agent lifecycle events')}: "${command.slice(0, 80)}"`,
          }),
        );
      }
      return findings;
    }
    for (const command of extractHookCommands((data as { hooks?: unknown }).hooks)) {
      const hit = RISKY_COMMANDS.find((r) => r.re.test(command));
      if (hit) {
        const line = content.split(/\r?\n/).findIndex((l) => l.includes(command.slice(0, 40))) + 1;
        findings.push(
          finding(this, {
            severity: hit.severity,
            target: file,
            file,
            ...(line > 0 ? { line } : {}),
            message: `Claude Code hook command ${hit.risk.replace('at skill load time', 'automatically on session events')}: "${command.slice(0, 80)}"`,
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
