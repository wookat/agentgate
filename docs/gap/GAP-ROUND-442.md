# GAP-ROUND-442 — advisory batch MCPA-2026-0097..0102 (110 → 116)

Routine advisory-watch round with real findings: six new advisories added to
the MCPA database.

## Advisory windows

- **Authenticated advisory watch** (GHSA + OSV, `api/scripts/watch.mjs`):
  two uncovered GHSA advisories, both verified against primary sources and
  recorded:
  - **MCPA-2026-0097** — `@guangnao/agent-proxy` (GHSA-p2xx-33v2-xwcj /
    MAL-2026-14047, versions 1.2.1, 1.4.0, 1.4.2): remote-controlled hub that
    enrolls installers' authenticated Claude/Codex sessions as worker nodes,
    with the hub endpoint reconstructed via XOR+base64.
  - **MCPA-2026-0098** — `@zapier/mcp-integration` (GHSA-659m-mwq2-jh49,
    versions 3.0.1–3.0.3): compromised by the Shai-Hulud "Second Coming" npm
    worm (token theft, GitHub exfiltration, npm propagation, Actions
    persistence, possible home-directory deletion). Clean latest observed
    upstream was 3.0.0.
- **OSV npm**: ETag changed (`"53128261…"` → `"404b285542a5539fe07ec8ccc766958d"`).
  Full-snapshot MAL diff against the r428 baseline: 219,359 → 219,693, 334 new
  IDs. Keyword triage surfaced 7 MCP/agent-vocabulary candidates; each was
  reviewed against the full MAL record and (where live) the npm registry:
  - **MCPA-2026-0099** — `mcp-util-helpers` 1.0.0 (MAL-2026-13880): preinstall
    credential/host recon POSTed to a webhook.site bucket plus an
    operator-controlled `cmd`/`url` remote-exec channel. Removed from npm.
  - **MCPA-2026-0100** — `cc-skills-helper` 1.0.0–1.0.6 (MAL-2026-13933 /
    codelake CLR-2026-3044): Claude Code skills-named Windows dropper —
    postinstall fetches C2 config from kiro-cheap.pro, downloads a
    password-protected ZIP, decrypts and spawns the contained .exe with a
    Defender-evasion stack. All seven versions still installable on npm
    (latest tag → 1.0.6) at recording time.
  - **MCPA-2026-0101** — `@kolbo/mcp` 1.57.1 (MAL-2026-13938): compromised
    release of a live MCP server (latest 1.72.2 unflagged) — an IIFE appended
    to src/auth.js resolves two C2 IPs from an Ethereum transaction, fetches
    XOR-encrypted second-stage JS and executes it via eval/detached spawn on
    the server's first authenticated request.
  - **MCPA-2026-0102** — `xrblocks-mcp` 6.3.1 (MAL-2026-13988): MCP-named
    postinstall beacon exfiltrating host identifiers to an author-controlled
    endpoint; self-labeled "security research canary". Recorded **high** (not
    critical): one-shot identification beacon, no credential theft or
    remote-exec channel. Removed from npm.
  - **Rejected**: `@nolimit-agent/linux-x64` (MAL-2026-13996) and
    `@nolimit-agent/win32-x64` (MAL-2026-13997) — GHSA boilerplate-only
    malware records for platform binaries of an unidentifiable product
    (npm pages replaced by security-holder; no description, repo, or payload
    detail); "agent" name alone does not establish an MCP/agent-facing
    mapping. Below the mapping bar.
- **OSV PyPI**: ETag changed (`"92148681…"` → `"55b2c6c720dddee69ac58d24f516c23c"`).
  Full-snapshot MAL diff against the r440 baseline: 11,647 → 11,650, exactly
  3 new IDs, all reviewed and rejected: MAL-2026-13756 `joule-sbx-poc`
  (pentest PoC reverse shell, PROBABLY_PENTEST), MAL-2026-13757 `telebot-pro`
  (Telegram Desktop tdata stealer, zero MCP/agent keywords), MAL-2026-14069
  `kb-ai` (dependency-confusion demo stub). Same rationale as the r434 dlmm
  and r440 rejections.
- **Client release window**: routine stable bumps since r440 — claude-code
  v2.1.227→v2.1.233, gemini-cli v0.54.4→v0.55.1, qwen-code v0.21.9→v0.21.12,
  crush v0.88.1→v0.89.0, copilot-cli v1.0.79→v1.0.80, zed v1.14.2→v1.15.0,
  opencode v1.18.16→v1.18.18, goose v1.45.0→v1.46.0; codex stable unchanged
  at rust-v0.147.0. Release notes reviewed for config-surface changes:
  zed/crush/gemini-cli changes are fixes to existing MCP surfaces.
  **goose v1.46.0 ships a new hooks feature (PreToolUse denial, Stop hook
  context) and open-plugins generalization with skills support** — a
  candidate new scan surface for a future surface round (goose hook commands
  are not yet classified by AG-SK-003).

## Production consistency

Website 200; advisory API 110; website feed (`items`) 110; npm latest →
0.67.61. Production stays at 110 until this batch merges and is deployed
(Actions-disabled period: deployment is manual and requires owner
authorization).

## r441 residual singletons (no second sample this round)

The two r441 singleton FP shapes (TOML i18n localization string containing a
curl|sh command, quoted grep pattern in a test-install script) remain
single-repo; this round introduced no new corpus and the advisory windows
surfaced no second sample. Below the two-repo bar. Carried.

## Verification

`node api/scripts/validate.mjs` (116 valid), `node
scripts/check-advisory-count.mjs` (116 across 4 files), bundle regenerated
via `packages/core/scripts/bundle-advisories.mjs`, full local
build/test/lint/typecheck green, and all six new records verified end-to-end
via `agentgate advisory check` against the local build.

## Disclosure

GitHub Actions remains unavailable; checks above ran locally/against live
endpoints. One patch changeset added for the six-advisory batch.
