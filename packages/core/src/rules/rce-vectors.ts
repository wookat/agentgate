import { Rule, finding, toolText, verbAlt } from './rule.js';

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

/** Files whose contents are actually executed, where a curl|sh string is a real launch vector. */
function isExecutableFile(file: string): boolean {
  return /(\.(sh|bash|zsh|bat|cmd|ps1|ya?ml|toml)|Dockerfile[\w.-]*|Makefile|package\.json)$/i.test(file);
}

/**
 * Mask quoted-heredoc bodies (`<<'EOF' … EOF`) in shell scripts — the shell
 * treats them as literal text (usage banners, embedded docs), never executes
 * them.
 */
function maskQuotedHeredocs(content: string): string {
  return content.replace(/<<-?\s*(['"])(\w+)\1[^\n]*\n([\s\S]*?)\n\s*\2(\n|$)/g, (whole, _q: string, _tag: string, body: string) => whole.replace(body, body.replace(/[^\n]/g, ' ')));
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
    const findings = [];
    const content = /\.(sh|bash|zsh)$/i.test(file) ? maskQuotedHeredocs(rawContent) : rawContent;
    if (REMOTE_EXEC_RE.test(content)) {
      // A `#`-comment line in a shell/config script never executes — installer
      // scripts routinely quote their own curl|sh one-liner in a usage comment.
      // Prefer a live match over a commented one so a comment can't mask it.
      const isCommented = (idx: number) => /^\s*#/.test((content.slice(0, idx).split('\n').pop() ?? '') + (content.slice(idx).split('\n')[0] ?? ''));
      const all = [...content.matchAll(new RegExp(REMOTE_EXEC_RE.source, `${REMOTE_EXEC_RE.flags.replace('g', '')}g`))];
      const m = all.find((c) => !isCommented(c.index ?? 0)) ?? all[0]!;
      const executable = isExecutableFile(file) && !isCommented(m.index ?? 0);
      findings.push(
        finding(this, {
          severity: executable ? 'critical' : 'medium',
          target: file,
          file,
          line: content.slice(0, m.index ?? 0).split('\n').length,
          message: executable
            ? 'Source pipes a remote download into an interpreter (curl|sh pattern)'
            : 'Text contains a curl|sh pattern — in a non-executable file this is usually documentation or a prompt; confirm it is never executed',
        }),
      );
    }
    if (EVAL_RE.test(content) && MCP_MARKER_RE.test(content)) {
      const m = content.match(EVAL_RE)!;
      findings.push(
        finding(this, {
          severity: 'medium',
          target: file,
          file,
          line: content.slice(0, m.index ?? 0).split('\n').length,
          message: `Source uses a dynamic code-execution primitive ("${m[0].trim().slice(0, 40)}") — review how inputs reach it`,
        }),
      );
    }
    return findings;
  },
};
