#!/usr/bin/env node
// Fails when a hardcoded "N public advisories" count in docs/website drifts
// from the number of entries in /advisories (the round-252 staleness class).
import { readdirSync, readFileSync } from 'node:fs';
import { execSync } from 'node:child_process';

const actual = readdirSync('advisories').filter((f) => /^MCPA-\d{4}-\d{4}\.json$/.test(f)).length;
const files = execSync("git grep -l -E '[0-9]+ public advisories' -- ':!scripts'", { encoding: 'utf8' })
  .split('\n')
  .filter(Boolean);

let failed = false;
for (const file of files) {
  for (const m of readFileSync(file, 'utf8').matchAll(/(\d+) public advisories/g)) {
    if (Number(m[1]) !== actual) {
      console.error(`${file}: says "${m[0]}" but /advisories has ${actual} entries`);
      failed = true;
    }
  }
}
if (failed) process.exit(1);
console.log(`advisory count ${actual} consistent across ${files.length} file(s)`);
