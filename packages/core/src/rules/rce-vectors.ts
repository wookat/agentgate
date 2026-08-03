import { Rule, finding, toolText } from './rule.js';

const SHELL_INTERPRETERS = ['sh', 'bash', 'zsh', 'cmd', 'cmd.exe', 'powershell', 'powershell.exe'];
const REMOTE_EXEC_RE = /\b(curl|wget)\b[^|;&]*\|\s*(sh|bash|node|python)\b/;
const EVAL_RE = /\b(eval|exec)\s*\(|new\s+Function\s*\(|child_process|execSync|spawnSync\s*\(\s*['"`](sh|bash)/;

const EXEC_TOOL_RE = /\b(execute|run|eval)\b[^.]{0,40}\b(shell|command|script|code|python|javascript|sql)\b|\bshell[-_ ]?(command|exec)\b/i;

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
  checkSource(file, content) {
    const findings = [];
    if (REMOTE_EXEC_RE.test(content)) {
      const m = content.match(REMOTE_EXEC_RE)!;
      findings.push(
        finding(this, {
          severity: 'critical',
          target: file,
          file,
          line: content.slice(0, m.index ?? 0).split('\n').length,
          message: 'Source pipes a remote download into an interpreter (curl|sh pattern)',
        }),
      );
    }
    if (EVAL_RE.test(content)) {
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
