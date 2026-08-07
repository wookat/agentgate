# GAP-ROUND-153 — VS Code edits.autoApprove glob map

Date: 2026-08-08 · Round type: overprivilege coverage (VS Code, round-147 boundary)

## Source (official)

code.visualstudio.com agent-sessions/security docs:
`chat.tools.edits.autoApprove` maps glob patterns to booleans;
sensitive files (workspace config, `.env`) normally require approval,
and the docs' own example combines `"**/*": true` with `false`
re-denies for `.vscode/*.json` and `.env`. The security guide
recommends the map specifically to *protect* sensitive files.

## Gap

Recorded as a candidate in GAP-ROUND-147/150. A checked-in catch-all
`true` with no re-denies (or an explicit `true` on a sensitive path)
lets the agent silently rewrite its own guardrails (settings,
workflows) or secrets. GitHub code search: 633 files with the key.

## What shipped

- `"**/*"`/`"**"`/`"*"`: true with no `false` entries in the map →
  medium.
- `true` on a glob containing a sensitive fragment (`.env`, `.vscode`,
  `.github`, `settings.json`, `.pem`, secret/credential) → medium.
- The documented safe pattern (catch-all + `false` re-denies) and
  protective `false` entries → not flagged.

## Severity rationale

Medium, not high: auto-applied edits still appear in the working tree
diff and undo stack (unlike terminal execution, which acts
immediately); the escalation requires a subsequent unnoticed commit.

## Corpus verification (4 repos with the real key)

- cmss13-devs/cmss13 (`"**/*": false`) → 0.
- Kentico/community-portal (protective re-denies only) → 0.
- jacwu/github-materials, av/harbor (docs-style catch-all + extensive
  `false` re-denies) → 0 from the new check; each reports one
  pre-existing true positive from other AG-SK-002 checks
  (`chat.tools.global.autoApprove: true` in github-materials, a bare
  `Write(*)` skill grant in harbor).
No repo in the sampled corpus tripped the new check — the flagged
shapes are the misconfigurations, and corpus confirms zero FPs on the
common safe shapes.

## Honest boundaries

- Glob semantics are not fully evaluated: a `true` catch-all combined
  with re-denies that do NOT actually cover .env/settings is treated
  as safe (any `false` suppresses); modeling glob coverage would need
  a matcher and a sensitive-file inventory (candidate).
- User-level (non-checked-in) settings are out of scope by design.

## Evidence

- Full suite green: core 226, cli 47, config-convert 24.
- Self-scan unchanged (17 findings).
