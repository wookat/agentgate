import { Rule, finding, toolText, verbAlt } from './rule.js';
import { Finding, McpServerConfig, ToolSurface } from '../types.js';

type Capability = 'read-files' | 'write-files' | 'exec' | 'network' | 'send-messages';

const CAPABILITY_PATTERNS: { cap: Capability; re: RegExp }[] = [
  {
    cap: 'read-files',
    re: new RegExp(`\\b${verbAlt(['read', 'cat', 'open', 'load', 'view'])}\\b[^.]{0,40}\\b(file|files|directory|directories|folder|folders|path|paths)\\b|\\bread[-_]?file\\b`, 'i'),
  },
  {
    cap: 'write-files',
    re: new RegExp(
      `\\b${verbAlt(['write', 'save', 'create', 'modify', 'edit', 'delete', 'remove'])}\\b[^.]{0,40}\\b(file|files|directory|directories|folder|folders)\\b|\\bwrite[-_]?file\\b`,
      'i',
    ),
  },
  {
    cap: 'exec',
    re: new RegExp(
      `\\b${verbAlt(['execute', 'run', 'spawn', 'launch'])}\\b[^.]{0,40}\\b(command|commands|shell|script|scripts|process|processes|code)\\b|\\bshell[-_ ]?(command|exec)\\b|\\bexec\\b`,
      'i',
    ),
  },
  { cap: 'network', re: new RegExp(`\\b(${verbAlt(['fetch', 'request', 'download', 'crawl', 'browse', 'scrape'])}|http|url)\\b`, 'i') },
  {
    cap: 'send-messages',
    re: new RegExp(`\\b${verbAlt(['send', 'post', 'publish'])}\\b[^.]{0,40}\\b(email|emails|message|messages|slack|webhook|tweet|sms)\\b`, 'i'),
  },
];

const DANGEROUS_COMBOS: { caps: Capability[]; why: string }[] = [
  { caps: ['read-files', 'network'], why: 'can read local files and exfiltrate them over the network' },
  { caps: ['read-files', 'send-messages'], why: 'can read local files and exfiltrate them via messages' },
  { caps: ['exec', 'network'], why: 'can execute commands and reach the network (download-and-run)' },
];

function globToRegExp(glob: string): RegExp {
  return new RegExp(`^${glob.split('*').map((s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('.*')}$`);
}

/**
 * Correlate a server's `includeTools` allowlist against its live tool surface:
 * entries matching no actual tool are stale or typoed, so the scoping the
 * author intended silently doesn't apply (and the skill breaks).
 */
export function checkIncludeToolsCoverage(server: McpServerConfig, tools: ToolSurface[]): Finding[] {
  if (!server.includeTools?.length || tools.length === 0) return [];
  const names = tools.map((t) => t.name);
  const dead = server.includeTools.filter((pattern) => !names.some((n) => globToRegExp(pattern).test(n)));
  if (dead.length === 0) return [];
  return [
    finding(overprivilegedRule, {
      severity: 'low',
      target: server.name,
      file: server.source,
      message: `includeTools entr${dead.length === 1 ? 'y' : 'ies'} ${dead.map((d) => `"${d}"`).join(', ')} on server "${server.name}" match${dead.length === 1 ? 'es' : ''} none of its ${names.length} live tool(s) — stale or typoed allowlist entries scope nothing`,
    }),
  ];
}

export function detectCapabilities(tool: ToolSurface): Capability[] {
  const text = toolText(tool);
  return CAPABILITY_PATTERNS.filter(({ re }) => re.test(text)).map(({ cap }) => cap);
}

const BROAD_FS_ARGS = ['/', '/home', '/Users', '~', 'C:\\', 'C:\\\\'];

export const overprivilegedRule: Rule = {
  id: 'AG-OP-001',
  category: 'overprivileged',
  description: 'Detects dangerous capability combinations across a server tool surface and overly broad filesystem grants',
  checkServer(server) {
    const findings = [];
    const args = server.args ?? [];
    if (/(server-filesystem|mcp-filesystem|filesystem)/i.test([server.command ?? '', ...args].join(' '))) {
      const broad = args.filter((a) => BROAD_FS_ARGS.includes(a.replace(/\/+$/, '') || '/'));
      if (broad.length > 0) {
        findings.push(
          finding(this, {
            severity: 'high',
            target: server.name,
            file: server.source,
            message: `Filesystem server "${server.name}" is granted overly broad root path(s): ${broad.join(', ')} — scope it to the specific directories the agent needs`,
          }),
        );
      }
    }
    if ((server.client === 'skill' || server.client === 'amp-skill') && !server.includeTools?.length) {
      findings.push(
        finding(this, {
          severity: 'low',
          target: server.name,
          file: server.source,
          message: `Skill-declared server "${server.name}" has no includeTools allowlist — the skill exposes the server's full tool surface; list the tools it actually needs`,
        }),
      );
    }
    if (args.includes('--dangerously-skip-permissions') || args.includes('--yolo')) {
      findings.push(
        finding(this, {
          severity: 'high',
          target: server.name,
          file: server.source,
          message: `Server "${server.name}" is launched with a permission-bypass flag`,
        }),
      );
    }
    return findings;
  },
  checkToolset(tools, serverName) {
    const findings = [];
    const capMap = new Map<Capability, string[]>();
    for (const tool of tools) {
      for (const cap of detectCapabilities(tool)) {
        capMap.set(cap, [...(capMap.get(cap) ?? []), tool.name]);
      }
    }
    for (const { caps, why } of DANGEROUS_COMBOS) {
      if (caps.every((c) => capMap.has(c))) {
        const involved = caps.map((c) => `${c}: ${capMap.get(c)!.slice(0, 3).join(', ')}`).join(' | ');
        findings.push(
          finding(this, {
            severity: 'medium',
            target: serverName,
            message: `Server "${serverName}" combines capabilities that ${why} (${involved})`,
          }),
        );
      }
    }
    return findings;
  },
};
