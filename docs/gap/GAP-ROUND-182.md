# GAP-ROUND-182 — Claude Code plugin hooks (AG-SK-003)

Date: 2026-08-08 · Round type: coverage completion (round-181 follow-on)

## Surface

Official plugins reference: a plugin ships hook config in `hooks/hooks.json`
in the plugin root (or inline in `.claude-plugin/plugin.json`, whose `hooks`
field may also be a config path or array). Command hooks respond to the same
lifecycle events as user-defined hooks (SessionStart, PreToolUse, …) and run
automatically — unsandboxed — for everyone who installs the plugin. Round-181
made the scanner walk `.claude-plugin`, and marketplace plugin directories are
plain directories already walked, but their hook commands were never
classified.

## Change

- `hooks/hooks.json` and `.claude-plugin/plugin.json` (inline `hooks` object)
  join the shared AG-SK-003 hook-command pipeline (`extractHookCommands`, same
  nested shape as Claude settings hooks). Manifests whose `hooks` field is a
  path/array stay clean (the referenced file is caught by the file pattern
  when it is `hooks/hooks.json`; custom paths are a recorded boundary).
- Precision fix found via corpus: `classifyRiskyCommand` masks single-quoted
  literals printed by `echo`/`printf` before matching — buildwithclaude's
  budgetclaw plugin prints `echo '[… run: curl -fsSL … | sh]'` as an install
  hint; the pipe is inside a printed string, not a pipeline. Applies to all
  hook/task surfaces.

## Real corpus (10 repos, unmodified)

- r181 corpus (5 marketplace/plugin repos incl. anthropics official,
  buildwithclaude with 40+ plugin hook files) and r176 flagship corpus
  (perseus, dlt, openai/codex, rsyslog, WordPress-iOS): 0 AG-SK-003 findings
  after the echo fix; before it, budgetclaw's echo hint was a false critical.
- True positives are covered by unit fixtures (remote-script pipe critical,
  credential exfil high).

## Boundaries

- Custom hook-config paths in plugin.json (e.g. `"hooks": "./config/h.json"`)
  are not resolved; only the conventional `hooks/hooks.json` location and
  inline config are scanned.
- `http`/`mcp_tool`/`prompt`/`agent` hook types are not classified.
- The echo mask only covers single-quoted literals; double-quoted hints would
  still flag (none seen in corpus).

## Evidence

- Full suite green: core 260, cli 47, config-convert 24.
- Self-scan 155 files: 18 findings (14 medium, 4 low) — +1 vs. 17 because the
  new test fixture adds a literal curl|sh string to scanner.test.ts (same
  doc-style AG-RC-001 medium class as other test files); honest, not
  suppressed.
