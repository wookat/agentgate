# GAP-ROUND-256 — AG-SC-001 flags remote-URL OpenCode instructions

Date: 2026-08-08.

## Gap

OpenCode's `instructions` config array accepts http(s) URLs alongside local
globs. Source-verified in sst/opencode `packages/opencode/src/session/instruction.ts`:
URL entries are fetched (5s timeout, body decoded as text) and injected into
the system prompt of every session. A checked-in `opencode.json` with
`instructions: ["https://host/x.md"]` therefore gives the remote host a
standing prompt-injection channel — the content can change at any time with
no integrity pin (same rug-pull class as unpinned plugins, but directly into
the system prompt).

AgentGate previously ignored the `instructions` key entirely.

## Fix

AG-SC-001 (opencode.json check, alongside the plugin pin checks) now reports
each `instructions` entry starting with `http://` or `https://` as **high**,
with advice to vendor the file into the repo. Local paths and globs stay
quiet — those files are already covered by AG-SK-001 when they match skill
trees, and are repo-reviewable content either way.

## Corpus verification

Rounds 248/249 corpora (43 real repos): 6 wild opencode.json files use
`instructions` — all local paths/globs (e.g. `docs/*.md`, `.cursor/rules`),
correctly quiet. 0 findings, 0 false positives; no remote-URL usage observed
in the wild yet (the fixture proves the detection path).

## Boundary (recorded)

- `~/`-prefixed and absolute local paths are not flagged (user-machine files,
  not remote-mutable).
- Files matched by local instruction globs outside known skill trees are not
  content-scanned this round; candidate for a later round if wild usage shows
  poisoning via e.g. `instructions: ["docs/**/*.md"]`.

## State

Tests 431 → 432 (core 360). Self-scan 21 findings unchanged.
