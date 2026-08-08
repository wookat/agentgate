# GAP-ROUND-209 — JetBrains Junie (new client)

## Face

JetBrains Junie (the JetBrains AI coding agent, IDE plugin + Junie CLI) reads:

- **MCP configs** — user-level `~/.junie/mcp/mcp.json` and project-level
  `.junie/mcp/mcp.json` (standard `mcpServers` map; verified against the official
  JetBrains PhpStorm blog post on connecting MCP servers to Junie). Project-scope
  config is intended to be committed and shared.
- **Project guidelines** — `.junie/guidelines.md`, auto-loaded into every Junie
  task (JetBrains maintains an official `JetBrains/junie-guidelines` repo).

Face evidence: GitHub code search shows ~1,116 `.junie/mcp/mcp.json` files and
~2,360 `.junie/guidelines.md` files.

## What changed

1. Discovery: `junie` client — user + project `.junie/mcp/mcp.json`
   (`mcpServers-json` format), full config rule set + OSV/MCPA advisory checks.
2. Skill scanning: `.junie/guidelines.md` added to `SKILL_FILE`; `.junie` added
   to the walked agent dot-dirs. AG-SK-001 injection/hidden-Unicode applies.
3. Docs: scan/faq/skills-guide client lists updated.

## Corpus verification (real repos with `.junie/`)

- `koel/koel`, `nunomaduro/laravel-starter-kit`, `ploi/roadmap`: Junie MCP
  configs discovered (local `php artisan boost:mcp` servers — correctly quiet),
  real `guidelines.md` files scanned with 0 false positives.
- `JetBrains/junie-guidelines` (template repo): clean.
- `ploi/roadmap` AG-TP-001 low ×5 are hidden-Unicode hits in `lang/*.json`
  translation files (pre-existing rule; RTL/ZW chars in Farsi/Khmer/etc. locale
  data — quiet low severity, acceptable).

## Boundaries (recorded honestly)

- `.junie/skills/<name>/SKILL.md` (seen in `nunomaduro/laravel-starter-kit`) is
  already covered by the generic `SKILL.md` matcher; the sibling `rules/*.md`
  reference files are not independently skill-scanned (same boundary as other
  clients' reference trees).
- Client-list drift: README/homepage/quick-start client lists predate Qwen Code /
  Copilot CLI / Junie — a docs catch-up round candidate.
- `~/.junie/guidelines.md` user-level file is not project-carried, out of scope.

## Validation

- `pnpm build && pnpm lint && pnpm typecheck && pnpm test`: green
  (core 301 / cli 47 / config-convert 24).
- Self-scan: 18 findings (unchanged).
