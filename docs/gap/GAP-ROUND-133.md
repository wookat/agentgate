# GAP-ROUND-133 — legacy VS Code chat modes (.github/chatmodes)

Date: 2026-08-07 · Round type: instruction-surface coverage + real-corpus verification

## Gap (real evidence)

Round 132 covered the current `.github/agents/` location, but the legacy
chat-mode folder `.github/chatmodes/*.chatmode.md` is still loaded by
VS Code (docs note legacy `.chatmode.md` support; the mode→agent rename
in microsoft/vscode#272282 explicitly keeps reading `.github/chatmodes`)
and remains the *more common* layout in the wild — GitHub code search
shows e.g. KubeRocketCI/kuberocketai (12 chat modes), awesome-copilot
distributes modes in this format.

## What shipped

- `SKILL_FILE` matches `.github/chatmodes/**.chatmode.md` (only the
  documented `.chatmode.md` suffix — unlike `.github/agents/`, plain
  `.md` files here are not loaded as modes, so they are not scanned).
- Fixtures: poisoned chatmode → AG-SK-001 critical; benign plan mode and
  a stray notes.md → clean.

## Real-corpus verification (this build)

- KubeRocketCI/kuberocketai (12 real `.chatmode.md`): all walked; each
  reports one **low** AG-SK-001 — a `<instructions>` XML tag inside a
  fenced YAML block, the round-63 quoted-example downgrade working as
  designed ("likely quoted example content, review"). No high/critical
  noise.
- timothywarner/copilot-dev (1 chat mode): clean.
- maxim-saplin/llm_chess `.github/agents/*.md` (5 agent files, round-132
  surface): walked, zero false positives.

## Evidence

- Full suite green: core 211, cli 47, config-convert 24.
