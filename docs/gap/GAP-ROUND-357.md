# GAP-ROUND-357 — client-version window + r356 residual highs

## Client-version window

All nine tracked clients unchanged: Claude Code 2.1.226, Gemini CLI 0.54.4,
Copilot CLI 1.0.78, OpenCode 1.18.15, Crush 0.88.1, Qwen Code 0.21.8,
Cline 3.0.52, goose v1.45.0, Codex rust-v0.147.0. No upstream semantics work
this round.

## r356 residual highs reviewed

427 highs: 415 AG-SK-002 (dominated by skill `allowed-tools: Bash`
pre-approvals and OpenCode `permission.bash: allow` — true per rule
semantics), 6 AG-CL-001 + 1 AG-SS-001 reviewed by hand. Four FP classes
verified against the actual repos:

1. **Vendored/versioned gitleaks config** — `gitleaks-port/gitleaks-v8.30.1.toml`
   quotes example keys in `[[rules.allowlists]]`; the r346 skip only matched
   `.gitleaks.toml` exactly. Now `gitleaks[…].toml` filenames skip too.
2. **`test-*.sh` hyphen convention** — `.opencode/scripts/test-stress-hooks.sh`
   / `test-contribute.sh` feed dummy `ghp_…`/`AIza…` strings to the very
   secret-blocking hooks under test; r334 covered `test_*` but not `test-*`.
   Now graded low.
3. **Local-issuer Supabase anon JWT** — `"iss":"supabase-local"` with
   `"role":"anon"` (local dev stack) missed the r351 publishable-JWT check
   which required `"iss":"supabase"` exactly. Now any `supabase*` issuer with
   role anon grades low.
4. **`restrict*` guard context (AG-SS-001)** — hol-guard's
   `restricted_archive_destination.py` defines `_METADATA_ADDRESSES` to reject
   them; the only nearby defensive markers are `restricted_*` module names.
   `restrict*` added to both the ±3-line word set and the 11-line blocklist
   identifier set.

Two remaining AG-CL-001 highs (hardcoded `AIza…` key in a committed script,
JWT captured into a tool) verified as true positives — unchanged.

## Head-to-head

- r356: exactly the 6 verified FPs high→low (one gitleaks hit removed
  entirely — scanner-config skip), nothing else changed.
- r353 and r343: zero difference.
