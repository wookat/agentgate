#!/usr/bin/env node
// Weekly growth snapshot for docs/launch/growth-dashboard.md.
// Usage: node scripts/growth-snapshot.mjs [--append]
//   --append: also append a prefilled row to the dashboard's "Weekly log" table
//   (GITHUB_TOKEN optional, raises API limits)
import { readFileSync, writeFileSync } from 'node:fs';

const pkgs = ['mcp-agentgate', 'mcp-agentgate-config-convert'];
const repo = 'wookat/agentgate';

const day = (d) => new Date(Date.now() - d * 864e5).toISOString().slice(0, 10);
const json = async (url, headers = {}) => {
  const r = await fetch(url, { headers });
  if (!r.ok) throw new Error(`${url} -> ${r.status}`);
  return r.json();
};

const headers = process.env.GITHUB_TOKEN
  ? { authorization: `Bearer ${process.env.GITHUB_TOKEN}` }
  : {};

const gh = await json(`https://api.github.com/repos/${repo}`, headers);
const rows = [];
for (const p of pkgs) {
  const d = await json(`https://api.npmjs.org/downloads/range/${day(7)}:${day(1)}/${p}`);
  rows.push([p, d.downloads.reduce((a, b) => a + b.downloads, 0)]);
}

console.log(`date: ${day(0)}`);
console.log(`stars: ${gh.stargazers_count}`);
console.log(`forks: ${gh.forks_count}`);
console.log(`watchers: ${gh.subscribers_count}`);
console.log(`open issues+PRs: ${gh.open_issues_count}`);
for (const [p, n] of rows) console.log(`npm 7d downloads (raw, ${p}): ${n}`);

// the honest adoption proxy: downloads of the current `latest` version last week
const latestVersion = (await json(`https://registry.npmjs.org/${pkgs[0]}`))['dist-tags'].latest;
const perVersion = await json(`https://api.npmjs.org/versions/${pkgs[0]}/last-week`);
const latestDl = perVersion.downloads?.[latestVersion] ?? 0;
console.log(`npm 7d downloads (latest=${latestVersion}, ${pkgs[0]}): ${latestDl}`);
console.log('note: subtract self-produced traffic (CI/action runs) — see dashboard §counting rules');

if (process.argv.includes('--append')) {
  const dash = 'docs/launch/growth-dashboard.md';
  const md = readFileSync(dash, 'utf8');
  const marker = '| Week (Mon) | Stars | `latest` dl (7d) | Site UV | New listings / posts | Notes |';
  if (!md.includes(marker)) throw new Error(`weekly-log table header not found in ${dash}`);
  const row = `| ${day(0)} | ${gh.stargazers_count} | ${latestDl} (v${latestVersion}) | — | <fill in> | <fill in> |`;
  const lines = md.split('\n');
  let end = lines.indexOf(marker) + 2; // skip header + separator
  while (end < lines.length && lines[end].startsWith('|')) end++;
  lines.splice(end, 0, row);
  writeFileSync(dash, lines.join('\n'));
  console.log(`\nappended to ${dash}: ${row}`);
  console.log('fill in Site UV / listings / notes by hand, then commit.');
}
