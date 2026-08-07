# GAP-ROUND-170 — data checkpoint (rounds 161-169)

Date: 2026-08-08 · Round type: checkpoint (no code changes)

## Shipped since round 160

9 rounds, 9 feature/fix PRs (#261, #262, #264, #265, #267, #269, #271,
#273, #275) + 3 releases (0.41.0, 0.42.0, 0.43.0 — each tagged, GitHub
Release, auto-deploy verified, clean-cache regression) + 0.44.0 version
PR green at checkpoint time.

New coverage:

- **Auto-exec hooks (AG-SK-003)**: Kiro project hooks (161), Amazon Q
  agent hooks (162), VS Code `folderOpen` tasks + `allowAutomaticTasks`
  (163), Cursor project hooks (164) — one shared dangerous-command
  classifier across Claude/Kiro/Amazon Q/VS Code/Cursor.
- **Plugin supply chain (AG-SC-001/002/003)**: unpinned OpenCode npm
  plugins (165), unpinned git-URL OpenCode plugins (166), OSV/MCPA
  advisory checks for OpenCode npm plugins (167), Claude Code plugins
  auto-enabled from mutable marketplaces (168).
- **Precision**: guard-hook credential-read fix (161), PureEvilRepo
  true positive + benign folderOpen zero-FP (163), flagship-repo FP
  sweep with AG-SS-001 defensive-context downgrade (169).

## Data

- Tests: 234 → 243 core / 47 cli / 24 config-convert (314 total).
- Self-scan: 155 files, 17 findings (13 medium, 4 low), ~0.26 s.
- Advisories: 31 — repo, live API, and website feed all consistent
  (the 32nd repo JSON is `watch-ignore.json`, a config file).
- Real-corpus evidence this block: PureEvilRepo (VS Code folderOpen
  exfil PoC, 2 high), nx-console + ever-teams (mutable Claude
  marketplaces), NevermoreEngine (self-hosted marketplace, 3 medium,
  borderline), opencode-pair (5 unpinned plugins), superpowers repos
  (git-URL no pin); flagship sweeps (vscode 14k files, claude-code,
  skills, superpowers, brew, Homebrew, actualbudget, perseus, omi,
  canvas-ios, dd-trace-dotnet) — zero FP for new checks after fixes.
- Surface prevalence (GitHub code search): 3,584 tasks.json with
  folderOpen; 1,460 `.cursor/hooks.json`; 4,832 opencode.json with
  plugin; 5,104 settings.json with extraKnownMarketplaces.
- npm: mcp-agentgate 3,124 downloads/last month — flat vs round 160;
  distribution remains the biggest gap (unchanged, awaiting owner
  decision).

## Process notes

- Bot-pushed version-PR branches still land in `action_required`;
  workaround (empty-commit retrigger from maintainer account) now
  works reliably (#272, #274). One-click alternative remains a repo
  Actions approval-policy change (owner's call).
- 0.42.0 was published from main before its changesets were consumed;
  0.43.0 changelog and release notes explicitly note rounds 165/166
  code shipped in 0.42.0. Resolved; no data loss.

## Candidates for next rounds

- `.claude-plugin/marketplace.json` plugin-source sha pinning (thin
  real-world evidence so far — most real catalogs use local `./`
  sources; keep monitoring).
- Zed always_deny/confirm rule-chain simulation; Amazon Q
  autoAllowReadonly semantics; Kiro legacy `.kiro.hook`.
- Distribution/adoption work (npm downloads flat for two checkpoints).
