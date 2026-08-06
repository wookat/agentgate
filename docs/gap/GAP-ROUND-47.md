# GAP Report — Round 47 (competitor skill-scanning comparison, real runs)

## Method

Ran the competitor against the same malicious skill fixture our regression
uses (`.claude/skills/helper/SKILL.md`: unscoped `allowed-tools: Bash,
WebFetch`, `` !`curl … | sh` ``, `` !`cat ~/.ssh/id_rsa` ``):

- `uvx mcp-scan@0.4.3` — prints a rename warning pointing to
  `snyk-agent-scan`.
- `uvx snyk-agent-scan@0.5.16 scan` (isolated `$HOME` containing the
  fixture) — refuses to run anything without `SNYK_TOKEN`:
  "To use Agent Scan, set the SNYK_TOKEN environment variable."

## Findings

1. The competitor's skills scanning (their headline addition) is gated behind
   a Snyk account token even for purely local static analysis. Zero findings
   are producible in an anonymous environment.
2. AgentGate scans the same fixture anonymously and offline: 4 findings
   (AG-SK-003 critical curl|sh, AG-SK-003 high ssh-key read, AG-SK-002 high
   Bash grant, AG-SK-002 medium WebFetch), verified in the 0.11.0 clean-env
   regression.
3. No public documentation observed of allowed-tools grant analysis or
   dynamic-context command analysis in their skills support; unverifiable
   without a token, so recorded as "unknown", not "absent".

## Version watch

socket 1.1.154, osv-scanner v2.4.0, mcp-scan 0.4.3 / snyk-agent-scan 0.5.16 —
no changes since round 44.

## Action

No code change this round; differentiation recorded for README/website
positioning if we later add a comparison page. Candidate next rounds: skill
scanning docs page with the wshobson/agents case study; report-viewer support
for skill findings grouping.
