# GAP-ROUND-363 — fresh-corpus precision: guard declarations outside the window, truncated-run dummies, demo/postman paths

Date: 2026-08-03

## Routine windows

- **Advisory watch (authenticated)**: zero uncovered MCP-related advisories.
- **OSV export snapshots**: npm ETag `e31fe9a28baffdba3bc7ffea32444eec`, PyPI ETag `36cb3f98fa8f620fac46a870562e0825` — both unchanged from round 362.
- **Client version window**: unchanged (Claude Code v2.1.226, Gemini CLI v0.54.4, Copilot CLI v1.0.78, OpenCode v1.18.15, Crush v0.88.1, Qwen Code v0.21.8, Goose v1.45.0, Codex rust-v0.147.0, Cline npm 3.0.52).

## Fresh corpus

New 140-repo corpus (`/home/ubuntu/corpora/r363`) from GitHub code search over client-specific
agent-configuration surfaces (.zed/settings.json, .continue, .roo/rules, .kilocode, .trae/rules,
.junie, .warp, .amazonq, .goosehints, Copilot instructions, Windsurf rules, VS Code MCP config),
deduplicated against the r343/r353/r356/r358/r359 corpora. Full scan: 385 findings; every critical
(13) and every AG-CL-001/AG-SS-001 high (24 + 11) manually verified.

## Verified false-positive classes (fixed)

1. **AG-SS-001 — guard declarations outside the defensive window.** Private/blocked-range guard
   functions annotate the metadata range in a doc comment above the declaration
   (`isPrivateIPv4` in hashintel/hash `url-validation.ts`, comment 13 lines above) or a body
   comment below it (`isBlockedIPv4` in dxos `attach-image.ts`, 14 lines below) — both outside the
   generic ±3 / up-10 windows, so purely defensive SSRF guards reported high. Fix: a dedicated
   `is(Private|Blocked|Denied|Reserved|Internal)*` declaration-shape check (`name =` / `name(`)
   over a ±20-line window. Attack scripts that merely fetch the endpoint stay high (regression
   pinned; r343's 8 SSRF exploitation scripts unchanged in head-to-head).

2. **AG-CL-001 — sequential-run dummies with a truncated final run.** The r351 keyboard-run
   heuristic required the value to end exactly on a full run, so
   `sk-abcdef0123456789abcdef0123` (security-research fixtures in anthony-chaudhary/fak, 3 high)
   still reported. Fix: allow a truncated trailing run prefix (`abcd`, `0123`…). Also removes an
   all-counting `sk-123456789012345678901234` fixture (verified benign) from three r353 repos.

3. **AG-CL-001 — demo/ directories and Postman collections.** Nine real-shaped keys under
   `demo/` trees (haxtheweb sample appstores) and five sample JWTs inside
   `*.postman_collection.json` API-test suites (dotCMS) reported high. Fix: `demos?/` joins the
   existing quiet test-path set, and `.postman_collection.json` files are treated as test
   collections — still reported, low.

## Verified true positives (unchanged)

- 13 → 12 corpus criticals are genuine curl|sh installer pipelines in executable shell scripts
  (advisory by design). One (entroly `install.sh`) embeds curl|sh inside a *multi-line* quoted
  error-message string — a presentation-layer FP the single-line `maskInertQuotedStrings` cannot
  see; deferred honestly (quote pairing across lines in shell is unreliable; single occurrence).
- AG-SS-001 highs kept: Amazon Q's real `ec2MetadataClient.ts`, TailOpsMCP-style probes, and the
  `_METADATA_HOSTS` enum in entroly (dual-use, per GAP-353).
- chorus `dev-https.js` embedded PEM private key kept high (real key material, dev-only by intent).

## Verification

- Head-to-head r363 corpus: exactly the verified classes change (8 removals via placeholder skip,
  16 high→low); zero other deltas.
- Head-to-head r343/r356/r359: byte-identical. r353: 3 removals, all the same verified counting
  dummy fixture.
- Full suite green: 540 tests (2 new regression tests), build/lint/typecheck/diff-check clean.
