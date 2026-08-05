import { RuleCategory } from './types.js';

const DOCS_BASE = 'https://agentgate.zalize.com/docs';

/** Public documentation URL for a rule, shown alongside findings. */
export function ruleDocUrl(ruleId: string, category: RuleCategory): string {
  if (ruleId.startsWith('AG-DP-')) return `${DOCS_BASE}/cli/deps/`;
  return `${DOCS_BASE}/rules/${category}/`;
}
