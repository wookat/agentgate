# GAP-ROUND-379 — advisory round: @copilot-mcp/apex malware (108 → 109) + watch-ignore drift fix

Date: 2026-08-10. Advisory count after this round: 109.

## Watch-ignore drift: rationale-only entries never suppressed anything

The authenticated GHSA sweep re-surfaced all seven GitHub-only candidates
triaged in rounds 374/377. Root cause: those ids were recorded only in
`watch-ignore.json`'s `rationale` map — `buildContext` reads `ids` and
`packages`, so the entries never suppressed anything. Fixed by adding the
seven GHSA ids to `ids`, plus two new invariant tests in
`api/test/watch.test.mjs`:

- every `rationale` key must be an active `ids`/`packages` entry;
- every `ids`/`packages` entry must have a `rationale`.

The second test exposed four pre-existing entries with no rationale
(CVE-2026-18991, GHSA-46jg-c454-8hm3, GHSA-3r2r-p86c-vj94,
npm:flowise-components) — rationales backfilled from GAP-ROUND-27/340/22.
Sweep re-run after the fix: "No uncovered MCP-related advisories found."

## OSV npm export — first change since round 374

npm all.zip ETag e31fe9a2… → 63ab8220…. Full MAL diff filtered to the
agent/MCP vocabulary, modified ≥ 2026-08-01: 40 candidates, all but two
already aliases of existing MCPA records or previously ignored.

**True hit (added):**

- **MCPA-2026-0095** — **@copilot-mcp/apex** (npm, MAL-2026-12314,
  critical). install.cjs runs on postinstall: on macOS spawns osascript
  with an admin auth dialog then pipes
  `https://update.apex-arena-router.com/loader.sh` into zsh (mutable
  attacker URL), and downloads an OS-specific binary from an unrelated
  GitHub org with no verification. Metadata copied verbatim from
  @oh-my-pi/pi-coding-agent; tarball ships no src/ despite ~150 declared
  export subpaths. All published versions 1.0.0–1.0.22 affected; the
  package is now removed from npm (404) → introduced "0", no fixed
  release. Tarball itself no longer fetchable — evidence is the
  amazon-inspector source record in MAL-2026-12314.

**False positive (added to watch-ignore with evidence):**

- MAL-2026-12789 (**fa-mcp-sdk** 0.12.72) — amazon-inspector composition
  heuristic. Tarball unpacked: `cli-template/update.cjs` is a user-invoked
  service self-updater (git pull + mail/Telegram notification to the
  operator-configured channel), not referenced from any install hook, no
  remote-directed command channel. The package is a live, actively
  maintained MCP SDK (latest 0.12.96).

PyPI export ETag unchanged (df798022…) since round 374.

## Other windows

- Nine-client version window: unchanged (Claude Code v2.1.226, Gemini CLI
  v0.54.4, Copilot CLI v1.0.78, OpenCode 1.18.15, Crush v0.88.1, Qwen Code
  v0.21.8, Goose v1.45.0, Codex rust-v0.147.0, Cline npm 3.0.52).

## Validation

`node api/scripts/validate.mjs` — 109 advisory files valid; bundle
regenerated; `pnpm build`, `pnpm test`, `pnpm lint`, `pnpm typecheck`,
`git diff --check` all green.
