# GAP-ROUND-258 — precision sweep of the OpenCode startup-plugin surface

Date: 2026-08-08.

## Scope

Wild-corpus verification of round 257's AG-RC-001 startup-plugin
classification (plus a re-look at the rounds 254/256 OpenCode faces on the
same corpus). GitHub code search for `path:.opencode/plugin(s)` (ts+js),
235 unique repositories cloned (~/corpora/r258), all scanned with the
merged round-257 build.

## Results

- **AG-RC-001 startup-plugin findings: 23 across 15 repos, all true
  positives** — every flagged file really spawns processes from an
  auto-executed plugin (`execSync`/`spawnSync`/`child_process` exec), e.g.
  session-event bash runners, git-enforcement plugins (sandboxcom/gludd ×9),
  notification hooks. Message correctly frames them as "review what it
  runs" mediums; none claimed to be malicious.
- **AG-SK-002 on the same corpus: 1,269 findings (510 high / 759 medium)**,
  dominated by real unrestricted `bash`/`edit` allows in agent frontmatter
  and opencode.json (top repos: benbrastmckie/nvim 253,
  MichelKerkmeester 149). Spot-checks all true grants; scoped/deny/ask
  configs stay quiet.
- **AG-SC-001 remote instructions: 0 findings** — still no wild remote-URL
  `instructions` usage (consistent with round 256).

## Bug found and fixed

One false positive: the round-257 path regex used `\.[cm]?[jt]s$`, which
also matched `.mjs`/`.cjs`/`.mts`/`.cts`. OpenCode's loader glob is
`{plugin,plugins}/*.{ts,js}` only — a `*.test.node.mjs` helper in
sandboxcom/gludd's plugin dir was wrongly classified as auto-executed.
The regex now matches `.ts`/`.js` exactly; regression test covers the
`.mjs` case.

## State

Tests 433 (core 361, `.mjs` case folded into the round-257 test).
Self-scan 21 findings unchanged.
