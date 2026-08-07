# GAP-ROUND-162 — Amazon Q CLI agent hooks command actions (AG-SK-003)

Date: 2026-08-08 · Round type: coverage gap (official-docs-verified)

## Gap

Amazon Q CLI agent files support a `hooks` field (official
agent-format docs in aws/amazon-q-developer-cli: "Commands run at
specific trigger points") — agentSpawn, userPromptSubmit, preToolUse,
postToolUse. We already scan `.amazonq/cli-agents/*.json` for
allowedTools overprivilege (rounds 151-152), but hook commands were
not analyzed, while the equivalent surfaces for Claude Code
(round 137) and Kiro (round 161) are.

## Change

`AG-SK-003.checkSource` extracts `{ trigger: [{ command }] }` entries
from the agent `hooks` field and runs the shared RISKY_COMMANDS
classifier: remote-script pipes critical; data exfiltration,
credential reads (read verb required, per round-161 precision fix),
and `.env` reads high.

## Real corpus (4 repos with checked-in cli-agents hooks)

- ahiho/instabuild — `git diff --name-only`, `find … package.json`
  context hooks: clean (correct).
- kongrawd/sample-qcli-org-role-access — `bash ~/.aws/amazonq/…/
  q-agent-aws-context.sh`, `aws configure list-profiles`: clean
  (correct — references an ~/.aws path but does not read credential
  files; the read-verb requirement keeps it clean).
- briananderson-xyz/ultimate-fantasy — `/knowledge update .`: clean.
- haramsong/service-for-apartment-… — echo banners: clean.
- GitHub code search: 37 cli-agents JSON files mention hooks.

## Honest boundaries

- No public repo with a malicious cli-agents hook was found in this
  sweep; true-positive behavior is covered by fixtures (same
  classifier as rounds 137/161, which have corpus true positives).
- `timeout_ms`/`cache_ttl_seconds`/`max_output_size` metadata is not
  interpreted; only the command string is classified.
- Legacy `.amazonq/agents/` (non-cli) locations are not scanned for
  hooks — not observed in the corpus.

## Routine checks

- Advisory watch: no uncovered public MCP advisories in this sweep.
- Competitors: no relevant capability movement observed.

## Evidence

- Full suite green: core 235, cli 47, config-convert 24.
- Self-scan: 155 files, 17 findings (13 medium, 4 low) unchanged.
