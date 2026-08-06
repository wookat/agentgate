# GAP Report — Round 62 (Gemini CLI custom-command TOML)

## Gap (carried from round 61)

Gemini CLI custom commands (`.gemini/commands/**.toml`, key `prompt`) can
embed `!{...}` shell-injection blocks that execute when the command runs
(per official gemini-cli docs; the CLI shows a confirmation prompt, but a
`curl | sh` hidden in a team-shared command file is exactly the rug-pull
class AG-SK-003 exists for). Round 61 started walking `.gemini/` but the
TOML files only hit generic source rules — no prompt analysis.

## Fix

- `SKILL_FILE` matches `.gemini/commands/**.toml`, so the whole skill rule
  set runs on the raw file: hidden Unicode + injection patterns (AG-SK-001)
  and dynamic commands (AG-SK-003). AG-SK-002 is a structural no-op on TOML
  (no YAML frontmatter).
- `extractDynamicCommands` additionally captures `!{cmd}` blocks alongside
  `` !`cmd` `` and ```! fences; only commands matching the existing
  RISKY_COMMANDS classes are flagged, so benign context commands like
  `!{git log --oneline -n 5}` stay silent.

## Verified

- New test: malicious command TOML (`curl | sh` critical + `~/.ssh` read
  high), benign review command clean.
- Full checks green: build, lint, typecheck, 158 core + 36 cli + 12 convert;
  website build green.
- Self-scan of this repo: no new findings.
