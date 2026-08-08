# GAP-ROUND-269 — Kilo Code client coverage

## What was verified (authoritative sources)

Kilo Code is a Roo Code fork shipped as a VS Code extension
(`kilocode.kilo-code`). Semantics were verified against the official docs
repo ([Kilo-Org/docs](https://github.com/Kilo-Org/docs)) and the upstream
source ([Kilo-Org/kilocode](https://github.com/Kilo-Org/kilocode)) — no
guessed formats:

- **Project MCP config**: `.kilocode/mcp.json` and the newer
  `.kilo/mcp.json` (upstream `mcp-migrator.ts` reads both; `.kilo` has
  higher precedence). Standard `mcpServers` map with per-server
  `alwaysAllow` lists (Roo semantics; docs show `alwaysAllow` examples).
- **User-level MCP config**: VS Code globalStorage
  `kilocode.kilo-code/settings/mcp_settings.json` (upstream `paths.ts`
  confirms darwin/win32/linux locations, same layout as Roo/Cline).
- **Project rules**: `.kilocode/rules/`, mode-specific
  `.kilocode/rules-<mode>/`, legacy single-file `.kilocoderules` /
  `.kilocoderules-<mode>` (docs `advanced-usage/custom-rules.md`).
- **Workflows**: `.kilocode/workflows/*.md`, run as `/name.md` slash
  commands (docs `features/slash-commands/workflows.mdx`).
- **Custom modes**: `.kilocodemodes` (YAML or JSON;
  roleDefinition/customInstructions land in the system prompt — docs
  `features/custom-modes.md`).
- **System-prompt overrides**: `.kilocode/system-prompt-<mode-slug>`,
  extensionless, replaces the entire system prompt (docs
  `features/footgun-prompting.md`).

## What shipped

- Discovery: project `.kilocode/mcp.json` + `.kilo/mcp.json`, user-level
  globalStorage `mcp_settings.json` (all three platforms) — full rule
  pipeline (AG-CL/AM/OP/SC/SS) now sees Kilo servers.
- AG-SK-002: `alwaysAllow`/`autoApprove` classification shared with Roo
  Code (`"*"` high, destructive-looking tool names medium), messages name
  the actual client.
- AG-SK-001/002/003: Kilo project trees (`.kilocode/` + `.kilo/`) scanned —
  rules, rules-<mode>, workflows, `.kilocodemodes`, `.kilocoderules(-mode)`,
  `system-prompt-<slug>`.
- `config convert` gains `kilocode` (standard mcpServers adapter, auto
  covered by the all-adapter stdio round-trip test).

## Real-corpus verification

134 real GitHub repos (all of `filename:mcp.json path:.kilocode` first 80
plus 55 more from `.kilocodemodes` / `.kilocode/workflows` /
`.kilocode/rules` searches) cloned to `~/corpora/r269` and scanned:

- 62 repos produced Kilo-surface findings, 233 total — previously all
  invisible.
- AG-CL-001 high ×11: real hardcoded API keys in `.kilocode/mcp.json`
  (EXA, CONTEXT7, QDRANT, BRAVE, GEMINI keys; one JWT, one AIza key).
- AG-SK-002 medium ×10: real destructive auto-approvals (`execute_sql`,
  `execute_code`, `run_python`, `write_file`, `delete_entities`, ...).
  No wildcard `"*"` in the wild sample; wildcard path pinned by fixture.
- AG-SC-003 critical ×1 (n8n-mcp 2.12.2 → MCPA-2026-0018), high ×1,
  medium ×24 (mostly unpinned server-filesystem → MCPA-2025-0004/0005).
- AG-SC-001 ×174 (unpinned npx/uvx launches), AG-AM-001 plain-HTTP remote
  ×1 high, AG-OP-001 `/Users` root grant ×1 high.
- AG-SK-001 on wild Kilo rules/workflows/modes: 0 hits, 0 false positives
  (benign corpus; malicious paths pinned by fixtures).

## Honest boundaries

- `alwaysAllow` is documented for Kilo; `autoApprove` is inherited from the
  shared Roo classification (Kilo is a Roo fork) — conservative to keep,
  no wild `autoApprove` usage observed either way.
- Global `~/.kilocode` / `~/.kilo` rule trees (upstream `globalDirs()`) are
  outside repo scanning per the existing global-tree policy; the user-level
  MCP settings file IS discovered.
- Kilo's marketplace/cloud features and `.kilocode/mcp.json` inside
  installed extension trees are not modeled this round.
