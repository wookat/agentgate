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
import { buildContext, filterGhsa, collectOsvCandidates, filterOsvDetail, renderReport } from "./watch-lib.mjs";

const ROOT = path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), "..", "..");
const DAYS = Number(process.env.WATCH_DAYS ?? 8);

const files = fs
  .readdirSync(path.join(ROOT, "advisories"))
  .filter((f) => /^MCPA-\d{4}-\d{4}\.json$/.test(f));
const advisories = files.map((f) => JSON.parse(fs.readFileSync(path.join(ROOT, "advisories", f), "utf8")));

// Reviewed advisory ids / package channels deliberately not mirrored into
// MCPA; the rationale lives in the GAP reports referenced in the file.
const ignoreList = JSON.parse(fs.readFileSync(path.join(ROOT, "advisories", "watch-ignore.json"), "utf8"));

const ctx = buildContext({ advisories, ignoreList });

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
  return { error: null, hits: filterGhsa(ctx, await res.json()) };
}

async function osvSweep() {
  const res = await fetch("https://api.osv.dev/v1/querybatch", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      queries: ctx.trackedPackages.map((p) => ({
        package: { name: p.name, ecosystem: p.ecosystem === "pypi" ? "PyPI" : "npm" },
      })),
    }),
  });
  if (!res.ok) return { error: `OSV querybatch ${res.status}`, hits: [] };
  const { results } = await res.json();
  // Tracked packages accumulate historic app-level advisories we deliberately
  // do not mirror; only surface entries published inside the sweep window.
  const since = Date.now() - DAYS * 86400e3;
  const hits = [];
  for (const c of collectOsvCandidates(ctx, results)) {
    const detail = await fetch(`https://api.osv.dev/v1/vulns/${c.id}`);
    if (!detail.ok) continue;
    const hit = filterOsvDetail(ctx, c, await detail.json(), since);
    if (hit) hits.push(hit);
  }
  return { error: null, hits };
}

const [ghsa, osv] = await Promise.all([ghsaSweep(), osvSweep()]);

const report = renderReport({ days: DAYS, ghsa, osv });
if (process.env.WATCH_REPORT) fs.writeFileSync(process.env.WATCH_REPORT, `${report}\n`);
if (report) {
  console.log(report);
} else {
  console.log("No uncovered MCP-related advisories found.");
}
