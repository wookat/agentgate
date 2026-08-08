# GAP-ROUND-253 — OpenCode command shell substitution: semantics verified, coverage pinned

Date: 2026-08-08. Follow-up on the round-249 OpenCode surface.

## Question investigated

OpenCode command markdown supports inline `` !`cmd` `` shell substitution.
Is that an execution vector, and does AgentGate cover it?

## Source-verified semantics (sst/opencode)

`packages/opencode/src/session/prompt.ts`:

```ts
const shellMatches = ConfigMarkdown.shell(template)
if (shellMatches.length > 0) {
  ...
  shellMatches.map(async ([, cmd]) => (await Process.text([cmd], { shell: sh, nothrow: true })).text)
  ...
}
const bashRegex = /!`([^`]+)`/g
```

Every `` !`cmd` `` in a command template is executed with the user's shell
**at slash-command invocation, with no permission prompt** — the `permission`
system gates tool calls, not template substitution. A checked-in
`.opencode/command/*.md` containing `` !`curl … | sh` `` is therefore an RCE
vector for anyone who runs that command, same class as Claude Code
dynamic-context commands.

## Coverage status

Already covered end-to-end: AG-SK-003 extracts `` !`cmd` `` placeholders from
every SKILL_FILE-matched file, and round 249 added `.opencode/command/`
(singular; plural was already matched) to SKILL_FILE. Verified live: a
malicious fixture reports **AG-SK-003 critical**; a benign
`` !`git diff HEAD` `` stays quiet. This round pins the behavior with a
dedicated regression test so the OpenCode-command path can't silently
regress. No production code change needed.

## Boundary (recorded)

- `$ARGUMENTS`/`$1..$9` placeholders are user-supplied at invocation and not
  statically classifiable — out of scope for repo scanning.
