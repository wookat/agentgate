# GAP-ROUND-156 — Cursor CLI sensitive-path Read/Write allows

Date: 2026-08-08 · Round type: overprivilege coverage (round-155 candidate)

## Gap (recorded in GAP-ROUND-155)

Round 155 covered catch-all Cursor CLI tokens but deliberately skipped
`Read(...)` allows pending a sensitive-path model. The official docs'
own deny examples (`Read(.env*)`, `Read(/etc/passwd)`, `Write(**/*.key)`,
`Write(**/.env*)`) show which paths Cursor considers dangerous; an
*allow* of the same shapes is pre-approved credential access.

## What shipped

`Read(...)`/`Write(...)` tokens in `permissions.allow` whose path
matches `.env`, `.pem`, `.key`, `.p12`, `.pfx`, `secret`, `credential`,
or `id_rsa` report medium (message says whether it reads or writes).
Other `Read` allows remain unflagged; exact-token deny precedence from
round 155 is unchanged.

## Corpus verification (round-155 corpus re-scan)

- tegojs/tego: `Read(.env*)`, `Read(*.key)`, `Read(*.pem)`,
  `Read(*.secret)` all appear in **deny** (protective) → still 0.
- Red-Hat-AI-Innovation-Team/sdg_hub: unchanged (1 medium, Write(**)).
- Dhravya/notty, Stoobly/stoobly-agent: unchanged.
- No public repo in the round-155 corpus allows secret reads — the
  check is a tripwire for the malicious/careless case, mirroring the
  VS Code sensitive-edits check (round 153).

## Honest boundaries

- Fragment heuristic, not a glob-semantics model: `Read(config/**)`
  that happens to cover `.env` files is not caught.
- Severity medium (not high): reads/writes surface in the session
  transcript, unlike silent shell execution.

## Evidence

- Full suite green: core 229, cli 47, config-convert 24.
- Self-scan: 17 findings (13 medium, 4 low) unchanged.
