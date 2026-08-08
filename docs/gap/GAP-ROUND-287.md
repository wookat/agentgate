# GAP-ROUND-287 — new-surface check + website UX walkthrough

Round type: new-surface recon (last: 282) folded into a production UX
walkthrough (last full walkthrough: 272). Docs-only; no code changes.

## New-surface check: Claude Code 2.1.224 `archive` plugin source

Claude Code 2.1.224 added an `archive` plugin source (zip over HTTPS with
optional SHA-256 pinning). Verified against `packages/core/src/rules/supply-chain.ts`:
round 191 already covers `source: "archive"` — a missing/malformed `sha256`
is flagged by AG-SC-001 with "Pin the archive with a sha256 digest" advice,
and the pinned/unpinned pair is pinned by the round-191 regression test
(`flags unpinned npm and archive marketplace plugin sources`). No gap.

Also checked 2.1.223–2.1.226 changelog entries: `strictKnownMarketplaces` /
`blockedMarketplaces` owner wildcards, sandbox credential-masking options,
and `claude self-hosted-runner` are defensive or non-repo-carried settings —
no new scan surface.

## Production walkthrough after #424 (advisories 83 → 87)

All checks against the live site on 2026-08-08, real browser + scripted
viewport sweep (Playwright over CDP):

- Deploy: site 200; advisory API, JSON feed, and index all consistent at 87;
  the four new detail pages (mcpa-2026-0070..0073) all 200 and render
  severity/type pills, package table, aliases, references, timeline.
- Index: severity pill counts 35 critical / 32 high / 15 medium / 5 low
  (= 87); new entries sort first; severity filter updates the URL
  (`?severity=critical`) and the list; search (`?q=claude-token`) narrows to
  exactly the matching card.
- Responsive/dark-mode sweep: homepage, index, two new detail pages,
  comparison, quick-start at 375px and 1280px in both themes — zero
  horizontal overflow on all 24 combinations.
- Docs drift: the only hardcoded advisory count is the comparison page,
  already bumped to 87 in #424 and enforced by the round-255 CI gate; client
  lists are enforced by the round-273 gate. No stale copy found.

## Conclusion

No defects found; no production changes needed this round.
