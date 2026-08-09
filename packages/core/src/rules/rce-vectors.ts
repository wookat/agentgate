import { Rule, finding, snippet, toolText, verbAlt } from './rule.js';
import { COPILOT_EXTENSION_FILE, DEDICATED_COMMAND_SURFACE_FILE, parseGooseRecipeDoc } from './skill-poisoning.js';

export { COPILOT_EXTENSION_FILE };

const SHELL_INTERPRETERS = ['sh', 'bash', 'zsh', 'cmd', 'cmd.exe', 'powershell', 'powershell.exe'];
// The span may only cross a newline via a backslash continuation, so a pipe in a
// later, unrelated statement is not attributed to the download command.
// `| node -e '…'` / `| python -c '…'` / `| python -m json.tool` runs a *local*
// inline program or module with the download on stdin as data (version-lookup
// and pretty-print idioms), so an inline-program/module flag right after the
// interpreter is excluded; a bare `| bash -` still matches.
const REMOTE_EXEC_RE = /\b(curl|wget)\b(?:[^|;&\n]|\\\n)*\|\s*(sh|bash|node|python)\b(?!\s+-{1,2}(?:e|c|m|eval)\b)/;
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

/**
 * Core commands an agent's Bash tool routinely runs. A plugin bin/ entry with
 * one of these names shadows the system command for every Bash call while the
 * plugin is enabled — the classic PATH-hijack move; legitimate plugin tools
 * use their own names.
 */
const SHADOWED_COMMAND_NAMES = new Set([
  'sh',
  'bash',
  'zsh',
  'git',
  'ls',
  'cat',
  'cp',
  'mv',
  'rm',
  'grep',
  'sed',
  'awk',
  'find',
  'curl',
  'wget',
  'node',
  'npm',
  'npx',
  'pnpm',
  'yarn',
  'bun',
  'deno',
  'python',
  'python3',
  'pip',
  'pip3',
  'uv',
  'uvx',
  'pipx',
  'go',
  'cargo',
  'make',
  'docker',
  'kubectl',
  'gh',
  'ssh',
  'sudo',
]);

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
 * them. Unquoted heredocs are also masked when they are pure data: no command
 * substitution in the body and the heredoc line does not pipe into an
 * interpreter (a `cat <<USAGE` help banner expands variables but still only
 * prints; `sh <<EOF` / `<<EOF | bash` bodies stay live).
 */
