import { Rule, finding, toolText, verbAlt } from './rule.js';
import { COPILOT_EXTENSION_FILE, DEDICATED_COMMAND_SURFACE_FILE, parseGooseRecipeDoc } from './skill-poisoning.js';

export { COPILOT_EXTENSION_FILE };

const SHELL_INTERPRETERS = ['sh', 'bash', 'zsh', 'cmd', 'cmd.exe', 'powershell', 'powershell.exe'];
// The span may only cross a newline via a backslash continuation, so a pipe in a
// later, unrelated statement is not attributed to the download command.
const REMOTE_EXEC_RE = /\b(curl|wget)\b(?:[^|;&\n]|\\\n)*\|\s*(sh|bash|node|python)\b/;
/**
 * Dynamic code-execution primitives. `exec(` must not be preceded by a dot or word
 * char, otherwise every `regex.exec(input)` in a codebase is reported; a bare
 * `child_process` import is likewise only interesting next to an actual exec/spawn call.
 */
const EVAL_RE =
  /(^|[^.\w])(eval|exec)\s*\(|new\s+Function\s*\(|\bexecSync\s*\(|\bspawnSync\s*\(\s*['"`](sh|bash)|\bchild_process\b[\s\S]{0,400}?\b(exec|execFile|spawn)(Sync)?\s*\(/;

const EXEC_TOOL_RE = new RegExp(
  `\\b${verbAlt(['execute', 'run', 'eval', 'invoke'])}\\b[^.]{0,40}\\b(shell|command|commands|script|scripts|code|python|javascript|sql)\\b|\\bshell[-_ ]?(command|exec)\\b`,
  'i',
);

/**
 * Dynamic-exec primitives matter to an MCP scanner where model-controlled input
 * can reach them — i.e. in files that are part of an MCP server. In an arbitrary
 * codebase they are ordinary engineering, and reporting each one buries the
 * findings that matter.
 */
const MCP_MARKER_RE = /modelcontextprotocol|fastmcp|\bmcp[._-]?server\b|\bMcpServer\b|mcpServers/i;

/**
 * OpenCode auto-discovers `.opencode/{plugin,plugins}/*.{ts,js}` (Kilo CLI,
 * an OpenCode fork, does the same under `.kilo`/`.kilocode`) and Cline
 * auto-loads project plugins under `.cline/plugins/` — all execute at
 * startup, so dynamic-exec primitives there run on repo open, MCP markers or
 * not.
 */
const STARTUP_PLUGIN_FILE = /(^|\/)\.(opencode|kilo(code)?)\/(plugin|plugins)\/[^/]+\.(ts|js)$|(^|\/)\.cline\/plugins\/.+\.(ts|js)$/i;

/**
 * Extensionless executables under a plugin `bin/` are added to the Bash
 * tool's PATH and invokable as bare commands while the plugin is enabled.
 * Only manifest-gated plugin bin files reach source scanning without an
 * extension, so this pattern cannot fire on generic repo `bin/` trees.
 */
const PLUGIN_BIN_EXEC_FILE = /(^|\/)bin\/[^/.]+$/;

/** Surface label + execution context for a plugin/extension path, for finding messages. */
function startupSurfaceLabel(file: string): string {
  if (COPILOT_EXTENSION_FILE.test(file)) return 'Copilot CLI extension (auto-executed at startup)';
  if (PLUGIN_BIN_EXEC_FILE.test(file)) return 'Plugin bin/ executable (on the Bash tool PATH while the plugin is enabled)';
  if (/(^|\/)\.cline\//i.test(file)) return 'Cline plugin (auto-executed at startup)';
  return /(^|\/)\.kilo(code)?\//i.test(file) ? 'Kilo CLI plugin (auto-executed at startup)' : 'OpenCode plugin (auto-executed at startup)';
}

/** Files whose contents are actually executed, where a curl|sh string is a real launch vector. */
function isExecutableFile(file: string): boolean {
  return /(\.(sh|bash|zsh|bat|cmd|ps1|ya?ml|toml)|Dockerfile[\w.-]*|Makefile|package\.json)$/i.test(file) || /(^|\/)\.?crushrc$/i.test(file);
}

/**
 * Mask quoted-heredoc bodies (`<<'EOF' … EOF`) in shell scripts — the shell
 * treats them as literal text (usage banners, embedded docs), never executes
 * them.
 */
function maskQuotedHeredocs(content: string): string {
  return content.replace(/<<-?\s*(['"])(\w+)\1[^\n]*\n([\s\S]*?)\n\s*\2(\n|$)/g, (whole, _q: string, _tag: string, body: string) => whole.replace(body, body.replace(/[^\n]/g, ' ')));
}

/**
 * Mask string literals passed to echo/printf — the shell prints them, never
 * executes them (installer scripts echo their own curl|sh one-liner in help
 * text). A `$(`/backtick inside double quotes still executes, so those
 * strings are left live.
 */
function maskEchoedStrings(content: string): string {
  return content.replace(
    /\b(echo|printf)\s+(-\w+\s+)*((?:'[^']*'|"(?:[^"$`]|\$[^(])*")(\s+(?:'[^']*'|"(?:[^"$`]|\$[^(])*"))*)/g,
    (whole, _cmd: string, _flags: string, strings: string) => whole.replace(strings, strings.replace(/[^\n]/g, ' ')),
  );
}

export const rceVectorsRule: Rule = {
  id: 'AG-RC-001',
  category: 'rce-vectors',
  description: 'Detects remote-code-execution vectors: shell-wrapped servers, curl|sh launches, arbitrary code-execution tools',
  checkServer(server) {
    const findings = [];
    const command = (server.command ?? '').toLowerCase();
    const args = server.args ?? [];
    const full = [server.command ?? '', ...args].join(' ');
    const base = command.split(/[\\/]/).pop() ?? '';
    if (SHELL_INTERPRETERS.includes(base) && args.some((a) => a === '-c' || a === '/c')) {
      findings.push(
        finding(this, {
          severity: 'medium',
          target: server.name,
          file: server.source,
          message: `Server "${server.name}" is launched through a shell (${base} -c) — inline shell strings are an injection-prone launch vector`,
        }),
      );
    }
    if (REMOTE_EXEC_RE.test(full)) {
      findings.push(
        finding(this, {
          severity: 'critical',
          target: server.name,
          file: server.source,
          message: `Server "${server.name}" pipes a remote download into an interpreter (curl|sh pattern)`,
        }),
      );
    }
    return findings;
  },
  checkTool(tool, serverName) {
    if (!EXEC_TOOL_RE.test(toolText(tool))) return [];
    const sandboxed = /\b(sandbox(ed)?|isolated|container(ized)?|restricted environment|read[- ]only)\b/i.test(tool.description);
    return [
      finding(this, {
        severity: sandboxed ? 'low' : 'high',
        target: `${serverName}/${tool.name}`,
        message: `Tool "${tool.name}" executes arbitrary commands/code${sandboxed ? ' (claims sandboxing — verify)' : ' with no documented sandboxing'}`,
      }),
    ];
  },
  checkSource(file, rawContent) {
    /** True when the match sits inside a string under the nearest enclosing deny/block key (e.g. `"deniedCommands": [...]`). */
    function isDenyListEntry(content: string, idx: number): boolean {
      const lines = content.slice(0, idx).split('\n');
      for (let i = lines.length - 1, seen = 0; i >= 0 && seen < 30; i--, seen++) {
        const key = /["']([^"']+)["']\s*:/.exec(lines[i]!);
        if (key) return /\b(den(y|ied|ylist)|block(ed)?(list)?|disallow(ed)?|forbid(den)?)\b|denied|blocklist|blacklist/i.test(key[1]!);
      }
      return false;
    }
    const findings = [];
    const isShellScript = /\.(sh|bash|zsh)$/i.test(file) || (PLUGIN_BIN_EXEC_FILE.test(file) && /^#!.*\b(sh|bash|zsh)\b/.test(rawContent));
    const content = isShellScript ? maskEchoedStrings(maskQuotedHeredocs(rawContent)) : rawContent;
    // Cursor hook/environment configs are named AG-SK-003 surfaces whose command
    // strings run through the risky-command classifier; the generic text warning
    // here would only duplicate that (more accurate) finding.
    if (REMOTE_EXEC_RE.test(content) && !DEDICATED_COMMAND_SURFACE_FILE.test(file)) {
      // A `#`-comment line in a shell/config script never executes — installer
      // scripts routinely quote their own curl|sh one-liner in a usage comment.
      // Prefer a live match over a commented one so a comment can't mask it.
      const isCommented = (idx: number) => /^\s*#/.test((content.slice(0, idx).split('\n').pop() ?? '') + (content.slice(idx).split('\n')[0] ?? ''));
      const all = [...content.matchAll(new RegExp(REMOTE_EXEC_RE.source, `${REMOTE_EXEC_RE.flags.replace('g', '')}g`))];
      const m = all.find((c) => !isCommented(c.index ?? 0)) ?? all[0]!;
      // A goose-recipe-shaped YAML/JSON file carries prompt text, not commands a
      // runner executes — a curl|sh string in its instructions is prose (the
      // AG-SK rules cover the prompt surface), not a launch vector.
      const isRecipeProse = /\.(ya?ml|json)$/i.test(file) && parseGooseRecipeDoc(file, rawContent) !== undefined;
      const executable =
        (isExecutableFile(file) || STARTUP_PLUGIN_FILE.test(file) || COPILOT_EXTENSION_FILE.test(file) || PLUGIN_BIN_EXEC_FILE.test(file)) && !isRecipeProse && !isCommented(m.index ?? 0);
      // A curl|sh string listed under a deny/block key (e.g. a `deniedCommands`
      // array) is a defensive control, not an execution vector.
      const denyListed = !executable && isDenyListEntry(content, m.index ?? 0);
      findings.push(
        finding(this, {
          severity: executable ? 'critical' : denyListed ? 'low' : 'medium',
          target: file,
          file,
          line: content.slice(0, m.index ?? 0).split('\n').length,
          message: executable
            ? 'Source pipes a remote download into an interpreter (curl|sh pattern)'
            : denyListed
              ? 'Text contains a curl|sh pattern under a deny/block list key — likely a defensive control; confirm it blocks rather than runs'
              : 'Text contains a curl|sh pattern — in a non-executable file this is usually documentation or a prompt; confirm it is never executed',
        }),
      );
    }
    if (EVAL_RE.test(content) && (MCP_MARKER_RE.test(content) || STARTUP_PLUGIN_FILE.test(file) || COPILOT_EXTENSION_FILE.test(file) || PLUGIN_BIN_EXEC_FILE.test(file))) {
      const m = content.match(EVAL_RE)!;
      const startupPlugin = STARTUP_PLUGIN_FILE.test(file) || COPILOT_EXTENSION_FILE.test(file) || PLUGIN_BIN_EXEC_FILE.test(file);
      findings.push(
        finding(this, {
          severity: 'medium',
          target: file,
          file,
          line: content.slice(0, m.index ?? 0).split('\n').length,
          message: startupPlugin
            ? `${startupSurfaceLabel(file)} uses a dynamic code-execution primitive ("${m[0].trim().slice(0, 40)}") — review what it runs`
            : `Source uses a dynamic code-execution primitive ("${m[0].trim().slice(0, 40)}") — review how inputs reach it`,
        }),
      );
    }
    return findings;
  },
};
