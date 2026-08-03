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
}

export function finding(rule: Rule, partial: Omit<Finding, 'ruleId' | 'category'>): Finding {
  return { ruleId: rule.id, category: rule.category, ...partial };
}

export function toolText(tool: ToolSurface): string {
  return `${tool.name}\n${tool.description}\n${JSON.stringify(tool.inputSchema ?? {})}`;
}
