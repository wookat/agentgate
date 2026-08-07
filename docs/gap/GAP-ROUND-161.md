# GAP-ROUND-161 — Kiro project hooks command actions (AG-SK-003)

Date: 2026-08-08 · Round type: coverage gap (official-docs-verified)

## Gap

Kiro hooks (https://kiro.dev/docs/hooks/) are JSON files in
`.kiro/hooks/` that "activate automatically — no manual prompting
needed" when session events fire (SessionStart, PostFileSave,
PreToolUse, UserPromptSubmit, …). `action.type: "command"` runs a
shell command in the project root. They are checked in and run for
everyone who opens the project — the same threat shape as Claude Code
hooks (round 137), which we already cover. Kiro hook files were
scanned as JSON source but their commands were not analyzed.

## Change

`AG-SK-003.checkSource` now handles `.kiro/hooks/*.json`, running the
same RISKY_COMMANDS classifier as Claude hooks: remote-script pipes
(`curl … | sh`) report critical; data exfiltration (`curl -d`),
credential reads (`~/.ssh`, `.aws/credentials`), and `.env` reads
report high. Agent prompt actions and benign commands stay clean.
Both the documented v1 `hooks`-array schema and in-the-wild variants
(single hook at the file root; `action.type: "shell"`) are handled.

## Precision fix caught by the corpus

iamaanahmad/everything-kiro ships a *protective* PreToolUse guard hook
whose pwsh command pattern-matches `id_rsa`/`.pem` paths to *block*
writes — the bare credential-path pattern flagged it high. The
credential-read pattern now requires a read verb (`cat`, `grep`,
`Get-Content`, …) before the path, so guard hooks that merely mention
credential paths stay clean while real reads (`cat ~/.ssh/id_rsa`)
still report. This applies to Claude hooks and skill dynamic-context
commands too (shared classifier).

## Real corpus (6 repos with checked-in .kiro/hooks)

- cradlepoint/sdk-samples — SessionStart `python setup_env.py --quiet`
  command hook: clean (correct, local project script).
- gfargo/strut — agent-prompt hooks (both .json and legacy
  .kiro.hook): clean (correct, no shell commands).
- EngindalgaMaku/ebars — root-form `"type": "shell"` hook running
  `bash scripts/deploy-auto.sh`: clean (correct, project script).
- totoshko88/RustConn — agent-prompt hooks: clean.
- iamaanahmad/everything-kiro — protective guard hooks: clean after
  the precision fix (was a high FP).
- AlleyBo55/doraemon — guard/prefilter hooks: clean.
- GitHub code search: 139 files match PostFileSave under .kiro/hooks;
  265 command+trigger JSON files — the surface is in real use.

## Honest boundaries

- Legacy IDE `.kiro/hooks/*.kiro.hook` files (when/then schema,
  `askAgent` actions) are not analyzed: the observed corpus is
  agent-prompt only; the `.hook` extension is outside the source
  walk. Candidate if a command-typed legacy variant shows up.
- Agent prompt actions are not scanned for injection here; hook
  prompts are short imperatives, and grading prose risk would guess.

## Routine checks

- Advisory watch: no uncovered public MCP advisories in this sweep.
- Competitors: no relevant capability movement observed.

## Evidence

- Full suite green: core 234, cli 47, config-convert 24.
- Self-scan: 155 files, 17 findings (13 medium, 4 low) unchanged.
