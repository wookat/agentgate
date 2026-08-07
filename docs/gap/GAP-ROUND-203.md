# GAP-ROUND-203 — Copilot CLI hooks (AG-SK-003)

Date: 2026-08-08 · Round type: coverage (new surface, follows round 202)

## Official evidence

- GitHub Docs "Using hooks with GitHub Copilot CLI": repository-level hooks
  live in `.github/hooks/NAME.json`, user-level hooks in `~/.copilot/hooks/`
  (or `$COPILOT_HOME/hooks/`). Schema: `{ "version": 1, "hooks": {
  sessionStart | sessionEnd | userPromptSubmitted | preToolUse | postToolUse
  | errorOccurred | agentStop: [{ "type": "command", "bash": …,
  "powershell": …, "cwd", "timeoutSec" }] } }`.
- Hooks "extend GitHub Copilot agent behavior with custom shell commands at
  key points during agent execution" — they run automatically for anyone who
  opens the repo in Copilot CLI. The `bash` key runs on Linux/macOS and the
  `powershell` key on Windows; Copilot picks the key for the user's OS, so a
  dangerous command can hide in either variant (same reasoning as round-177
  Codex `commandWindows`).

## What shipped

- `COPILOT_HOOKS_FILE` (`.github/hooks/*.json` + `.copilot/hooks/*.json`)
  became an AG-SK-003 named surface with a dedicated extractor that reads
  `type: "command"` entries' `bash` and `powershell` keys (plus a
  Claude-style `command` key seen in the wild) and runs them through the
  shared risky-command classifier.
- The repo walker's `.github` skill-only exclusion (round 124) now exempts
  `.github/hooks/*.json` so the files are scanned at all.

## Surface / corpus evidence

- GitHub code search: 2,528 JSON files under `.github/hooks/`.
- Real repos scanned (unmodified): foxminchan/BookWorm (bash+powershell
  script-path hooks), kenryu42/cc-safety-net (`npx -y cc-safety-net` guard),
  kellerlabs/homeracker (Claude-style `command` key), ntop/ntopng
  (permissions-shaped JSON, no hooks key) — all correctly 0 findings on the
  new surface. True positives covered by unit fixtures (irm|iex in the
  powershell key, SSH-key exfiltration in bash).

## Boundaries (recorded, not modeled)

- Referenced hook script files (`./.github/hooks/scripts/*.sh`) are not
  followed/parsed — same boundary as every other hook surface.
- `$COPILOT_HOME` relocation not read (fixed default paths only).
- Hook `cwd`/`timeoutSec` and event semantics are not modeled.

## Validation

- Full suite green: core 286, cli 47, config-convert 24.
- Self-scan 155 files: 18 findings, unchanged.
