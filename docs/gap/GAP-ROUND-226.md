# GAP-ROUND-226 — Crush `crushrc` coverage (closes the round-225 boundary)

Date: 2026-08-08
Round type: boundary close-out (GAP-ROUND-225)

## Surface (verified against official docs)

- https://github.com/charmbracelet/crush/blob/main/docs/config/README.md — `crushrc` "works like a `.bashrc`": a Bash program Crush executes with shell privileges before the UI appears. Lookup order: project `./.crushrc`, `./crushrc`, then `$XDG_CONFIG_HOME/crush/crushrc`. Docs explicitly call it "a trusted file. Guard it carefully."
- A checked-in `.crushrc`/`crushrc` therefore executes arbitrary Bash for anyone who opens the project in Crush — the highest-trust file the client reads.

## What was added

1. Repo scans include `crushrc`/`.crushrc` (extensionless, previously skipped by the extension gate) — all source rules run over the Bash content.
2. AG-RC-001 treats crushrc as an executable file: a piped remote download (`curl … | bash`) reports critical, not documentation-grade medium.
3. AG-SK-002 flags risky `permissions allow` command lines (same tool classification as round-225's `allowed_tools`: `bash` high, `edit`/`write` medium); commented-out lines skipped.

Not parsed (honest boundary): `mcp add`/`hook add`/`provider add` command lines are NOT reconstructed into discovered MCP servers — crushrc is a Bash program (variables, conditionals, `$VAR` expansion), and a line-based reconstruction would report a config the shell may never produce. Hook commands referenced by path are not followed (same boundary as every hook surface).

## Real-corpus evidence (fresh clones, 2026-08-08)

| Repo | File | Result |
| --- | --- | --- |
| eswat2/spec-cleanroom | `.crushrc` with `permissions allow view ls grep glob edit write multiedit bash` | AG-SK-002 high (`bash`) + medium ×2 (`edit`, `write`) — true positives; commented conservative variants correctly skipped |
| meowgorithm/dotfiles | `crush/crushrc` (`option`/`mcp add`/`hook add` lines, no `permissions allow`) | scanned, 0 findings (correct negative) |

Surface size: GitHub code search reports ~16 `crushrc`-named files (new format, mostly dotfiles); the file grows with Crush adoption and each one is arbitrary auto-executed Bash.

Full checks green: 333/47/24 tests, lint, typecheck, `git diff --check`; self-scan 19 findings unchanged.

## Remaining boundaries

- crushrc `mcp add` registrations don't enter server discovery/lockfile (see above); the JSON `mcp` map (round-225) remains the discovery surface.
- `permissions allow` classification is exact-name only (`bash`/`edit`/`write`); scoped syntax (`bash:execute`) and MCP tool names not classified.
- User-level `$XDG_CONFIG_HOME/crush/crushrc` is machine state, outside repo scans.
