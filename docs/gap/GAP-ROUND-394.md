# GAP-ROUND-394 — routine windows + r393 residual verification (docs-only)

Date: 2026-08-10. Baseline: main f4b2b99 (post-#589, r393 precision fixes
merged). No code changes this round; no changeset.

## Advisory windows

- Authenticated advisory watch (GHSA + OSV sweep): "No uncovered
  MCP-related advisories found."
- OSV npm snapshot: ETag changed (`ad90cf94…`); full MAL set diff vs the
  r391 snapshot is exactly one new entry, **MAL-2026-13687**
  (npm `tokocrytodev`): C2-polling RCE loop + SSH/wallet private-key
  stealer + ETH drainer. Zero MCP/agent/skill/client keyword hits in the
  record; not an MCP/agent-surface package — no AgentGate advisory
  warranted without separate evidence.
- OSV PyPI snapshot: ETag changed (`47668b29…`) but the MAL id set is
  identical to the r393 snapshot (11,638 both sides, empty diff).
- Client version window: nine clients unchanged (Claude Code v2.1.226,
  Gemini CLI v0.54.4, Copilot CLI v1.0.78, Crush v0.88.1, Qwen Code
  v0.21.8, Codex rust-v0.147.0, OpenCode 1.18.16, Amp and Goose current)
  — no new config-surface changes to cover.
- Production consistency: advisory API and JSON feed both serve 109
  entries, matching the repository.

## r393 residual verification (main @ #589)

- AG-RC-001 medium (36): re-inspected line-by-line against the corpus.
  Real dynamic-exec call sites (`exec(\`taskkill …\`)`,
  `execSync(\`hermes profile list\`)`, an intentional `eval(expression)`
  FORBIDDEN fixture) and cautious-worded non-executable curl|sh text
  hits (installer hint strings, security-tool recommendation text) are
  rule-semantically correct. The five `code-exec (…)` tool-scout hits and
  the podcast-generator `olmo-eval` hit are removed by the merged r393
  fix (verified in the head-to-head).
- AG-AM-001 medium (95): 87/95 are one repo's generated per-agent
  configs all pointing at the same unauthenticated remote MCP endpoint
  (cortex.joai.ai); the rest are well-known public endpoints
  (mcp.figma.com, mcp.deepwiki.com, developers.openai.com, mcp.grep.app).
  Rule semantics correct — verify-auth-out-of-band wording is apt.
- AG-SK-002 medium (57): all pre-approval grants (`Write`/`Edit`/
  `WebFetch`/`WebSearch` allowed-tools, Codex `approval_policy="never"`,
  sandbox network enables, Gemini auto_edit) — true positives by rule
  semantics.
- No new generalizable defect found. Residual singletons carried
  forward (each a distinct shape with one real sample; below the
  multiple-sample bar for a production change):
  - overmind-mcp `a2a_hub.ts:20` — block-comment prose mentioning
    `execSync('curl')` inside a JSDoc list item.
  - cmuxlayer `proxy.ts:1311` — space-preceded prose `exec (` in a `//`
    comment.
  - heddle `server.py:203` — backtick-quoted ``exec()`` in a Python
    docstring.
  - Prior carried singletons unchanged (beetroot cmdline prose, ValueOS
    canary, canary.py SSH template, rules.ts pipeline-text title).

## Conclusion

Honest no-defect round: three windows clear, residual mediums verified
as rule-semantic true positives, no production change justified.
