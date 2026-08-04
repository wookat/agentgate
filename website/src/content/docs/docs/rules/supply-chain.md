---
title: "AG-SC-001 · supply-chain"
description: Unpinned package execution and rug-pull-prone launch patterns.
---

Detects launch patterns where "what runs today" is decided by the package registry, not by you.

## What it checks

**Config** (static), for servers launched via package runners (`npx`, `pnpx`, `pnpm dlx`, `bunx`, `uvx`, `pipx`):

- **Unpinned package spec** (`medium`) — `pkg`, `pkg@latest`, or any non-exact version: every launch fetches whatever is latest (rug-pull / compromised-release exposure). Exact versions (`pkg@1.2.3`) and commit-pinned git specs pass.
- **Auto-confirm installs** (`low`) — `-y`/`--yes` combined with an unpinned spec installs new upstream code silently.
- **Unpinned docker images** (`medium`) — `docker run image:latest` or tagless images without a `@sha256:` digest.

## Why it matters

The postmark-mcp backdoor ([MCPA-2025-0002](/advisories/mcpa-2025-0002/)) shipped in a routine version bump; every `npx postmark-mcp` user got it automatically. Pinning turns "whatever upstream published last night" into an explicit, reviewable upgrade.

## Fixing findings

- Pin exact versions: `npx -y postmark-mcp@1.0.15` → check the [advisory database](/advisories/) for known-bad versions first.
- Pin docker images by digest: `image@sha256:…`.
- Pair version pinning with [`agentgate lock`](/docs/cli/lock/): the version pin freezes the code you install, the lockfile freezes the tool surface you approve.
