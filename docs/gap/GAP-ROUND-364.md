# GAP-ROUND-364 — r363 residual-high precision: camelCase denied identifiers, trigger-pattern tables, Firebase web configs, postman/ paths

Date: 2026-08-03

## Routine windows

- **Advisory watch (authenticated)**: zero uncovered MCP-related advisories.
- **OSV export snapshots**: npm ETag `e31fe9a28baffdba3bc7ffea32444eec`, PyPI ETag `36cb3f98fa8f620fac46a870562e0825` — both unchanged from round 363.
- **Client version window**: unchanged (Claude Code v2.1.226, Gemini CLI v0.54.4, Copilot CLI v1.0.78, OpenCode v1.18.15, Crush v0.88.1, Qwen Code v0.21.8, Goose v1.45.0, Codex rust-v0.147.0, Cline npm 3.0.52).

## Scope

Post-#531 pass over the r363 corpus residual highs: all 17 remaining AG-CL-001/AG-SS-001 high
findings inspected in source. AG-SK-002 highs (70) sampled: 65/70 are skill `allowed-tools: Bash`
pre-approvals — rule-semantics true positives per r354 analysis.

## Verified false-positive classes (fixed)

1. **AG-SS-001 — camelCase denied/blocked identifiers.** bottlerocket's SSM agent config lists
   the metadata IPs under `"DeniedPortForwardingRemoteIPs"` — a *blocking* control, but the
   defensive word sits at a camelCase boundary (`DeniedPort…`) that the word-boundary vocabulary
   cannot see. Fix: case-sensitive `\b(Denied|Deny|Blocked|Restricted)[A-Z]` in the near window.

2. **AG-SS-001 — safety trigger-pattern tables.** nexus-agents' `safety/trigger-patterns.ts`
   lists `pattern: '169.254.169.254'` in a rule table whose doc comment says "trigger patterns
   for network-related unsafe control actions" — detection-rule data, like a gitleaks config.
   Fix: `trigger[-_ ]?patterns?` joins the near-window vocabulary.

3. **AG-CL-001 — inline Firebase web-app configs.** An Angular `app.config.ts` embeds the
   client-distributable Firebase API key in `initializeApp({apiKey, authDomain:
   "….firebaseapp.com", messagingSenderId, …})` — same design as google-services.json (r359).
   Fix: an `AIza` match with `firebaseapp.com`/`messagingSenderId`/`authDomain` within ±5 lines
   grades low with the Firebase message.

4. **AG-CL-001 — postman/ directories.** dotCMS keeps API-test collections under
   `resources/postman/` in files not named `*.postman_collection.json` (`GraphQLTests.json`,
   sample key asserted via `pm.expect`). Fix: `postman/` joins the quiet test-path directory set.

## Verified true positives (unchanged)

- fak `gcp-glm-serve.sh`/`gcp-idle-reaper.sh`, Azure `aznhc_entrypoint.sh`/`azure_vm.py`, EDDI
  `provision-vm.sh`, aws `ec2MetadataClient.ts`: real metadata-endpoint use (advisory by design).
- entroly `_METADATA_HOSTS` enum: dual-use, kept per GAP-353.
- nesbox `metadata2/3.json` signed-URL JWTs, chorus `dev-https.js` PEM, haxtheweb youtube browse
  key in non-demo paths, fak evasion-corpus Slack token: real-shaped key material, kept high.

## Verification

- Head-to-head r363: exactly the 4 verified findings high→low; zero other deltas.
- Head-to-head r343/r353/r356/r359: byte-identical.
- Full suite green: 542 tests (2 new regression tests), build/lint/typecheck/diff-check clean.
