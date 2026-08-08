# GAP-ROUND-275 — Cursor cloud-agent environment configs (`.cursor/environment.json`)

## What was investigated

Cursor Cloud Agents (docs: https://cursor.com/docs/cloud-agents and
https://cursor.com/docs/cloud-agents/setup) read a repository-committed
`.cursor/environment.json` to configure the agent's remote environment:

- `install` — runs while Cursor creates a Build of the environment;
- `start` — runs every time an agent boots from that Build;
- `terminals[].command` — long-lived processes kept alive while the agent
  runs;
- `build.dockerfile` — an optional `.cursor/Dockerfile` reference (Docker
  builds are a separate, well-understood surface and are not modeled here).

All three command fields are plain shell strings executed automatically for
anyone who launches a cloud agent on the repo — the same
repo-carries-auto-executed-commands shape as VS Code `folderOpen` tasks,
`.cursor/hooks.json`, and OpenHands `setup.sh`. AgentGate previously only
covered Cursor's `mcp.json`, `rules/*.mdc`, `cli.json`, and `hooks.json`;
`environment.json` was invisible.

## What changed

- AG-SK-003 now treats `.cursor/environment.json` as a named surface:
  `install`, `start`, and each `terminals[].command` string run through the
  shared dangerous-command classifier, and findings name the config key.
- False-positive fix found by the wild corpus: `cp .env.example .env.local`
  style template scaffolding matched the "reads .env secrets" pattern
  (`cp … .env\b`). `classifyRiskyCommand` now strips
  `cp <template>.env.{example,sample,template,dist} <dest>` before matching.
  This benefits every hook/task surface that uses the classifier.

## Real-corpus evidence

GitHub code search (`filename:environment.json path:.cursor`) reports 722
matches; 298 unique repos collected, the first 60 cloned plus 2 already in
older corpora. Results across 60 wild `.cursor/environment.json` files:

- 3 repos flag `install` critical for piping a remote install script to a
  shell (`curl -fsSL https://bun.sh/install | bash`,
  `https://deno.land/install.sh | sh`). These are the by-design AG-SK-003
  semantics for unpinned remote script execution (same policy as shell
  scripts and OpenCode plugins, round-257): the commands really do fetch and
  run mutable remote code at Build creation.
- 1 repo (moviecal) initially flagged `install` high for "reads .env
  secrets" on `cp .env.example .env.local` — a false positive, fixed as
  above; the repo now scans clean on this surface.
- The remaining 56 files (pnpm/bun/npm installs, `sudo service … start`,
  dev-server terminals) produce no AG-SK-003 findings.

## Boundaries (honest)

- `build.dockerfile` contents are not interpreted; `.cursor/Dockerfile` is
  a normal Dockerfile and out of scope for the skill classifier.
- The `snapshot`/`ports`/`name` keys carry no commands and are ignored.
- Only dangerous idioms are reported; the mere presence of an
  `environment.json` (or of a benign `install`) is not a finding.
