import { Rule, finding, toolText, verbAlt } from './rule.js';
import { ToolSurface } from '../types.js';

/**
 * An agent sees every configured server's tools in one namespace, so risk is a
 * property of the whole configuration, not of a single server: a benign notes
 * server plus a benign send-email server is an exfiltration path, and two
 * servers exposing the same tool name let the second one shadow the first.
 */

type Ability = 'private-data' | 'untrusted-input' | 'external-send';

const ABILITY_PATTERNS: { ability: Ability; re: RegExp }[] = [
  {
    ability: 'private-data',
    re: new RegExp(
      `\\b${verbAlt(['read', 'list', 'search', 'query', 'load', 'export'])}\\b[^.]{0,40}\\b(file|files|repo|repository|repositories|note|notes|email|emails|message|messages|database|table|secret|secrets|credential|credentials|calendar|contact|contacts)\\b`,
      'i',
    ),
  },
  {
    ability: 'untrusted-input',
    re: new RegExp(
      `\\b${verbAlt(['fetch', 'browse', 'crawl', 'scrape', 'download', 'open'])}\\b[^.]{0,40}\\b(url|urls|web|website|page|pages|issue|issues|comment|comments|ticket|tickets|feed)\\b|\\b(webhook|rss)\\b`,
      'i',
    ),
  },
  {
    ability: 'external-send',
    re: new RegExp(
      `\\b${verbAlt(['send', 'post', 'publish', 'upload', 'share', 'email'])}\\b[^.]{0,40}\\b(email|emails|message|messages|slack|webhook|tweet|sms|url|endpoint|server|channel|gist|issue)\\b`,
      'i',
    ),
  },
];

function abilitiesOf(tool: ToolSurface): Ability[] {
  const text = toolText(tool);
  return ABILITY_PATTERNS.filter(({ re }) => re.test(text)).map(({ ability }) => ability);
}

const ABILITY_LABEL: Record<Ability, string> = {
  'private-data': 'reads private data',
  'untrusted-input': 'ingests untrusted external content',
  'external-send': 'can send data out',
};

export const toxicFlowRule: Rule = {
  id: 'AG-TF-001',
  category: 'overprivileged',
  description: 'Detects toxic flows across all configured servers (private data + untrusted input + external send)',
  checkConfiguration(surfaces) {
    const holders: Record<Ability, string[]> = { 'private-data': [], 'untrusted-input': [], 'external-send': [] };
    for (const [server, tools] of Object.entries(surfaces)) {
      for (const tool of tools) {
        for (const ability of abilitiesOf(tool)) holders[ability].push(`${server}/${tool.name}`);
      }
    }
    const present = (Object.keys(holders) as Ability[]).filter((a) => holders[a].length > 0);
    if (present.length < 2) return [];
    const exfiltration = holders['private-data'].length > 0 && holders['external-send'].length > 0;
    if (!exfiltration) return [];
    const complete = holders['untrusted-input'].length > 0;
    const detail = present.map((a) => `${ABILITY_LABEL[a]}: ${holders[a].slice(0, 4).join(', ')}`).join('; ');
    return [
      finding(this, {
        severity: complete ? 'high' : 'medium',
        target: Object.keys(surfaces).join(' + '),
        message: complete
          ? 'Configured tools form a complete toxic flow: untrusted content can reach a tool that reads private data and a tool that sends data out'
          : 'Configured tools combine private-data access with an outbound send path (exfiltration flow)',
        detail,
      }),
    ];
  },
};

export const toolShadowingRule: Rule = {
  id: 'AG-XS-001',
  category: 'tool-poisoning',
  description: 'Detects tool-name collisions and cross-server references between configured servers',
  checkConfiguration(surfaces) {
    const findings = [];
    const byName = new Map<string, string[]>();
    for (const [server, tools] of Object.entries(surfaces)) {
      for (const tool of tools) {
        byName.set(tool.name, [...(byName.get(tool.name) ?? []), server]);
      }
    }
    for (const [name, servers] of byName) {
      if (servers.length > 1) {
        findings.push(
          finding(this, {
            severity: 'high',
            target: servers.join(' + '),
            message: `Tool name "${name}" is exposed by ${servers.length} servers (${servers.join(', ')}) — whichever the client resolves last shadows the other`,
          }),
        );
      }
    }
    const serverNames = Object.keys(surfaces);
    for (const [server, tools] of Object.entries(surfaces)) {
      for (const tool of tools) {
        const text = toolText(tool);
        for (const other of serverNames) {
          if (other === server) continue;
          for (const otherTool of surfaces[other] ?? []) {
            if (otherTool.name === tool.name) continue;
            const re = new RegExp(`\\b(?:instead of|rather than|before|after|when)\\b[^.]{0,60}\\b${escapeRe(otherTool.name)}\\b`, 'i');
            if (re.test(text)) {
              findings.push(
                finding(this, {
                  severity: 'critical',
                  target: `${server}/${tool.name}`,
                  message: `Tool "${tool.name}" instructs the agent about another server's tool "${other}/${otherTool.name}" — cross-server hijacking`,
                }),
              );
            }
          }
        }
      }
    }
    return findings;
  },
};

function escapeRe(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
