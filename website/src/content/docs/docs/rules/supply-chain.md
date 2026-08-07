---
title: "AG-SC-001/002/003 · supply-chain"
description: Unpinned package execution, rug-pull-prone launch patterns, and known-bad server packages (OSV malware + AgentGate MCP advisories).
---

Detects launch patterns where "what runs today" is decided by the package registry, not by you.

## What it checks

**Config** (static), for servers launched via package runners (`npx`, `pnpx`, `pnpm dlx`, `bunx`, `uvx`, `pipx`):

- **Unpinned package spec** (`medium`) — `pkg`, `pkg@latest`, or any non-exact version: every launch fetches whatever is latest (rug-pull / compromised-release exposure). Exact versions (`pkg@1.2.3`) and commit-pinned git specs pass.
- **Auto-confirm installs** (`low`) — `-y`/`--yes` combined with an unpinned spec installs new upstream code silently.
- **Unpinned docker images** (`medium`) — `docker run image:latest` or tagless images without a `@sha256:` digest.
- **Unpinned OpenCode plugins** (`medium`) — npm packages in the `plugin` array of `opencode.json` are auto-installed by Bun and executed at startup; specs without an exact version fetch whatever is latest. Git-URL plugin specs (`pkg@git+https://…`) without a commit pin (`#<sha>`) report `medium` too. Local plugin files (`.opencode/plugins/`, `./…` paths) are loaded from the repo and not flagged here.
- **Claude Code plugins from mutable marketplaces** (`medium`) — `.claude/settings.json` can pre-enable plugins (`enabledPlugins`) from marketplaces declared in `extraKnownMarketplaces`; anyone who trusts the folder is prompted to install them, and plugins ship hooks, MCP servers, and skills. A git-based marketplace source without a `sha` or release-style `ref` fetches whatever the branch points at on every sync. Local `directory`/`file` sources and plugins that aren't auto-enabled are not flagged.
- **Mutable plugin sources in marketplace catalogs** (`medium`) — a repo that hosts a marketplace (`.claude-plugin/marketplace.json`) distributes each listed plugin from its `source`; a git-based source (`github`, `url`, `git-subdir`) with no `sha` and no release-style `ref` serves everyone who installs the plugin whatever the branch points at. Relative-path sources (plugin code lives inside the marketplace repo itself) are not flagged. Marketplace entries can also define a plugin entirely inline (`strict: false`): entry-level `mcpServers` are discovered and checked like any other MCP config (including advisory cross-checks), and entry-level `hooks` commands go through the dangerous-command classification described under [RCE vectors](/docs/rules/rce-vectors/).
- **Known-malicious server package** (`AG-SC-002`) — the launched package — and every npm plugin an OpenCode config auto-installs — is checked against [OSV.dev](https://osv.dev) known-malware advisories (`MAL-*`). A package that is malware in every version is `critical`; an advisory scoped to specific compromised releases is compared against the pinned version in the spec (unaffected = `low`, affected = `critical`, unpinned = `high`). Skipped with a warning when OSV.dev is unreachable.
- **MCP advisory database match** (`AG-SC-003`) — the launched package is also checked against the [AgentGate MCP advisory database](/advisories/) (`MCPA-*`), which covers vulnerabilities beyond malware (RCE, SSRF, path traversal, auth bypass in MCP servers). The database is bundled with the CLI, so this check works fully offline; when the network is available, the bundled copy is refreshed from the live [advisory API](https://github.com/wookat/agentgate/blob/main/docs/spec/advisory-api.md) so advisories published after your CLI release are still matched. A pinned version inside an advisory's affected range carries the advisory's severity; a version outside every range is not reported; an unpinned spec with a version-scoped advisory is `medium` ("pin a fixed version").

## Why it matters

The postmark-mcp backdoor ([MCPA-2025-0002](/advisories/mcpa-2025-0002/)) shipped in a routine version bump; every `npx postmark-mcp` user got it automatically. Pinning turns "whatever upstream published last night" into an explicit, reviewable upgrade.

## Fixing findings

- Pin exact versions: `npx -y postmark-mcp@1.0.15` → check the [advisory database](/advisories/) for known-bad versions first.
- Pin docker images by digest: `image@sha256:…`.
- Pair version pinning with [`agentgate lock`](/docs/cli/lock/): the version pin freezes the code you install, the lockfile freezes the tool surface you approve.
