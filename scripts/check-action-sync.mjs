#!/usr/bin/env node
// GitHub Marketplace only lists an action whose action.yml sits at the repository
// root, while the source of truth lives in packages/action. The two must stay
// byte-identical; fail when the root mirror drifts.
import { readFileSync } from 'node:fs';

const source = 'packages/action/action.yml';
const root = 'action.yml';

if (readFileSync(source, 'utf8') !== readFileSync(root, 'utf8')) {
  console.error(`${root} is out of sync with ${source}; run: node scripts/sync-root-action.mjs`);
  process.exit(1);
}
console.log(`${root} in sync with ${source}`);
