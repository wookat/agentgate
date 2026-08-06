# GAP Report — Round 41 (agent skill files were an unscanned surface)

## Gap

Competitor retest (snyk-agent-scan / mcp-scan 0.4.3, installed and run for
real this round) shows its scope is now "MCP servers, agents, **skills** and
tools" — while our repo scan skipped skill files entirely: markdown wasn't a
scanned extension and agent config dot-dirs (`.claude/`, `.agents/`, …) were
excluded from the walk. A poisoned `SKILL.md` ("ignore previous instructions",
hidden Unicode, exfiltration tags) is executed as agent instructions verbatim
— the same attack class as tool poisoning, on a surface we didn't look at.

Also observed: mcp-scan still requires SNYK_TOKEN + starting the servers, and
reported nothing statically for `mcp-remote@0.1.10` / `flyto-core==2.26.2`
without consent+token — our static advisory path remains a differentiator.

## Fixed

- New rule `AG-SK-001` (category `tool-poisoning`): checks skill files for
  hidden/invisible Unicode (with codepoint + line) and the shared
  prompt-injection patterns; all findings `critical`.
- Skill file = `SKILL.md` anywhere, or any `.md` under a `skills/` directory
  of `.agents/.claude/.cursor/.codex/.opencode` trees; the repo walker now
  descends into those dot-dirs. Ordinary markdown is never treated as a skill,
  and other source rules do not run on markdown (no new FP surface).
- SARIF: `AG-SK-001` security-severity 9.5; auto-declared in driver.rules.
- Docs: rules index row + AG-SK-001 section on the tool-poisoning page.

## Verified

- 3 new core tests (TP fixtures for injection + hidden Unicode + benign
  skills/README negative); suite 148 core + 34 cli green.
- Real CLI: crafted `.claude/skills/evil/SKILL.md` → 2 critical findings,
  `--fail-on high` exits 1; AgentGate self-scan unchanged (no AG-SK-001 hits,
  node_modules skills correctly skipped).

## Honest limits

- Injection patterns are the shared heuristic list — a skill written to evade
  them passes; this is a tripwire, not a classifier.
- Frontmatter/tool allowlists inside SKILL.md are not yet analyzed
  (e.g. an overprivileged `allowed-tools` grant) — candidate for a later round.
