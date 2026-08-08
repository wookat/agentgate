# GAP-ROUND-266 — Cline `.cline/` project tree: skills + auto-executed plugins

Date: 2026-08-03
Round type: new scan surface (new-client/new-surface survey round; last was round 246)

## Survey

Surveyed recent additions across mainstream MCP/agent clients for repo-carried
surfaces AgentGate cannot yet see. Cline's documentation now describes a
project-level `.cline/` tree that AgentGate skipped entirely — `.cline` was not
in the scanner's agent dot-dir allowlist, so nothing under it was walked.

Official sources (docs.cline.bot, fetched 2026-08-03):

- Skills (`/customization/skills`): "Place skill directories in
  `.cline/skills/` (workspace) or `~/.cline/skills/` (global) and Cline will
  detect them automatically." Project skills also load from
  `.clinerules/skills/` (already covered via the `.clinerules` tree). Each
  skill is a directory with a `SKILL.md` (YAML frontmatter + instructions)
  that is injected into the model context when triggered — a poisoned skill
  is direct prompt injection.
- Plugins (`/customization/plugins`): "Plugins are stored in the `plugins`
  directory at two levels: `~/.cline/plugins/` (global) … `.cline/` (project
  root) `plugins/` (project-scoped plugins)". Project plugins are `.ts`/`.js`
  files (or directories with a `package.json`) that are loaded and executed
  by the host runtime — a repo-carried plugin runs code on repo open, same
  class as the OpenCode startup plugins covered in round 257.
- Plugin install (`/sdk/plugin-install`): plugins install from file URLs,
  npm, git, or local paths; auto-discovery "recursively scans for `.ts` and
  `.js` files (skipping `node_modules` and `.git`)" — so nested plugin files
  under `.cline/plugins/` are executable surface, not just top-level files
  (unlike OpenCode's non-recursive `*.{ts,js}` glob, round 258).

## Change

- `packages/core/src/scanner.ts`: add `.cline` to `AGENT_DOT_DIRS` so the
  project tree is walked. `SKILL.md` files under `.cline/skills/` are picked
  up by the existing AG-SK-001 skill matcher (which matches `SKILL.md`
  anywhere); plugin sources go through source scanning.
- `packages/core/src/rules/rce-vectors.ts`: generalize the round-257 OpenCode
  startup-plugin classification into `STARTUP_PLUGIN_FILE` covering
  `.cline/plugins/**/*.{ts,js}` (recursive, per the official auto-discovery
  semantics) alongside `.opencode/{plugin,plugins}/*.{ts,js}` (top-level
  only, per the OpenCode loader glob). curl|sh in these files reports
  critical; dynamic code-execution primitives report medium without MCP
  markers. Finding messages name the client (Cline/OpenCode).

`node_modules` under `.cline/plugins/` is already excluded by the scanner's
global `SKIP_DIRS`, matching Cline's own auto-discovery exclusions.

## Wild corpus

GitHub code search `path:.cline/skills` (project skills) — sampled 6 real
repositories and scanned each with the patched build:

| Repo | `.cline` contents | Result |
|---|---|---|
| ProfSynapse/nexus | 10+ skills | 0 findings (benign) |
| loonghao/vx | 8 skills | 0 findings (benign) |
| tody-agent/codymaster | 12 skills | 1 true positive: hidden U+200D×3 on a standalone line in `cm-codeintell/SKILL.md` (AG-SK-001 critical) — verified not an emoji ZWJ sequence |
| PaulKinlan/Co-do | rules only | 0 findings |
| rubenmarcus/ralph-starter | rules only | 0 findings |
| aws-samples/amazon-transcribe-live-meeting-assistant | rules only | 0 findings |

`path:.cline/plugins` returned 0 wild hits — the plugin store is new; the
surface is covered ahead of adoption (fixture-tested: curl|sh critical +
dynamic-exec medium in a nested plugin file, benign plugin file clean).

Dozens of benign wild SKILL.md files under `.cline/skills/` produced 0 false
positives.

## Boundaries (honest)

- Global trees (`~/.cline/plugins/`, `~/.cline/skills/`) are outside repo
  scanning, same policy as every other global skill tree.
- `.cline/plugins/` directories with a `package.json` may declare npm
  dependencies installed at plugin install time; dependency-level advisory
  checking for these manifests is not modeled this round (the manifest itself
  is scanned as source).
- Cline plugin installs from npm/git/file URLs (`cline plugin install …`) are
  a user action outside the repo, not a repo-carried surface.

## Validation

- `pnpm -r test`, `pnpm lint`, `pnpm typecheck`, `pnpm build`, `git diff --check` all green.
- New regression test: `.cline/plugins/nested/evil.ts` (curl|sh critical +
  dynamic-exec medium, message names Cline), benign plugin clean, poisoned
  `.cline/skills/deploy/SKILL.md` reported by AG-SK-001.
