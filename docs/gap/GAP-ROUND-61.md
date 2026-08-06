# GAP Report — Round 61 (skill scanning parity for round-52 clients)

## Gap

Round 52 added MCP *config discovery* for Windsurf, Cline, and Gemini CLI,
but skill scanning (AG-SK-001/002/003) still only knew the Claude-family
layouts. Windsurf rules/workflows, Cline rules, and Cursor rule files are
executed verbatim as agent instructions — the exact threat class the skill
rules target — and were invisible to `agentgate scan`.

## Conventions added (verified against official docs)

- Windsurf: `.windsurf/rules/*.md`, `.windsurf/workflows/*.md`, root
  `.windsurfrules` (docs.devin.ai/windsurf).
- Cline: `.clinerules/` directory (`.md`/`.txt`) or single `.clinerules`
  file; Cline also auto-detects `.cursorrules`, so that root file is
  scanned too (docs.cline.bot/customization/cline-rules).
- Cursor: `.cursor/rules/*.mdc`.

Not added: Gemini CLI custom commands (`.gemini/commands/*.toml`) are TOML,
not markdown — the `.gemini` dot-dir is now walked so its files hit the
normal source rules, but TOML prompt-field analysis is future work.
Context files (`GEMINI.md`/`CLAUDE.md`/`AGENTS.md`) stay out of scope:
they are prose conventions with high FP risk for injection patterns.

## Real-repo FP sweep (2026-08-07)

- cline/prompts (36 real `.clinerules/*.md` files scanned): 0 findings.
- ichoosetoaccept/awesome-windsurf: 0 findings.
- Synthetic TP fixtures: injections in `.windsurf/workflows/`,
  `.clinerules/`, `.cursor/rules/*.mdc`, and `.windsurfrules` all report
  critical (new test).

## Verified

Full checks green: build, lint, typecheck, 157 core + 36 cli + 12 convert;
website build green.
