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

const GHSA_TYPE_HINTS = [
  [/command injection|code execution|rce\b/i, "rce-vectors"],
  [/path traversal|directory traversal/i, "path-traversal"],
  [/ssrf|server-side request forgery/i, "ssrf"],
  [/credential|token leak|secret/i, "credential-leak"],
  [/malicious|malware|typosquat/i, "malicious-package"],
];

/** Build an MCPA advisory skeleton from a GHSA API detail payload. */
export function draftFromGhsa(detail, nextId) {
  const text = `${detail.summary ?? ""} ${detail.description ?? ""}`;
  const type = GHSA_TYPE_HINTS.find(([re]) => re.test(text))?.[1] ?? "FIXME-type";
  const packages = (detail.vulnerabilities ?? []).map((v) => ({
    ecosystem: (v.package?.ecosystem ?? "FIXME").toLowerCase().replace("pip", "pypi"),
    name: v.package?.name ?? "FIXME",
    ranges: [
      {
        introduced: "0",
        ...(v.last_patched_version
          ? { fixed: v.last_patched_version }
          : { last_affected: v.vulnerable_version_range?.match(/<=\s*([\w.-]+)/)?.[1] ?? "FIXME" }),
      },
    ],
  }));
  return {
    id: nextId,
    title: detail.summary ?? "FIXME",
    summary: detail.description?.trim() || "FIXME — write an accurate summary before committing.",
    type,
    severity: detail.severity === "moderate" ? "medium" : (detail.severity ?? "FIXME"),
    aliases: [detail.cve_id, detail.ghsa_id].filter(Boolean),
    ...(detail.cvss?.vector_string
      ? { cvss: { vector: detail.cvss.vector_string, score: detail.cvss.score } }
      : {}),
    cwe: (detail.cwes ?? []).map((c) => c.cwe_id),
    packages: packages.length > 0 ? packages : [{ ecosystem: "FIXME", name: "FIXME", ranges: [{ introduced: "0", last_affected: "FIXME" }] }],
    references: [
      { type: "advisory", url: detail.html_url ?? `https://github.com/advisories/${detail.ghsa_id}` },
      ...(detail.cve_id ? [{ type: "web", url: `https://nvd.nist.gov/vuln/detail/${detail.cve_id}` }] : []),
      ...(detail.source_code_location ? [{ type: "report", url: detail.source_code_location }] : []),
    ],
    timeline: { published: (detail.published ?? "").slice(0, 10) || "FIXME" },
  };
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
  // npm/PyPI OSV ids are usually GHSA mirrors, so the same --draft flow applies.
  const draftIds = [...ghsa.hits.map((a) => a.ghsa_id), ...osv.hits.map((h) => h.id).filter((id) => /^GHSA-/.test(id))];
  if (draftIds.length > 0) {
    lines.push(
      "",
      "### Triage",
      "",
      "For each true hit, prefill an MCPA draft (review every field, then run `node api/scripts/validate.mjs`):",
      "",
      "```bash",
      ...draftIds.map((id) => `node api/scripts/watch.mjs --draft ${id}`),
      "```",
      "",
      "False positives: add the GHSA/CVE id to `api/advisories/watch-ignore.json`.",
    );
  }
  return lines.join("\n").trim();
}
