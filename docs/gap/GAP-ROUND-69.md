# GAP-ROUND-69 — drift never surfaced inline on the PR diff, and the no-drift message lied about v2 locks

Date: 2026-08-06

## How the gap was found (real evidence)

Round-66/67 output walkthrough of the CI gate under GitHub Actions:

1. Findings get workflow-command annotations (rounds 56/57) — but **lockfile
   drift entries did not**. `runCi()` only called `renderGitHubAnnotations()`
   for findings; a drift failure showed up solely in the job log. With
   lockfile v2, skill drift entries carry the exact changed file path — the
   ideal annotation target — and it was dropped.
2. Real run: `agentgate diff` against a v2 lock that pins only skill files
   prints `No drift: tool surface matches agentgate.lock.` — inaccurate:
   the skill files were what was checked.

## Fix (this round)

- `renderDriftAnnotations()`: one `::error` per drift entry with
  `title=agentgate drift (<kind>)`; skill entries include
  `file=<path>` so they land inline on the PR diff. Emitted by `ci` only
  under `GITHUB_ACTIONS=true` (same gating as findings annotations).
- No-drift message now reads `No drift: locked surface matches
  agentgate.lock.` — accurate for v1 (servers) and v2 (servers + skills).
- Test: end-to-end `ci` run with a drifted skill file under
  `GITHUB_ACTIONS=true` asserts
  `::error file=.claude/skills/deploy/SKILL.md,title=agentgate drift (skill-changed)::…`
  and exit 1. Full suite green (164 core + 38 cli + 12 config-convert).
- Website ci docs updated. Patch changesets for both packages.

## Remaining gaps (unchanged)

- GitHub Actions in major outage (githubstatus: "Partial System Outage");
  workflows for #132–#134 queued for hours — CI verification pending
  recovery.
- 0.15.0 version PR not yet generated (Release workflow queued).
- Marketplace publishing of the action still deferred; Cloudflare repo
  secrets absent; npm trusted publisher not configured.
