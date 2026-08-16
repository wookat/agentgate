#!/usr/bin/env node
// GitHub Marketplace only lists an action whose action.yml sits at the repository
// root, while the source of truth lives in packages/action. Fail when the root
// copy drifts from it.
import { readFileSync } from 'node:fs';

const source = 'packages/action/action.yml';
const root = 'action.yml';
const banner = '# GENERATED — do not edit. Copy of packages/action/action.yml';

const src = readFileSync(source, 'utf8');
const got = readFileSync(root, 'utf8');
const want = `${banner}\n# Regenerate: node scripts/sync-root-action.mjs\n${src}`;

if (got !== want) {
  console.error(`${root} is out of sync with ${source}; run: node scripts/sync-root-action.mjs`);
  process.exit(1);
}
console.log(`${root} in sync with ${source}`);
