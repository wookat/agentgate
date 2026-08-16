#!/usr/bin/env node
// Regenerates the repository-root action.yml required by GitHub Marketplace
// from the source of truth in packages/action.
import { readFileSync, writeFileSync } from 'node:fs';

const banner = '# GENERATED — do not edit. Copy of packages/action/action.yml';
const src = readFileSync('packages/action/action.yml', 'utf8');
writeFileSync('action.yml', `${banner}\n# Regenerate: node scripts/sync-root-action.mjs\n${src}`);
console.log('action.yml regenerated from packages/action/action.yml');
