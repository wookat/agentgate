# GAP-ROUND-147 — VS Code terminal auto-approval map

Date: 2026-08-07 · Round type: overprivilege coverage (VS Code, follow-up to round-146 boundary)

## Source (official)

code.visualstudio.com/docs/copilot/reference/copilot-settings:
`chat.tools.terminal.autoApprove` — "Control which terminal commands
are auto-approved when using agents. Commands can be set to true
(auto-approve) or false (require approval). Regular expressions can be
used by wrapping patterns in / characters." VS Code's shipped default
map denies `rm`, `rmdir`, `del`, `kill`, `curl`, `wget`, `eval`,
`chmod`, `chown` — a repo turning those to true is opting into the
documented danger set.

## Gap

Round-146 covered only the blanket `chat.tools.*autoApprove` booleans;
the per-command map (~7,072 checked-in `.vscode/settings.json` files
per GitHub code search — far more common than the blanket toggle's
~270) was a recorded boundary.

## What shipped

- Catch-all regex rule (`"/.*/"`, `"/.+/"` and anchored variants) set
  to approve → high (arbitrary shell execution).
- Plain command key whose first word is in the default-deny list plus
  shells/privilege escalation (`sudo`, `sh`, `bash`, `powershell`,
  `iex`, ...) set to approve → medium, named in the message.
- Object form `{ "approve": true }` treated the same as `true`;
  `false` (re-denying) stays clean.

## Corpus verification (4 repos with real terminal.autoApprove maps)

- LogExpert, blog-code (jojoldu), oauth2-mock-server: scoped
  dotnet/git/npx/codex approvals → 0 findings (no FP).
- BabylonJS/Website: no map in the file → 0.
- True-positive shape (catch-all/`rm`/`curl` approvals) verified via
  fixtures; corpus search for `"rm": true` rate-limited on the code
  search API — recorded honestly rather than fabricated.

## Honest boundaries

- Non-catch-all regex keys (e.g. `/^git (status|show)/`) are not
  interpreted — only literal command words and catch-all patterns.
- `chat.tools.edits.autoApprove` glob map still unmodeled (candidate).
- Compound-command semantics (VS Code requires all subcommands to
  match) are not simulated; we judge keys, not command lines.

## Evidence

- Full suite green: core 222, cli 47, config-convert 24.
- Self-scan unchanged (17 findings).
