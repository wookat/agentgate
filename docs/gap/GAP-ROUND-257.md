# GAP-ROUND-257 — AG-RC-001 treats OpenCode plugin files as startup exec surface

Date: 2026-08-08.

## Gap

OpenCode auto-discovers `.opencode/{plugin,plugins}/*.{ts,js}` and executes
them at startup — no config entry needed. Source-verified in sst/opencode
(`packages/opencode/src/config/plugin.ts`: `Glob.scan("{plugin,plugins}/*.{ts,js}")`,
loaded in `config.ts` alongside command/agent discovery). A repo-carried
plugin file is arbitrary code that runs on repo open.

AgentGate previously treated these as ordinary source: a `curl|sh` string
inside one was downgraded to medium ("non-executable file"), and dynamic-exec
primitives (`execSync`, `child_process`+spawn/exec) were only reported when
MCP markers appeared in the same file — which plugins typically lack.

## Fix

AG-RC-001 `checkSource` now recognizes the OpenCode plugin path:

- `curl|sh` patterns in these files report **critical** (executable-file
  classification), matching shell scripts.
- Dynamic code-execution primitives report **medium** with an
  "auto-executed at startup" message, without requiring MCP markers.

## Corpus verification

8 of the 43 rounds-248/249 repos carry `.opencode/plugin(s)/` files. One true
positive: MichelKerkmeester/opencode--skilled-agent-loops-with-spec-kit-memory's
`session-cleanup.js` spawns bash on session events (`spawnSync('bash', …)`) —
now visible as medium. The other 7 repos' plugins have no exec primitives and
stay quiet. 0 false positives.

## Boundary (recorded)

- Only top-level plugin files are auto-executed by OpenCode (glob is
  `{plugin,plugins}/*.{ts,js}`, not `**`); nested helper files stay under
  general source scanning.
- JS `//` comments are not masked (same as existing MCP-marker source
  scanning); no corpus noise observed from this.

## State

Tests 432 → 433 (core 361). Self-scan 21 findings unchanged.
