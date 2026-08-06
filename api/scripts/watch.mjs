// Advisory watch: find public MCP-related security intelligence that the
// MCPA database does not cover yet. Prints a markdown report to stdout and
// writes it to the path in $WATCH_REPORT (if set). Exits 0 always — the
// caller decides what to do with a non-empty report.
//
// Sources (no credentials required):
//   - GitHub Advisory API: advisories published in the last $WATCH_DAYS days
//     whose text mentions MCP / Model Context Protocol.
//   - OSV.dev querybatch: new advisories affecting packages already tracked
//     in advisories/*.json.

import fs from "node:fs";
import path from "node:path";
import url from "node:url";

const ROOT = path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), "..", "..");
const DAYS = Number(process.env.WATCH_DAYS ?? 8);

const files = fs
  .readdirSync(path.join(ROOT, "advisories"))
  .filter((f) => /^MCPA-\d{4}-\d{4}\.json$/.test(f));
const advisories = files.map((f) => JSON.parse(fs.readFileSync(path.join(ROOT, "advisories", f), "utf8")));
const knownAliases = new Set(advisories.flatMap((a) => a.aliases ?? []));

// Reviewed advisory ids / package channels deliberately not mirrored into
// MCPA; the rationale lives in the GAP reports referenced in the file.
const ignoreList = JSON.parse(fs.readFileSync(path.join(ROOT, "advisories", "watch-ignore.json"), "utf8"));
const ignoredIds = new Set(ignoreList.ids ?? []);
const ignoredPkgs = new Set(ignoreList.packages ?? []);
function ignored(id, pkgs = []) {
  if (ignoredIds.has(id)) return true;
  return pkgs.length > 0 && pkgs.every((p) => ignoredPkgs.has(`${p.ecosystem}:${p.name}`));
}
const trackedPackages = [
  ...new Map(
    advisories
      .flatMap((a) => a.packages ?? [])
      .map((p) => [`${p.ecosystem}:${p.name}`, { ecosystem: p.ecosystem, name: p.name }]),
  ).values(),
].filter((p) => p.ecosystem === "npm" || p.ecosystem === "pypi");

function iso(d) {
  return d.toISOString().slice(0, 10);
}

async function ghsaSweep() {
  const since = new Date(Date.now() - DAYS * 86400e3);
  const range = `${iso(since)}..${iso(new Date())}`;
  const headers = { accept: "application/vnd.github+json" };
  if (process.env.GITHUB_TOKEN) headers.authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  const res = await fetch(`https://api.github.com/advisories?published=${range}&per_page=100`, { headers });
  if (!res.ok) return { error: `GitHub Advisory API ${res.status}`, hits: [] };
  const all = await res.json();
  const hits = all.filter((a) => {
    const text = `${a.summary ?? ""} ${a.description ?? ""}`.toLowerCase();
    if (!(text.includes("mcp") || text.includes("model context protocol"))) return false;
    if (ignored(a.ghsa_id) || (a.cve_id && ignoredIds.has(a.cve_id))) return false;
    return !(knownAliases.has(a.ghsa_id) || (a.cve_id && knownAliases.has(a.cve_id)));
  });
  return { error: null, hits };
}

async function osvSweep() {
  const res = await fetch("https://api.osv.dev/v1/querybatch", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      queries: trackedPackages.map((p) => ({
        package: { name: p.name, ecosystem: p.ecosystem === "pypi" ? "PyPI" : "npm" },
      })),
    }),
  });
  if (!res.ok) return { error: `OSV querybatch ${res.status}`, hits: [] };
  const { results } = await res.json();
  const candidates = new Map();
  results.forEach((r, i) => {
    for (const v of r.vulns ?? []) {
      if (knownAliases.has(v.id)) continue;
      const entry = candidates.get(v.id) ?? { id: v.id, pkgs: [] };
      entry.pkgs.push(trackedPackages[i]);
      candidates.set(v.id, entry);
    }
  });
  // Tracked packages accumulate historic app-level advisories we deliberately
  // do not mirror; only surface entries published inside the sweep window.
  const since = Date.now() - DAYS * 86400e3;
  const hits = [];
  for (const c of candidates.values()) {
    const detail = await fetch(`https://api.osv.dev/v1/vulns/${c.id}`);
    if (!detail.ok) continue;
    const v = await detail.json();
    const published = Date.parse(v.published ?? v.modified ?? 0);
    if (published < since) continue;
    if (ignored(c.id, c.pkgs) || (v.aliases ?? []).some((al) => knownAliases.has(al) || ignoredIds.has(al))) continue;
    hits.push({ ...c, published: v.published?.slice(0, 10) });
  }
  return { error: null, hits };
}

const [ghsa, osv] = await Promise.all([ghsaSweep(), osvSweep()]);

const lines = [];
if (ghsa.hits.length > 0) {
  lines.push(`### GHSA advisories mentioning MCP (last ${DAYS} days, not in MCPA database)`, "");
  for (const a of ghsa.hits) {
    lines.push(`- [\`${a.ghsa_id}\`](https://github.com/advisories/${a.ghsa_id}) (${a.severity}${a.cve_id ? `, ${a.cve_id}` : ""}): ${a.summary}`);
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

const report = lines.join("\n").trim();
if (process.env.WATCH_REPORT) fs.writeFileSync(process.env.WATCH_REPORT, `${report}\n`);
if (report) {
  console.log(report);
} else {
  console.log("No uncovered MCP-related advisories found.");
}
