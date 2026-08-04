# Governance

AgentGate is an open-source project released under the Apache-2.0 license.
This document describes how the project is run today; it will evolve as the
contributor base grows.

## Roles

### Users
Anyone using AgentGate. Users are encouraged to file issues, propose advisories,
and join discussions.

### Contributors
Anyone who submits a PR, issue triage, advisory, or documentation improvement.
No sign-up needed — see [CONTRIBUTING.md](CONTRIBUTING.md).

### Maintainers
Maintainers have commit access, review/merge PRs, triage security reports, cut
releases, and steward the roadmap. Current maintainers are listed in the GitHub
repository's collaborator settings; the founding maintainer is
[@wookat](https://github.com/wookat).

**Becoming a maintainer:** consistent, high-quality contributions over time
(code, advisories, reviews) plus a nomination by an existing maintainer and no
objection from the other maintainers within one week.

**Stepping down / removal:** maintainers may step down at any time; a maintainer
inactive for 6+ months, or in serious violation of the
[Code of Conduct](CODE_OF_CONDUCT.md), may be removed by consensus of the other
maintainers.

## Decision making

- Day-to-day decisions (bug fixes, docs, small features) are made through normal
  PR review: one maintainer approval merges.
- Substantial changes (new CLI commands, lockfile/advisory schema changes,
  breaking changes, new dependencies) require an issue or `docs/spec/` proposal
  first, and consensus among maintainers ("lazy consensus": no objection within
  one week counts as agreement).
- The lockfile schema and other public contracts in [docs/spec/](docs/spec/) are
  versioned; breaking changes require a major version bump and a migration note.
- If consensus cannot be reached, the founding maintainer has the casting vote.

## Releases

Maintainers cut releases from `main` when CI is green. Versioning follows
[semver](https://semver.org). Security fixes are released as soon as a fix is
ready, with a coordinated advisory (see [SECURITY.md](SECURITY.md)).

## Advisory database

Entries in `advisories/` describe third-party MCP servers, so accuracy matters:
every entry must cite public sources, and takedown/correction requests are
handled by maintainers with priority within 72 hours.

## Changes to this document

Changes to governance are proposed by PR and require consensus of all
maintainers.
