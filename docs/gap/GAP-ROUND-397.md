# GAP-ROUND-397 — fresh-corpus precision: loopback-only hook data posts

Date: 2026-08-03. Baseline: main `173ae92` (post #595, npm latest 0.67.48).

## Corpus

Seven agent/MCP surface-family repository searches (pushed:>2026-07-29), deduplicated
against all prior corpora: 1,670 candidates → 1,318 unseen → 140 selected and
shallow-cloned. Full scan with `agentgate scan -f json --fail-on never`:
867 findings (26 critical / 124 high / 402 medium / 315 low).

## Verification

- **All 26 critical inspected line-by-line** — all true positives kept: real remote
  installer pipelines executed by shell scripts, ansible tasks, snapcraft/goreleaser
  configs (bun, antigravity, iterm2, fnm, pixi, crystal, tailscale, project-own
  install.sh — 9 repos), an eval harness's generated `install.sh` outputs (11 files,
  live executable scripts), and an intentionally malicious SKILL.md fixture
  (instruction override + concealment, plugin-auditor test corpus).
- **High (124)**: 118 AG-SK-002 `allowed-tools: Bash` pre-approvals in real skill
  frontmatter (spot-checked across all 9 repos — genuine unscoped grants, semantically
  correct); 3 AG-SS-001 in a security scanner (attack-payload catalog `CWE-918:
  http://169.254.169.254/...`, post-exploitation template JSON — dual-use exploit
  material, kept hot; plus one `BANNED_HOSTS` denylist, see residual); 3 AG-SK-003
  (the fixed class below).
- **Medium sampled by rule** (AG-SK-002 263, AG-RC-001 73, AG-SC-001 61, AG-AM-001 5):
  quoted installer advice strings, agent-catalog install/update command registries,
  unpinned `@latest` MCP servers — all rule-semantically correct.
- **Low sampled by rule** (TP-001 hidden unicode in bundled JS, SK-001 quoted
  injection-pattern docs, RC-001 test-path/comment text, SS-001 defensive context,
  CL-001 fixture keys) — correct quiet grades.

## Generalized defect fixed

**AG-SK-003 graded loopback-only hook data posts as remote data sends.** A macOS
notch-notifier app (claude-notch) documents hooks that pipe event JSON to
`curl -X POST http://127.0.0.1:53127/... --data-binary @-` — a local daemon; nothing
leaves the machine, yet three hooks reported high with "sends data to a remote host".
Fix in `classifyRiskyCommand`: when the data-send pattern matches and **every** URL
literal in the command is loopback (`127.0.0.1`, `localhost`, `[::1]`), the command is
not a remote data send. A remote URL, a mixed loopback+remote pair, or no URL literal
at all (variable host) keeps the high grade. Focused regressions added (`rules.test.ts`):
loopback POST → clean; remote collector POST, mixed pair, `$COLLECTOR_URL` → still hot;
the r387 remote-collector fixture (agent-audit corpus) verified unchanged.

## Head-to-head

Full r397 corpus (140 repos) rescanned on the fix: diff is exactly the 3 claude-notch
AG-SK-003 high removals; zero other drift. Historical corpora grepped for the
data-send message class — the only other instance (r387 agent-audit
`https://collector.example.net` fixture) rescanned and stays high.

## Residual (not changed — singletons)

- `BANNED_HOSTS` denylist identifier (agentic-security verifier.js) reports AG-SS-001
  high: "banned" is missing from the defensive word list. Single sample; deferred until
  another independent sample appears.
- Security-scanner attack-payload catalogs (CWE-keyed payload maps, post-exploitation
  templates) stay high — dual-use exploit material, cautious grade kept.

No advisory-window work this round (r396 windows were clear; next routine round covers them).
