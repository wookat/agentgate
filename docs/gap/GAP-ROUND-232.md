# GAP-ROUND-232 — Factory Droid client coverage (2026-08-08)

Round type: new client surface (Factory Droid, docs.factory.ai — MCP docs, hooks docs, repository customization docs verified 2026-08-08).

## What Factory Droid exposes (official docs)

- **MCP configs**: user `~/.factory/mcp.json` (written by `droid mcp add`), project `.factory/mcp.json` (committed and shared — docs explicitly warn against secrets in it). Standard top-level `mcpServers` map with `stdio`/`http`/`sse` types.
- **Hooks**: `.factory/hooks.json` (project) and `~/.factory/hooks.json` (user), legacy `.factory/hooks/hooks.json`; a `hooks` key in `settings.json` is also read. Same nested `{ Event: [{ matcher, hooks: [{ type: "command", command }] }] }` shape as Claude Code — commands run automatically at lifecycle events (session start, pre/post tool use, prompt submit).
- **Repository customization**: `.factory/skills/<name>/SKILL.md` skill trees, `.factory/commands/**.md` slash-command prompts, `.factory/droids/*.md` custom-droid system prompts — all loaded from the repo.

## What shipped

- `discovery.ts`: `factory` client — `~/.factory/mcp.json` (user) + `.factory/mcp.json` (project), reusing the standard `mcpServers-json` parser; full config rules + OSV/MCPA advisory cross-check + lockfile.
- `skill-poisoning.ts`: `FACTORY_HOOKS_FILE` (`hooks.json`, legacy `hooks/hooks.json`, `settings.json`) reusing `extractHookCommands()` + the shared risky-command classifier (AG-SK-003); `SKILL_FILE` extended with `.factory/(skills|commands|droids)/**.md` (AG-SK-001).
- `scanner.ts`: `.factory` added to `AGENT_DOT_DIRS` so the tree is walked.
- Docs: client lists in README, npm README, homepage, quick-start, troubleshooting, FAQ, scan reference, skills guide.

## Real-corpus verification (cloned 2026-08-08)

GitHub code search surface: 94 `.factory/mcp.json`, ~1,416 `.factory/droids/*.md`, 13 `.factory/hooks.json` files. Cloned and scanned 5 repos:

- **rjmurillo/ai-agents** (`.factory/mcp.json`, 3 servers): all discovered end-to-end — unpinned `git+https` uvx serena + unpinned `forgetful-ai` report AG-SC-001; remote `deepwiki` http server with no auth reports AG-AM-001. True signals.
- **freshtechbro/claudedesignskills** (34 real `.factory/skills` files incl. SKILL.md trees): 0 findings — no FP.
- **mrwogu/promptscript** (16 `.factory/skills` files, `.factory/commands/*.md`, JSONC `.factory/settings.json` with comments): `.factory` tree contributes 0 findings (its flagged SKILL.md copies live outside `.factory` and carry real `allowed-tools: Write` grants); commented JSONC settings parse cleanly — no FP.
- **subsy/ralph-tui** (3 `.factory/droids/*.md`, `settings.json`): 0 findings — benign droid prompts stay clean.
- **vincentkoc/dotfiles** (`.factory/mcp.json` + JSONC `settings.json` with `commandAllowlist`): `.factory` clean; repo's own `claw.sh` curl|sh critical is a pre-existing true signal.

Hook true-positives (curl|sh critical, credential-exfil pipe) covered by fixtures in `scanner.test.ts` — no public repo with a malicious `.factory/hooks.json` was found (13 total in the wild).

## Data

- Tests 406 → **412** (core 339 + cli 47 + convert 24 + advisory-watch fixtures unchanged); lint/typecheck/build green; website build green.
- Self-scan: 700 ms, findings unchanged (20); freshtechbro corpus scan 475 ms.

## Honest boundaries

- `settings.json` `commandAllowlist` (auto-allowed shell commands) and `autonomyLevel`/`autonomyMode` are not yet classified (AG-SK-002 candidate for a follow-up round).
- Factory plugin surfaces (`enabledPlugins`, `extraKnownMarketplaces` seen in the wild) are not modeled — semantics not yet verified against official docs.
- User-level `~/.factory/hooks.json` is machine state, not repo-carried; only covered when scanning a home directory explicitly.
