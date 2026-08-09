# GAP-ROUND-355 — advisory window + CI-config source-scan consistency

## Advisory window (honest zero)

- Authenticated GHSA/malware watch rerun: `No uncovered MCP-related advisories
  found.` (The first run 403'd — the persisted watch-env file was gone; rerun
  with a fresh `gh auth token` succeeded.)
- OSV export snapshots unchanged from r353: npm ETag
  `e31fe9a28baffdba3bc7ffea32444eec`, PyPI ETag
  `c18a1fdc907aaad79020460210c73922`.

## Fixed: CI pipeline configs of other CI systems were source-scanned

r353 corpus criticals review showed `.gitlab-ci.yml` files reporting curl|sh
criticals (Nexus-Mods/Vortex top level; a gstack-vendored copy under
`.claude/skills/`) while the *same* content in `.github/workflows/*.yml` has
been exempt since r124 — build automation is not MCP server source and its
install steps are routine. The exemption now covers the equivalent configs of
the other mainstream CI systems: `.gitlab-ci.yml`, `.circleci/config.yml`,
`azure-pipelines*.yml`, `.buildkite/*.yml`, `.travis.yml`,
`bitbucket-pipelines.yml`, `.drone.yml`, `appveyor.yml`, `cloudbuild.yaml`
(any depth, matching the nested-`.github` handling from r353). Skill files are
unaffected; ordinary sources with the same content still report.

## Head-to-head

- r353 corpus: exactly the 2 `.gitlab-ci.yml` criticals removed, 0 added.
- r343 corpus: zero difference.

## Remaining r353 criticals — verified true positives

The other 20 AG-RC-001 criticals are genuine curl|sh in install/setup shell
scripts (`install.sh`, `scripts/doctor.sh`, action.yml templates in vendored
`github/` directories without the dot, skill-referenced deployment YAML) —
executable or agent-readable surfaces where the pattern is the rule's intent.
