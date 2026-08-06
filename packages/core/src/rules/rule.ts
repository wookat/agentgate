import { Finding, McpServerConfig, RuleCategory, ToolSurface } from '../types.js';

export interface Rule {
  id: string;
  category: RuleCategory;
  description: string;
  /** Check a configured MCP server entry (static scan). */
  checkServer?(server: McpServerConfig): Finding[];
  /** Check a tool surface (live scan or lockfile audit). */
  checkTool?(tool: ToolSurface, serverName: string): Finding[];
  /** Check the whole tool surface of one server at once. */
  checkToolset?(tools: ToolSurface[], serverName: string): Finding[];
  /** Check a source file (repo scan). */
  checkSource?(file: string, content: string): Finding[];
  /** Check an agent skill file (SKILL.md; repo scan). */
  checkSkill?(file: string, content: string): Finding[];
  /** Check every configured server's tool surface together (cross-server analysis). */
  checkConfiguration?(surfaces: Record<string, ToolSurface[]>): Finding[];
}

export function finding(rule: Rule, partial: Omit<Finding, 'ruleId' | 'category'>): Finding {
  return { ruleId: rule.id, category: rule.category, ...partial };
}

export function toolText(tool: ToolSurface): string {
  // Drop the "$schema" meta-URL: its "http://json-schema.org/…" value would give
  // every zod/JSON-Schema-generated tool a network capability.
  const schema = JSON.stringify(tool.inputSchema ?? {}, (key, value) => (key === '$schema' ? undefined : value));
  return `${tool.name}\n${tool.description}\n${schema}`;
}

/**
 * Regex fragment matching any of `verbs` in their common English forms
 * ("execute" also matches "executes", "executing", "executed"). Tool
 * descriptions are usually written in third person ("Executes shell commands"),
 * so bare infinitive matching silently misses them.
 */
export function verbAlt(verbs: string[]): string {
  return `(?:${verbs.map(verbForms).join('|')})`;
}

/** Consonant-doubling and irregular verbs that a generic suffix rule gets wrong. */
const IRREGULAR_FORMS: Record<string, string[]> = {
  run: ['runs', 'running', 'ran'],
  get: ['gets', 'getting', 'got'],
  send: ['sends', 'sending', 'sent'],
  write: ['writes', 'writing', 'wrote', 'written'],
  read: ['reads', 'reading'],
  set: ['sets', 'setting'],
};

function verbForms(verb: string): string {
  const extra = IRREGULAR_FORMS[verb] ?? [];
  const generic = verb.endsWith('e')
    ? `${verb}(?:s|d)?|${verb.slice(0, -1)}ing`
    : /(?:ch|sh|s|x|z)$/.test(verb)
      ? `${verb}(?:es|ed|ing)?`
      : `${verb}(?:s|ed|ing)?`;
  return extra.length > 0 ? `${[...extra].join('|')}|${generic}` : generic;
}

