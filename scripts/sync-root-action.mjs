#!/usr/bin/env node
// Regenerates the repository-root action.yml required by GitHub Marketplace
// from the source of truth in packages/action (byte-identical mirror).
import { copyFileSync } from 'node:fs';

copyFileSync('packages/action/action.yml', 'action.yml');
console.log('action.yml mirrored from packages/action/action.yml');
