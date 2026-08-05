# GAP-ROUND-21 — advisory matching for PEP 508 range specs

Round type: maintenance (closes the round-14 leftover "PEP 508 range specs
are only flagged as unpinned, not normalized for advisory matching").

## Gap

`uvx gemini-bridge>=1.0` produced only the generic AG-SC-001 unpinned
finding: `serverPackageRef` kept the range operator in the package name
(`"gemini-bridge>=1.0"`), so neither the MCPA database nor OSV could match
it — even though gemini-bridge has a real advisory (MCPA-2026-0007) and an
unconstrained `>=1.0` launch can resolve to affected versions.

## Fix

`splitSpec` now recognizes PEP 508 range operators (`>=`, `<=`, `>`, `<`,
`!=`, `~=`), extras (`name[extra]`), and markers, yielding the bare package
name with no version. The existing unpinned-match path then applies: a
version-scoped advisory on an unpinned spec reports AG-SC-003 medium with a
"pin a fixed version" instruction, and OSV malware checks match the name too.

Verified: `uvx gemini-bridge>=1.0` now reports AG-SC-001 medium (unpinned)
plus AG-SC-003 medium (MCPA-2026-0007, pin advice); `gemini-bridge==1.3.1`
remains clean.

## Remaining known gaps

- Range specs are treated as "unpinned" rather than resolved against the
  advisory range (we don't compute whether `>=1.0` can resolve to an
  affected version — the pin instruction covers the actionable path).
- Unchanged: config convert `--out` target auto-discovery; curated offline
  coverage is a backstop.
