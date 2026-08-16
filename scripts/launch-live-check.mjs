#!/usr/bin/env node
// Posting-day re-verification for docs/launch/*: re-checks, against the live npm
// registry, every malicious package listed in the disclosure report and prints
// the current still-installable count (the number quoted in the launch drafts).
// Usage: node scripts/launch-live-check.mjs
import { readFileSync } from 'node:fs';

const report = readFileSync('docs/launch/disclosure/npm-security-report.md', 'utf8');
const names = [...new Set([...report.matchAll(/^\| \d+ \| `([^`]+)` \|/gm)].map((m) => m[1]))];
if (names.length === 0) throw new Error('no packages parsed from the disclosure report');

const results = [];
for (const name of names) {
  const res = await fetch(`https://registry.npmjs.org/${encodeURIComponent(name)}`);
  if (res.status === 404) {
    results.push({ name, state: 'removed (404)' });
    continue;
  }
  if (!res.ok) throw new Error(`${name}: registry returned ${res.status}`);
  const meta = await res.json();
  const latest = meta['dist-tags']?.latest;
  if (!latest) {
    results.push({ name, state: 'unpublished (no latest dist-tag)' });
  } else if (/^0\.0\.1-security/.test(latest) || /security holding package/i.test(meta.description ?? '')) {
    results.push({ name, state: `security-holder (${latest})` });
  } else {
    results.push({ name, state: 'LIVE', latest });
  }
}

const live = results.filter((r) => r.state === 'LIVE');
for (const r of results) {
  console.log(`${r.state === 'LIVE' ? '✗ LIVE   ' : '✓ handled'} ${r.name}${r.latest ? `@${r.latest}` : ''}${r.state === 'LIVE' ? '' : ` — ${r.state}`}`);
}
console.log(`\n${live.length} of ${names.length} still installable as of ${new Date().toISOString().slice(0, 10)}`);
console.log('Update the count and <DATE> in docs/launch/ drafts and the disclosure email before posting.');