function maskQuotedHeredocs(content: string): string {
  return content
    .replace(/<<-?\s*(['"])(\w+)\1[^\n]*\n([\s\S]*?)\n\s*\2(\n|$)/g, (whole, _q: string, _tag: string, body: string) => whole.replace(body, body.replace(/[^\n]/g, ' ')))
    .replace(/(^|\n)([^\n]*<<-?\s*(\w+)[^\n]*)\n([\s\S]*?)\n\s*\3(\n|$)/g, (whole, _pre: string, startLine: string, _tag: string, body: string) => {
      if (/\$\(|`/.test(body)) return whole;
      // A body opening with a shebang, or a heredoc redirected into a file
      // (`cat > script.sh <<EOF`), is a rendered script — stays live.
      if (/^\s*#!/.test(body)) return whole;
      const rest = startLine.replace(/<<-?\s*\w+/, '');
      if (/>/.test(rest) || /\b(sh|bash|zsh|dash|ksh|python\d*|node|perl|ruby|eval|source|exec)\b/.test(rest)) return whole;
      return whole.replace(body, body.replace(/[^\n]/g, ' '));
    });
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

/**
 * Mask quoted string literals that are not fed to an interpreter — a curl|sh
 * span whose pipe sits inside quotes is data (a commit message, a test-case
 * label, a log line), not a pipeline. Strings that follow `sh|bash -c`,
 * `python|node -c/-e`, `eval`/`source`/`exec`, `ssh host`, that contain
 * command substitution, or whose content starts with the downloader itself
 * (`run 'curl ... | bash'` wrapper idiom) stay live: those quotes do execute.
 */
function maskInertQuotedStrings(content: string): string {
  return content.replace(/'[^'\n]*'|"(?:[^"$`\n]|\$[^(`\n])*"/g, (str: string, offset: number) => {
    const before = content.slice(Math.max(0, offset - 80), offset);
    if (/\b(sh|bash|zsh|dash|ksh|python\d*|node|perl|ruby)(\s+-\w+)*\s+-[ce]\s*$|\b(eval|source|exec)\s*$|\bssh\s+\S+\s*$|\$\(\s*$/.test(before)) return str;
    if (/^\s*(sudo\s+)?(curl|wget)\b/.test(str.slice(1, -1))) return str;
    return str[0]! + str.slice(1, -1).replace(/[^\n]/g, ' ') + str[str.length - 1]!;
  });
}

/**
 * Mask multi-line quoted strings that clearly open as data: a variable
 * assignment (`MSG='…'`) or the argument of a plain command at the start of a
 * line (`error "…"`, `fail "…"`). Shell treats them as text — installers put
 * their own curl|sh one-liner in multi-line error messages, test suites embed
 * payload blocks in assignments. Anchoring the opener to the line start keeps
 * quote pairing sane (a `)"` closing a command substitution mid-line cannot
 * open a bogus string), interpreters/eval/ssh openers stay live, and bodies
 * with command substitution or a leading downloader stay live.
 */
function maskMultilineDataStrings(content: string): string {
  const LIVE_WORD = /^(sh|bash|zsh|dash|ksh|python\d*|node|perl|ruby|eval|source|exec|ssh|sudo|xargs)$/i;
  return content.replace(
    /(^|\n)([ \t]*)(\w[\w-]*)(=[ \t]*|[ \t]+(?:-\w+[ \t]+)*)('[^']*\n[^']*'|"(?:[^"$`]|\$[^(`])*\n(?:[^"$`]|\$[^(`])*")/g,
    (whole, _nl: string, _indent: string, word: string, sep: string, str: string) => {
      if (!sep.startsWith('=') && LIVE_WORD.test(word)) return whole;
      if (/^\s*(sudo\s+)?(curl|wget)\b/.test(str.slice(1, -1))) return whole;
      return whole.replace(str, str[0]! + str.slice(1, -1).replace(/[^\n]/g, ' ') + str[str.length - 1]!);
    },
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
        const key = /^\s*-?\s*["']?([\w-]+)["']?\s*:/.exec(lines[i]!);
        // `matches:`/`not_matches:` under a detection-rule/policy yaml are
        // pattern tables the rule engine tests against, never commands it runs.
        if (key) return /\b(den(y|ied|ylist)|block(ed)?(list)?|disallow(ed)?|forbid(den)?)\b|denied|blocklist|blacklist|^(not[_-]?)?matches$/i.test(key[1]!);
      }
      return false;
    }
    const findings = [];
    if (PLUGIN_BIN_EXEC_FILE.test(file)) {
      const name = file.split('/').pop()!;
      if (SHADOWED_COMMAND_NAMES.has(name.toLowerCase())) {
        findings.push(
          finding(this, {
            severity: 'high',
            target: file,
            file,
            message: `Plugin bin/ file "${name}" shadows the system "${name}" command on the Bash tool PATH while the plugin is enabled — every agent call to "${name}" runs this file instead`,
          }),
        );
      }
    }
    const isShellScript = /\.(sh|bash|zsh)$/i.test(file) || (PLUGIN_BIN_EXEC_FILE.test(file) && /^#!.*\b(sh|bash|zsh)\b/.test(rawContent));
    // echo/printf string literals are print-only in any file that embeds shell
    // commands (a pre-commit yaml `entry: bash -c "... || echo 'install: curl … | bash'"`
    // prints the hint exactly like an installer script does).
    const masked = maskEchoedStrings(maskQuotedHeredocs(rawContent));
    const content = isShellScript ? maskInertQuotedStrings(maskMultilineDataStrings(masked)) : masked;
    // Cursor hook/environment configs are named AG-SK-003 surfaces whose command
    // strings run through the risky-command classifier; the generic text warning
    // here would only duplicate that (more accurate) finding.
    if (REMOTE_EXEC_RE.test(content) && !DEDICATED_COMMAND_SURFACE_FILE.test(file)) {
      // A `#`-comment line in a shell/config script never executes — installer
      // scripts routinely quote their own curl|sh one-liner in a usage comment.
      // Prefer a live match over a commented one so a comment can't mask it.
      const isCommented = (idx: number) => /^\s*#/.test((content.slice(0, idx).split('\n').pop() ?? '') + (content.slice(idx).split('\n')[0] ?? ''));
      const all = [...content.matchAll(new RegExp(REMOTE_EXEC_RE.source, `${REMOTE_EXEC_RE.flags.replace('g', '')}g`))];
      const isDataFormat = /\.(ya?ml|toml|json)$/i.test(file);
      const m =
        all.find((c) => !isCommented(c.index ?? 0) && !(isDataFormat && isDenyListEntry(content, c.index ?? 0))) ??
        all.find((c) => !isCommented(c.index ?? 0)) ??
        all[0]!;
      // A goose-recipe-shaped YAML/JSON file carries prompt text, not commands a
      // runner executes — a curl|sh string in its instructions is prose (the
      // AG-SK rules cover the prompt surface), not a launch vector.
      const isRecipeProse = /\.(ya?ml|json)$/i.test(file) && parseGooseRecipeDoc(file, rawContent) !== undefined;
      // A yaml/toml file is "executable" only by extension heuristic; under a
      // test/fixture path it is checked-in test data, not a pipeline anything runs.
      const dataFormatFixture = /\.(ya?ml|toml)$/i.test(file) && /(^|\/)(tests?|testing|testdata|__tests__|fixtures|mocks?)\//i.test(file);
      // A curl|sh string under a deny/block key of a yaml/toml/json file is a
      // defensive control list (a skill's `blacklist:` of forbidden commands),
      // not a pipeline anything runs.
      const dataFormatDenyList = isDataFormat && isDenyListEntry(content, m.index ?? 0);
      // A curl|sh string in the value of an example-marked key (a linter KB's
      // `bad_example:` payload, a threat DB's `examples:` list of quoted idioms)
      // is documentation of the pattern, not a pipeline.
      const matchLineStart = content.lastIndexOf('\n', (m.index ?? 0) - 1) + 1;
      const enclosingExampleKey = (() => {
        const lines = content.slice(0, matchLineStart).split('\n').filter((l) => l.trim() !== '');
        for (let i = lines.length - 1, seen = 0; i >= 0 && seen < 10; i--, seen++) {
          const key = /^\s*-?\s*["']?([\w-]+)["']?\s*:/.exec(lines[i]!);
          if (key) return /(\b|[_-])examples?$/i.test(key[1]!);
          if (!/^\s*-\s/.test(lines[i]!)) return false;
        }
        return false;
      })();
      const exampleMarked = /(\b|"|[_-])examples?"?\s*[:=]/i.test(content.slice(matchLineStart, m.index ?? 0)) || (isDataFormat && enclosingExampleKey);
      const executable =
        (isExecutableFile(file) || STARTUP_PLUGIN_FILE.test(file) || COPILOT_EXTENSION_FILE.test(file) || PLUGIN_BIN_EXEC_FILE.test(file)) &&
        !isRecipeProse &&
        !isCommented(m.index ?? 0) &&
        !dataFormatFixture &&
        !dataFormatDenyList &&
        !(isDataFormat && exampleMarked);
      // A curl|sh string listed under a deny/block key (e.g. a `deniedCommands`
      // array) is a defensive control, not an execution vector.
      const denyListed = !executable && (dataFormatDenyList || isDenyListEntry(content, m.index ?? 0));
      // The only remaining match sits on a `#`-comment line of an otherwise
      // executable script — an installer quoting its own one-liner, never run.
      const commentOnly =
        !executable &&
        isCommented(m.index ?? 0) &&
        (isExecutableFile(file) || STARTUP_PLUGIN_FILE.test(file) || COPILOT_EXTENSION_FILE.test(file) || PLUGIN_BIN_EXEC_FILE.test(file));
      // Test suites quote curl|sh strings as fixtures (a hook handler's
      // deny-test, sandbox-security specs, testdata payloads) — nothing there
      // executes; still reported, but quietly.
      const testFixture =
        !executable &&
        (/(^|\/)(tests?|testing|testdata|__tests__|fixtures|mocks?)\//i.test(file) || /\.(test|spec)\.\w+$/i.test(file) || /(^|\/)test_[^/]+$|_test\.\w+$/i.test(file));
      const exampleValue = !executable && exampleMarked;
      findings.push(
        finding(this, {
          severity: executable ? 'critical' : denyListed || testFixture || commentOnly || exampleValue ? 'low' : 'medium',
          target: file,
          file,
          line: content.slice(0, m.index ?? 0).split('\n').length,
          message: executable
            ? 'Source pipes a remote download into an interpreter (curl|sh pattern)'
            : denyListed
              ? 'Text contains a curl|sh pattern under a deny/block list key — likely a defensive control; confirm it blocks rather than runs'
              : commentOnly
                ? 'Comment mentions a curl|sh pattern — a commented line never executes; usually the script quoting its own install one-liner'
                : testFixture
                  ? 'Text contains a curl|sh pattern — in a test/fixture path, likely a quoted test payload; confirm it is never executed'
                  : exampleValue
                    ? 'Text contains a curl|sh pattern in the value of an example-marked key — likely documentation of the pattern; confirm it is never executed'
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
            ? `${startupSurfaceLabel(file)} uses a dynamic code-execution primitive ("${snippet(m[0], 40)}") — review what it runs`
            : `Source uses a dynamic code-execution primitive ("${snippet(m[0], 40)}") — review how inputs reach it`,
        }),
      );
    }
    return findings;
  },
};
