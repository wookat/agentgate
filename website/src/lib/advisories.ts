export interface AdvisoryRange {
  introduced: string;
  fixed?: string;
  last_affected?: string;
}

export interface AdvisoryPackage {
  ecosystem: string;
  name: string;
  ranges: AdvisoryRange[];
  note?: string;
}

export interface Advisory {
  id: string;
  title: string;
  summary: string;
  details?: string;
  type: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  cvss?: { score?: number; vector?: string };
  aliases?: string[];
  cwe?: string[];
  packages: AdvisoryPackage[];
  references: { type: string; url: string }[];
  timeline: { discovered?: string; published: string; fixed?: string; withdrawn?: string };
  credits?: string[];
}

const modules = import.meta.glob<{ default: Advisory }>('../../../advisories/MCPA-*.json', {
  eager: true,
});

export const advisories: Advisory[] = Object.values(modules)
  .map((m) => m.default)
  .sort((a, b) => (a.id < b.id ? 1 : -1));

export function formatRange(r: AdvisoryRange): string {
  if (r.fixed) return `>= ${r.introduced}, < ${r.fixed}`;
  if (r.last_affected) return `>= ${r.introduced}, <= ${r.last_affected}`;
  return `>= ${r.introduced}`;
}

export const severityOrder = ['critical', 'high', 'medium', 'low'] as const;
