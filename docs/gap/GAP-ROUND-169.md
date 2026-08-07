# GAP-ROUND-169 — FP sweep of rounds 161-168 surfaces on flagship repos

Date: 2026-08-08 · Round type: precision (real-corpus FP sweep)

## Corpus (5 repos, fresh shallow clones)

microsoft/vscode (14,000 scanned files), anthropics/claude-code,
anthropics/skills, obra/superpowers, Homebrew/brew.

## Sweep results for rounds 161-168 checks

- AG-SK-003 hooks/tasks (Kiro, Amazon Q, VS Code folderOpen, Cursor): 0 findings across all five — no noise from formatter/test hooks or benign folderOpen tasks.
- AG-SC-001 plugins/marketplaces (OpenCode npm + git-URL, Claude marketplaces): 0 findings — superpowers' own marketplace uses local sources; claude-code's marketplace likewise.
- Earlier-round checks on vscode unchanged vs the round-159 sweep baseline.

## Real FP found and fixed

anthropics/claude-code `plugins/security-guidance/hooks/llm.py` — a
security-review prompt that tells the model to REJECT requests to the
cloud metadata endpoint — reported AG-SS-001 high (metadata-endpoint
reference in a non-test path). Fix: when the matching line carries
blocking/defensive vocabulary (block/reject/deny/disallow/forbid/
refuse/prevent/must not/SSRF), report low with a "defensive context"
message instead of high. Plain references still report high
(`requests.get("http://169.254.…")` unchanged in tests).

Same defensive-context class as the round-161 guard-hook fix.

## Honest boundaries

- Line-local heuristic: an attacker could append the word "block" to an
  exfil line to get low instead of high (finding still reported).
- claude-code's AG-SK-002 hits (pre-approved Bash/Write in plugin
  commands) are true positives by rule semantics — Anthropic's own
  plugin commands do pre-approve unscoped Bash.

## Evidence

- Full suite green: core 243, cli 47, config-convert 24.
- Self-scan: 155 files, 17 findings (13 medium, 4 low) unchanged.
