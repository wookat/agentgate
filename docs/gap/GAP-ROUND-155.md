# GAP-ROUND-155 — Cursor CLI project permissions

Date: 2026-08-08 · Round type: overprivilege coverage (Cursor CLI)

## Source (official)

cursor.com/docs/cli/reference/permissions: permission tokens live in
`~/.cursor/cli-config.json` (global) or `<project>/.cursor/cli.json`
(project-specific, i.e. checked in). Token forms: `Shell(commandBase)`
(glob patterns supported), `Read(pathOrGlob)`, `Write(pathOrGlob)`,
`WebFetch(domainOrPattern)` — `WebFetch(*)` is documented "use with
caution" — and `Mcp(server:tool)` with `Mcp(*:*)` also "use with
caution". "Deny rules take precedence over allow rules."

## Gap

`.cursor` instruction trees were covered since round-61 and Cursor MCP
configs since the start, but the checked-in CLI permission surface was
never checked.

## What shipped

- `Shell(*)` / `Shell(*:*)` → high; `Mcp(*:*)` → high.
- Catch-all `Write(**)`-style tokens, `WebFetch(*)`, and whole-server
  `Mcp(server:*)` → medium.
- Scoped tokens (`Shell(git)`, `Write(src/**)`, any `Read(...)`) not
  flagged; a matching `permissions.deny` entry (whitespace-insensitive
  exact match) suppresses the allow.

## Corpus verification (4 real repos with .cursor/cli.json)

- Red-Hat-AI-Innovation-Team/sdg_hub: `Write(**)` in allow → 1 medium
  (true positive; its `Read(**)`, scoped Shell entries stay clean).
- Dhravya/notty: `Mcp(october-bus:*)` → 1 medium (whole-server).
- tegojs/tego: 40+ tightly scoped Shell/Read/Write tokens → 0.
- Stoobly/stoobly-agent: empty allow, deny-only → 0.

Setup note: research-only clones (no commits); hook configs noted but
not installed.

## Honest boundaries

- Deny precedence is modeled only as exact token match; a broader deny
  glob that covers a narrower allow (e.g. deny `Write(**)` vs allow
  `Write(src/**)`) is not evaluated — conservative direction: scoped
  allows are not flagged anyway.
- `Read(...)` allows (including `Read(**)` and `.env` reads) are not
  flagged this round — read-only exfil risk needs a sensitive-path
  model to avoid mass FPs (candidate).
- Global `~/.cursor/cli-config.json` is outside the project tree by
  design.

## Routine checks

- Advisory watch: no uncovered public MCP advisories (31 advisories,
  three sources consistent).
- Competitors: no releases affecting the comparison page.

## Evidence

- Full suite green: core 229, cli 47, config-convert 24.
- Self-scan: 17 findings (13 medium, 4 low — round-154 baseline).
