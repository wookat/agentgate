# GAP-ROUND-351 — AG-CL-001 remaining-high triage on the r343 corpus

## Method

Nine-client version window checked first: no changes (claude-code v2.1.226,
gemini-cli v0.54.4, copilot-cli v1.0.78, opencode v1.18.15, crush v0.88.1,
qwen-code v0.21.8, goose v1.45.0, codex rust-v0.147.0, cline 3.0.52).

Then every remaining AG-CL-001 `high` on the 150-repo r343 corpus (8 findings)
was manually verified against the repo source.

## Verdicts

True positives (stay high):
- `AIzaSy…` Google API key hardcoded as an env fallback (flofaction-website) — real key material.
- signed storage-proxy URLs with embedded JWTs in captured data (SieuApp ×2) — real tokens.

False-positive classes fixed:
1. **Sequential-run dummies** — `sk-abcdef1234567890abcdef` in a
   crypto-audit demo script (×2 repos). A value whose body is built entirely
   from keyboard runs (`abcdef`/`1234567890`/`deadbeef`) is demo filler;
   now recognized by `isPlaceholder` (skipped everywhere placeholders are).
2. **`example:` values** — an OpenAPI schema's `example: eyJ…` sample JWT
   (koywe.openapi.yaml) reported high. Secret-shaped matches preceded by an
   `example:`/`examples:` key on the same line now report low.
3. **Supabase anon JWTs** — `SUPABASE_KEY = "eyJ…"` with payload
   `{"iss":"supabase","role":"anon"}` (×2 files). Supabase anon keys are
   designed to ship to clients (security comes from row-level security);
   now decoded and graded low with an RLS reminder. `service_role` JWTs
   stay high (regression-pinned).

## Head-to-head (r343 corpus, 150 repos)

- 4 high → removed (2 sequential dummies as placeholders — plus 2 low
  test-path sequential dummies also removed), 3 high → low (example value,
  2 anon JWTs). All verified by hand; no other rule output changed.

## Also triaged, honestly not changed

- AG-TP-001 highs (3): one browser-test bidi fixture missed by the test-path
  heuristic (`browser-tests/fixtures.mjs`), two bidi isolates inside scraped
  display names/titles in JSON data. Distinguishing data-borne isolates from
  Trojan-Source concealment reliably needs more evidence; deferred with notes.
- AG-SK-002 highs (1230): 1204 are `allowed-tools: Bash` pre-approvals —
  intended semantics, not false positives.
