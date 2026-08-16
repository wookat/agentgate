#!/usr/bin/env node
// Weekly growth snapshot for docs/launch/growth-dashboard.md.
// Usage: node scripts/growth-snapshot.mjs   (GITHUB_TOKEN optional, raises API limits)
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
console.log('note: subtract self-produced traffic (CI/action runs) — see dashboard §counting rules');
