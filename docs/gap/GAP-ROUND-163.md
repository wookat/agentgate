# GAP-ROUND-163 — VS Code folderOpen tasks + allowAutomaticTasks

Date: 2026-08-08 · Round type: coverage gap (official-docs-verified)

## Gap

VS Code tasks (official docs, code.visualstudio.com/docs/debugtest/
tasks) support `"runOptions": { "runOn": "folderOpen" }` — the task
runs automatically when the folder is opened. `task.allowAutomaticTasks`
defaults to `off` (one Allow/Disallow prompt), but a checked-in
workspace setting of `"on"` removes that prompt in trusted
workspaces. This is a documented, publicly demonstrated attack shape
(PoC repos exist) and the same auto-execution family as Claude/Kiro/
Amazon Q hooks (rounds 137/161/162), yet `.vscode/tasks.json` was not
scanned at all.

## Change

- Scanner walks `.vscode/tasks.json` (settings-only dot-dir list).
- `AG-SK-003.checkSource` classifies folderOpen task commands
  (command + string args) with the shared RISKY_COMMANDS classifier:
  remote-script pipes critical; exfiltration/credential/.env reads
  high. Run-on-demand tasks are ignored.
- `AG-SK-002` reports `task.allowAutomaticTasks: "on"` in
  `.vscode/settings.json` as medium.

## Real corpus

- PiotrWachulec/PureEvilRepo — public PoC malicious repo: two
  folderOpen tasks POSTing to a Discord webhook via `curl -d` →
  both report high (true positives).
- microsoft/vscode-remote-try-node — `npm install` folderOpen task:
  clean (correct).
- XanDev3/emrit-take-home, BigMarketDao/bigmarket-dao — watch/build
  folderOpen tasks: clean (correct; the latter is JSONC with trailing
  commas, parsed by the JSONC-tolerant parser).
- GitHub code search: 3,584 tasks.json files mention folderOpen; 103
  also mention curl — the surface is widespread.

## Honest boundaries

- Automatic tasks never run in untrusted workspaces and prompt once
  by default; severity reflects post-trust behavior. The
  allowAutomaticTasks+folderOpen combination is not merged into a
  single elevated finding — the two findings appear side by side.
- Only string `command`/`args` are classified; complex shell
  compositions via `options.shell.args` or per-OS `windows`/`linux`
  variants are not expanded (candidate if seen in the wild).

## Routine checks

- Advisory watch: no uncovered public MCP advisories in this sweep.
- Competitors: no relevant capability movement observed.

## Evidence

- Full suite green: core 236, cli 47, config-convert 24.
- Self-scan: 155 files, 17 findings (13 medium, 4 low) unchanged.
