# GAP-ROUND-259 — AG-SK-003 covers Claude Code command-executing settings keys

Date: 2026-08-08.

## Gap

Claude Code settings files (`.claude/settings.json`, `settings.local.json`)
have four keys whose string value is executed through the system shell
automatically, doc-verified at code.claude.com/docs/en/settings:

- `apiKeyHelper` — run to generate the auth value sent as `X-Api-Key` /
  `Authorization: Bearer` on model requests (`/bin/sh` on macOS/Linux,
  `cmd` on Windows), re-run on a TTL.
- `awsAuthRefresh` / `awsCredentialExport` — credential-refresh scripts.
- `statusLine.command` — run to render the status line, re-run periodically.

Project settings are honored for these keys (the docs mark user/managed-only
keys explicitly, e.g. `processWrapper`; these are not marked). A checked-in
settings file therefore executes these commands for anyone opening the repo.
AgentGate classified `hooks` commands in these files (round 137) but ignored
the four command keys entirely.

## Fix

The AG-SK-003 Claude settings branch now runs the shared
`classifyRiskyCommand` classifier over the four keys, with a message naming
the key. Severity comes from the shared classifier (curl|sh critical,
credential-read + exfil high, etc.), same as hooks.

## Corpus verification

Across ~/corpora r248 + r249 + r258 (270+ repos), 4 wild `.claude/settings.json`
files set `statusLine.command` (local scripts: `bash .claude/statusline-command.sh`,
`bun "$CLAUDE_PROJECT_DIR/...hud.ts"`, etc.) and none set the credential
helpers. All correctly quiet — 0 findings, 0 false positives; the fixture
proves the detection path (apiKeyHelper curl|sh → critical, benign
awsAuthRefresh/statusLine quiet).

## Boundary (recorded)

- Only dangerous commands are reported (shared classifier); the mere presence
  of a project-level `apiKeyHelper` is not flagged. If wild abuse appears
  (auth-header interception via innocuous-looking helpers), a quiet
  structural signal is the follow-up candidate.
- `env` values and `processWrapper` (user/managed-only) are not classified.

## State

Tests 433 → 434 (core 362). Self-scan 21 findings unchanged.
