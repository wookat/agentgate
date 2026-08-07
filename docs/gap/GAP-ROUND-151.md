# GAP-ROUND-151 — Amazon Q CLI agent allowedTools

Date: 2026-08-08 · Round type: overprivilege coverage (Amazon Q)

## Source (official)

aws/amazon-q-developer-cli `docs/agent-format.md`: "The `allowedTools`
field specifies which tools can be used without prompting the user for
permission. This is a security feature that helps prevent unauthorized
tool usage." Entries: built-ins (`execute_bash`, `use_aws`, `fs_write`,
...), specific MCP tools (`@server/tool`), whole servers (`@server`),
and glob wildcards incl. `*`. `docs/built-in-tools.md`: `toolsSettings`
can scope tools via `allowedCommands` (execute_bash),
`allowedServices` (use_aws), `allowedPaths` (fs_write).

## Gap

Round-127 discovers project `.amazonq/cli-agents/*.json` for MCP
servers, but their permission surface (`allowedTools`) was never
checked. GitHub code search: 60 checked-in files with `allowedTools`.

## What shipped

- Catch-all `"*"` / `"@*"` / `"@*/*"` → high.
- Unscoped `execute_bash` / `use_aws` → high (arbitrary shell / AWS
  API without prompting); scoped by a non-empty matching toolsSettings
  allowlist → not flagged.
- Unscoped `fs_write` → medium.
- Whole-MCP-server allow (`@server`, `@server/*`) → medium.
- Read-only built-ins (`fs_read`, `introspect`, ...) and specific MCP
  tools (`@git/git_status`) are not flagged.

## Corpus verification (4 repos with real cli-agents files)

- aws-samples/sample-scribe-ai: `execute_bash` + `use_aws` unscoped →
  2 high; `fs_write` → medium; `@localdb/*` → medium (true positives).
- cremich/awesome-q-developer: whole-server `@fetch`/`@context7`/
  `@playwright` → 3 medium (genuine pre-approval of all their tools).
- mamezou-tech/aidd-demo: `fs_read` + `@fetch/fetch` → 0 findings.
- YoshiiRyo1/opsjaws-q-dev-handson: empty allowedTools with
  deniedCommands-only toolsSettings → 0 findings.

## Honest boundaries

- Glob wildcards other than the catch-alls (`fs_*`, `*_bash`) are not
  expanded against tool names; a glob that happens to match
  execute_bash escapes the high check (candidate).
- `autoAllowReadonly` semantics are not modeled.
- deniedCommands/deniedPaths partial mitigation does not downgrade an
  otherwise-unscoped approval (deny lists are bypassable variants).

## Evidence

- Full suite green: core 224, cli 47, config-convert 24.
- Self-scan unchanged (17 findings).
