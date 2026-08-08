# GAP-ROUND-265 — wild-corpus verification of the rounds 262–264 convert adapters

Date: 2026-08-08 · Round type: precision/robustness sweep + 1 fix

## Corpus

GitHub code search, 30 files per surface fetched and parsed with the real
adapters (parse + render round-trip), 210 files total:

| Surface | Total hits | Sampled | Parsed OK | Servers |
|---|---|---|---|---|
| `.github/mcp.json` (copilot-cli) | 439 | 30 | 30 | 33 |
| `.crush.json` (crush) | 114 | 30 | 27 | 15 |
| `.factory/mcp.json` (factory) | 95 | 30 | 30 | 47 |
| `.junie/mcp/mcp.json` (junie) | 1,116 | 30 | 29 | 33 |
| `.qoder/settings.json` (qoder) | 126 | 30 | 29 | 0 |
| `.qwen/settings.json` (qwen-code) | 1,604 | 30 | 30 | 2 |
| `.config/goose/config.yaml` (goose) | 40 | 30 | 29 | 48 |

All parse failures are genuinely invalid inputs, correctly rejected with
readable errors (exit 2 semantics): 2 Chromium game resources coincidentally
named `*.crush.json`, 1 TS module with a `.crush.json.ts` suffix, 1 git-lfs
pointer file (junie), 1 YAML with duplicate map keys (goose), 1 JSONC qoder
settings file (comments; carried no `mcpServers`). Warning behavior verified
in the wild: goose builtin/platform skips + timeout/env_keys lossy warnings
(222 across 29 files), copilot-cli tools allowlists (6), crush timeout (1).

## Bug found and fixed: qwen-code remote notation

Qwen Code is a Gemini CLI fork; its official docs
(QwenLM/qwen-code `docs/users/features/mcp.md`) use Gemini CLI notation:
`httpUrl` for streamable HTTP, `url` for SSE. Round 264 wired `qwen-code` to
the standard `mcpServers` adapter, which silently dropped `httpUrl` remote
servers ("stdio server without a command") — one real wild example hit this
(context7 via `httpUrl`). Discovery was never affected (it normalizes both).

Fix: the Gemini CLI adapter is now a shared `geminiStyleAdapter` factory and
`qwen-code` reuses it, so `httpUrl`/`url` parse and render with the exact
fork semantics. Regression test added.

## Honest boundaries

- One wild `.factory/mcp.json` uses `serverUrl` (Antigravity's notation) —
  not in Factory's official schema (docs.factory.ai: `type`/`url`); the
  adapter honestly warns and drops rather than guessing.
- Wild `.qoder/settings.json` files are JSONC in one case; Qoder's official
  docs don't specify comment support, so the adapter stays strict JSON
  (readable error, exit 2) until official evidence appears.
- `.qwen/settings.json` search hits are dominated by settings files without
  `mcpServers` (0-server parses are correct, not misses).

## Validation

- Full suite green: config-convert 29 tests; lint/typecheck/build green.
- Corpus re-run after the fix: the wild `httpUrl` server now converts
  (verified `--from qwen-code --to claude-code` end-to-end).
