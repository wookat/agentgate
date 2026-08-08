#!/usr/bin/env node
// Fails when a hand-maintained client list in README/website drifts from the
// discovery client registry (the round-272 staleness class: a new client is
// added to packages/core/src/discovery.ts but a docs list is not updated).
import { readFileSync } from 'node:fs';

const discovery = readFileSync('packages/core/src/discovery.ts', 'utf8');
const ids = new Set(
  [...discovery.matchAll(/(?:push\(|client: )'([a-z0-9-]+)'/g)].map((m) => m[1]),
);

// Pseudo-clients / secondary surfaces that ride on another client's config
// and are intentionally not named in the headline client lists.
const NOT_LISTED = new Set([
  'agents', // generic .agents convention (part of the Warp coverage)
  'claude-plugin', // Claude Code plugin-bundled servers
  'copilot-agent', // Copilot custom agent frontmatter
  'factory-plugin', // Factory Droid plugin surface
  'gemini-extension', // Gemini CLI extension manifests
  'qwen-extension', // Qwen Code extension manifests
  'unknown', // fallback id for user-supplied config paths
]);

// id → substrings accepted as naming that client in prose (any one suffices;
// short forms cover the homepage's abbreviated list).
const DISPLAY = {
  'claude-desktop': ['Claude Desktop', 'Claude,'],
  'claude-code': ['Claude Code', 'Claude,'],
  cursor: ['Cursor'],
  vscode: ['VS Code'],
  codex: ['Codex'],
  opencode: ['OpenCode'],
  windsurf: ['Windsurf'],
  cline: ['Cline'],
  'gemini-cli': ['Gemini CLI'],
  kiro: ['Kiro'],
  'roo-code': ['Roo Code'],
  kilocode: ['Kilo Code'],
  zed: ['Zed'],
  continue: ['Continue.dev'],
  amp: ['Amp'],
  warp: ['Warp'],
  lmstudio: ['LM Studio'],
  trae: ['Trae'],
  qoder: ['Qoder'],
  amazonq: ['Amazon Q'],
  'qwen-code': ['Qwen Code'],
  'copilot-cli': ['Copilot CLI'],
  junie: ['Junie'],
  factory: ['Factory Droid'],
  antigravity: ['Antigravity'],
  goose: ['Goose'],
  crush: ['Crush'],
};

const WATCHED = [
  'README.md',
  'packages/cli/README.md',
  'website/src/content/docs/docs/quick-start.md',
  'website/src/content/docs/docs/cli/scan.md',
  'website/src/pages/index.astro',
];

let failed = false;
for (const id of ids) {
  if (NOT_LISTED.has(id)) continue;
  if (!DISPLAY[id]) {
    console.error(
      `discovery client "${id}" has no display-name entry in scripts/check-client-lists.mjs — add it (and to the docs client lists) or mark it NOT_LISTED`,
    );
    failed = true;
  }
}
for (const file of WATCHED) {
  const text = readFileSync(file, 'utf8');
  for (const [id, names] of Object.entries(DISPLAY)) {
    if (!ids.has(id)) {
      console.error(`scripts/check-client-lists.mjs lists "${id}" but discovery.ts no longer has it`);
      failed = true;
      continue;
    }
    if (!names.some((n) => text.includes(n))) {
      console.error(`${file}: client list is missing "${names[0]}" (discovery id "${id}")`);
      failed = true;
    }
  }
}
if (failed) process.exit(1);
console.log(`client lists in ${WATCHED.length} file(s) cover all ${Object.keys(DISPLAY).length} discovery clients`);
