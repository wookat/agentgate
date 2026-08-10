# GAP-ROUND-390 — data checkpoint (rounds 381-389)

## Block storyline

Rounds 381-389 ran a corpus-precision block with one advisory-quiet
stretch: five fresh 140-repo corpora with every critical and residual
AG-CL/SS/TP-001 high manually verified, producing narrow precision fixes
(fixture-tree server configs / delimited test-selfcheck filenames /
redaction test vectors r381; instrumental-credential exfiltration idiom
r383; bare curl|bash labels + sentence-crossing command lists r384;
pattern-list scalars / env placeholders / gitleaks baselines / IOC headers
/ test_ filenames r385; dockerfile-named sources / escaped pipes / //
comments / quoted test payloads / echoed installer hints / demo filenames
/ dangerous-host denylists r387; ascending-run dummies / cannot-target
defensive wording / continuation-arg diagnostics r389); one output
consistency fix (server-scoped finding files reported relative to the
scan root, r388); and two honest no-defect verification rounds (r382,
r386). The advisory window stayed clean the whole block — every OSV
npm/PyPI ETag change was fully triaged to non-MCP MAL entries; zero new
MCPA records (database steady at 109). v0.67.39 and v0.67.42 shipped and
were close-looped; 0.67.45 was versioned this round (#584) and awaits
publish.

## Measured data (2026-08-10, main @ #584)

- Tests: 608 (config-convert 30, core 518, cli 60) + 26 api, all green.
- Core coverage: statements 94.15%, branches 86.2% (gate ≥80%).
- Self-scan (dogfood): 238 source files, 23 findings, ~1.0 s wall
  (AG-RC-001 ×16, AG-SS-001 ×5, AG-CL-001 ×2 — net -1 vs r380 from the
  r381-389 precision work applying to our own fixtures; all expected
  self-hits).
- Advisory database: 109 entries; production consistent — API 109,
  website feed 109 items.
- Advisory window: authenticated watch clean; npm ETag changed once
  (r389: exactly one new MAL entry, `@ssgw/icon`, non-MCP); PyPI ETag
  changed twice (r386 + this round: six new MAL entries total —
  cubesat-upstream-driver, kotanku, btcflip, btcflx, kotoraka, pytablute
  — all non-MCP spellchecker/crypto campaigns).
- Client version window: nine clients unchanged (Claude Code v2.1.226,
  Gemini CLI v0.54.4, Copilot CLI v1.0.78, Crush v0.88.1, Qwen Code
  v0.21.8, Goose v1.45.0, Codex rust-v0.147.0, OpenCode 1.18.16, Cline
  3.0.52).

## Distribution

npm last-month downloads now report a moved window (2026-07-11 →
2026-08-09): **14,693 (cli) / 15,779 (core)** vs 11,996/12,929 in the
stale 07-10→08-08 window reported at r350-r380. The window finally
advanced, making this the first fresh data point since r350; the ~+23%
month-over-month level is consistent with continued CI usage but
attribution (real adoption vs mirror scanning) still cannot be determined
from npm counts alone.

## Remaining gaps

- Distribution attribution unchanged (r350).
- AG-SK-002 broad tool grants remain the largest severity bucket in fresh
  corpora (280 high in r389); rule-semantic, sub-grading still a
  candidate.
- canary.py SSH private-key template single instance (r385) and
  rules.ts rule-table title pipe text (r388) remain deliberately
  unfixed single-instance items.
- Runtime-concatenated fixture tokens (r389 kitbash) are out of scope for
  content-based placeholder checks.
- 0.67.45 versioned but unpublished; publish + closeout pending the SOP
  publish step.
