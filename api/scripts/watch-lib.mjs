// Pure filtering/report logic for the advisory-watch sweep, kept free of
// filesystem and network access so it can be unit-tested deterministically.

export function buildContext({ advisories, ignoreList }) {
  const knownAliases = new Set(advisories.flatMap((a) => a.aliases ?? []));
  const ignoredIds = new Set(ignoreList.ids ?? []);
  const ignoredPkgs = new Set(ignoreList.packages ?? []);
  const trackedPackages = [
    ...new Map(
      advisories
        .flatMap((a) => a.packages ?? [])
        .map((p) => [`${p.ecosystem}:${p.name}`, { ecosystem: p.ecosystem, name: p.name }]),
    ).values(),
  ].filter((p) => p.ecosystem === "npm" || p.ecosystem === "pypi");
  return { knownAliases, ignoredIds, ignoredPkgs, trackedPackages };
}

export function isIgnored(ctx, id, pkgs = []) {
  if (ctx.ignoredIds.has(id)) return true;
  return pkgs.length > 0 && pkgs.every((p) => ctx.ignoredPkgs.has(`${p.ecosystem}:${p.name}`));
}

export function filterGhsa(ctx, ghsaAdvisories) {
  return ghsaAdvisories.filter((a) => {
    const text = `${a.summary ?? ""} ${a.description ?? ""}`.toLowerCase();
    // "mcp" must sit at a word edge ("mcp-server", "LudusMCP", "MCPServer"):
    // a bare substring check drowns the report in false hits from e.g. "memcpy".
    if (!/\bmcp|mcp\b|model context protocol/.test(text)) return false;
    if (isIgnored(ctx, a.ghsa_id) || (a.cve_id && ctx.ignoredIds.has(a.cve_id))) return false;
    return !(ctx.knownAliases.has(a.ghsa_id) || (a.cve_id && ctx.knownAliases.has(a.cve_id)));
  });
}

export function collectOsvCandidates(ctx, results) {
  const candidates = new Map();
  results.forEach((r, i) => {
    for (const v of r.vulns ?? []) {
      if (ctx.knownAliases.has(v.id)) continue;
      const entry = candidates.get(v.id) ?? { id: v.id, pkgs: [] };
      entry.pkgs.push(ctx.trackedPackages[i]);
      candidates.set(v.id, entry);
    }
  });
  return [...candidates.values()];
}

export function filterOsvDetail(ctx, candidate, detail, since) {
  const published = Date.parse(detail.published ?? detail.modified ?? 0);
  if (published < since) return null;
  if (
    isIgnored(ctx, candidate.id, candidate.pkgs) ||
    (detail.aliases ?? []).some((al) => ctx.knownAliases.has(al) || ctx.ignoredIds.has(al))
  ) {
    return null;
  }
  return { ...candidate, published: detail.published?.slice(0, 10) };
}

export function renderReport({ days, ghsa, osv }) {
  const lines = [];
  if (ghsa.hits.length > 0) {
    lines.push(`### GHSA advisories mentioning MCP (last ${days} days, not in MCPA database)`, "");
    for (const a of ghsa.hits) {
      lines.push(
        `- [\`${a.ghsa_id}\`](https://github.com/advisories/${a.ghsa_id}) (${a.severity}${a.cve_id ? `, ${a.cve_id}` : ""}): ${a.summary}`,
      );
    }
    lines.push("");
  }
  if (osv.hits.length > 0) {
    lines.push("### New OSV advisories for packages already tracked in MCPA", "");
    for (const h of osv.hits) {
      const pkgs = h.pkgs.map((p) => `\`${p.ecosystem}:${p.name}\``).join(", ");
      lines.push(`- [\`${h.id}\`](https://osv.dev/vulnerability/${h.id}) affects ${pkgs} (published ${h.published ?? "unknown"})`);
    }
    lines.push("");
  }
  for (const e of [ghsa.error, osv.error].filter(Boolean)) {
    lines.push(`> warning: ${e}`);
  }
  return lines.join("\n").trim();
}
