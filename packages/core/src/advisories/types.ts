import { Severity } from '../types.js';

export interface McpaRange {
  introduced: string;
  fixed?: string;
  last_affected?: string;
}

export interface McpaPackage {
  ecosystem: 'npm' | 'pypi' | 'nuget' | 'other';
  name: string;
  ranges: McpaRange[];
}

/** Bundled subset of an AgentGate MCP advisory (full records live in /advisories). */
export interface McpaAdvisory {
  id: string;
  title: string;
  type: string;
  severity: Severity;
  /** ISO date the advisory was published (YYYY-MM-DD). */
  published?: string;
  packages: McpaPackage[];
}
