#!/usr/bin/env node
// Rewrites the version pins in integration snippets (GitHub Action `@vX.Y.Z`,
// pre-commit `rev: vX.Y.Z`) to the current CLI version, so the changesets
// version PR keeps the docs pointing at the tag that release will create.
import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';

const ROOT = path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), '..');
const { version } = JSON.parse(fs.readFileSync(path.join(ROOT, 'packages/cli/package.json'), 'utf8'));

const FILES = [
  'README.md',
  'README.zh-CN.md',
  'packages/action/README.md',
  '.pre-commit-hooks.yaml',
  'website/src/content/docs/docs/cli/deps.md',
];

const PATTERNS = [
  [/(wookat\/agentgate\/packages\/action@)v\d+\.\d+\.\d+/g, `$1v${version}`],
  [/(rev: )v\d+\.\d+\.\d+/g, `$1v${version}`],
];

for (const rel of FILES) {
  const file = path.join(ROOT, rel);
  const before = fs.readFileSync(file, 'utf8');
  let after = before;
  for (const [re, replacement] of PATTERNS) after = after.replace(re, replacement);
  if (after !== before) {
    fs.writeFileSync(file, after);
    console.log(`pinned v${version} in ${rel}`);
  }
}
