# GAP-ROUND-211 — OpenHands repository customization

## Face

OpenHands (All Hands AI) loads repository-specific customization from
`.openhands/` (official "Repository Customization" docs):

- `.openhands/skills/**.md` — preferred in current versions; `SKILL.md` per
  skill directory, auto-loaded as agent context.
- `.openhands/microagents/**.md` — legacy form, still supported;
  `repo.md` loads always, keyword-triggered microagents load on match.
- `.openhands/setup.sh` — executed automatically at session/runtime start.

Face evidence: GitHub code search ~5,872 files under `.openhands/skills`,
~246 markdown files under `.openhands/microagents`, ~114 `.openhands/setup.sh`.

## What changed

1. `SKILL_FILE` matches `.openhands/(skills|microagents)/**.md` — AG-SK-001
   injection/hidden-Unicode (+ AG-SK-002/003 processing where applicable).
2. `.openhands` added to walked agent dot-dirs, so `setup.sh` (and any other
   source files there) go through the source-scan rules — a `curl | sh` in a
   file that runs automatically at session start reports AG-RC-001 critical.

No new discovery surface: OpenHands has no repo-committed MCP config file
(`.openhands/mcp.json` count on GitHub: 0; MCP servers are configured in the
app/user `config.toml`, not carried by the repo).

## Corpus verification

- `All-Hands-AI/OpenHands` (official repo): its own `.openhands/setup.sh`
  pipes the uv installer (`curl -LsSf https://astral.sh/uv/install.sh | sh`) —
  reported AG-RC-001 critical. True positive by rule semantics (remote code
  piped to shell, auto-run at session start); recorded as an honest signal,
  not suppressed.
- `online-go/online-go.com` (real `.openhands/microagents/repo.md`): 0 skill
  findings — correctly quiet.
- `jikig-ai/soleur` (33 real `.openhands/skills/*/SKILL.md`): no new findings
  from the `.openhands` tree; its pre-existing findings come from
  `plugins/soleur/**` faces already covered in earlier rounds.
- `snowdreamtech/frp`: unchanged (install.sh doc-text medium only).

## Boundaries (recorded honestly)

- Keyword-trigger frontmatter (`triggers:`) is not modeled — all microagents
  are scanned regardless of trigger, which is the conservative right default.
- `.openhands/pre-commit.sh` / other hook scripts are covered only as generic
  source files (same boundary as all hook-referenced scripts).
- User-level `~/.openhands/` state is not project-carried, out of scope.

## Validation

- `pnpm build && pnpm lint && pnpm typecheck && pnpm test`: green
  (core 304 / cli 47 / config-convert 24).
- Self-scan: 18 findings (unchanged).
