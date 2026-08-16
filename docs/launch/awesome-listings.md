# Awesome-list / directory listing plan

> Status 2026-08-16: five fork branches `add-agentgate` are pushed and ready
> (targets 1/2/5/6/8 — see "Submission state" below). Opening the PRs is blocked:
> the session's fine-grained PAT can fork and push but gets HTTP 403 on
> "create pull request" against third-party repos. Targets 3–4 skipped
> (server-only lists, no tools section). Star counts verified via GitHub API on
> 2026-08-03.

## Target lists (priority order)

| # | Repo / site | Stars | Section to target | Notes |
|---|---|---|---|---|
| 1 | [Puliczek/awesome-mcp-security](https://github.com/Puliczek/awesome-mcp-security) | 725 | Tools / scanners | Best fit — security-specific list |
| 2 | [punkpeye/awesome-mcp-devtools](https://github.com/punkpeye/awesome-mcp-devtools) | 475 | Testing/utilities | Dev-tool list, exact category fit |
| 3 | [punkpeye/awesome-mcp-servers](https://github.com/punkpeye/awesome-mcp-servers) | 91,781 | Check for a "utilities/security" section | Biggest reach; AgentGate is not a server — only submit if a tools section exists, otherwise skip (don't force it) |
| 4 | [wong2/awesome-mcp-servers](https://github.com/wong2/awesome-mcp-servers) | 4,241 | Same caveat as #3 | |
| 5 | [appcypher/awesome-mcp-servers](https://github.com/appcypher/awesome-mcp-servers) | 5,732 | Same caveat as #3 | |
| 6 | [yzfly/Awesome-MCP-ZH](https://github.com/yzfly/Awesome-MCP-ZH) | 7,510 | 工具/安全 | Chinese audience; link README.zh-CN.md |
| 7 | [chatmcp/mcpso](https://mcp.so) | 2,097 (repo) | Directory submission form | Web directory, submit via site |
| 8 | [rohitg00/awesome-devops-mcp-servers](https://github.com/rohitg00/awesome-devops-mcp-servers) | 1,014 | CI/CD tooling | DevOps angle (Action + gate) |
| 9 | [hesreallyhim/awesome-claude-code](https://github.com/hesreallyhim/awesome-claude-code) | 52,424 | Tooling | **No PRs accepted.** Recommendations only via the web issue form (`gh` CLI explicitly forbidden), one resource at a time, and the maintainer states that submissions used as a promotion strategy are usually rejected. Eligible on the objective criteria (repo >14 days old, active commits). Owner action — see draft below. |

## Submission state (2026-08-16)

| Target | Branch | Compare URL (one click opens the PR form) | State |
|---|---|---|---|
| Puliczek/awesome-mcp-security | `wookat:add-agentgate` | https://github.com/Puliczek/awesome-mcp-security/pull/273 | PR opened (2026-08-16) |
| punkpeye/awesome-mcp-devtools | `wookat:add-agentgate` | https://github.com/punkpeye/awesome-mcp-devtools/pull/282 | PR opened (2026-08-16) |
| yzfly/Awesome-MCP-ZH | `wookat:add-agentgate` | https://github.com/yzfly/Awesome-MCP-ZH/pull/464 | PR opened (2026-08-16) |
| rohitg00/awesome-devops-mcp-servers | `wookat:add-agentgate` | https://github.com/rohitg00/awesome-devops-mcp-servers/pull/315 | PR opened (2026-08-16) |
| appcypher/awesome-mcp-servers | `wookat:add-agentgate` | (repository archived, PRs impossible) | skipped (archived) |
| mcp.so | — | https://mcp.so/submit | owner action (login required) |
| awesome-claude-code | — | https://github.com/hesreallyhim/awesome-claude-code/issues/new?template=recommend-resource.yml | owner action (web form, human required) |

Unblocking option: a classic PAT with the `public_repo` scope allows
`POST /repos/{owner}/{repo}/pulls` from the pushed fork branches; the
fine-grained token does not, regardless of its repository permissions.

## awesome-claude-code recommendation text (paste into the issue form)

- Resource name: `AgentGate`
- URL: `https://github.com/wookat/agentgate`
- Category: Tooling
- Description (one line, no emoji, no sales pitch): `Scans MCP server configs for
  tool poisoning and credential exposure, pins the approved tool surface into a
  lockfile, and fails CI or a pre-commit hook when a server's tools drift.`
- Author: submit as the maintainer (the list requires human submission).

Also non-list channels to queue: MCP GitHub Discussions, the MCP Discord community
showcase channel (verify current invite/rules at launch).

## Standard one-line entry (adapt to each list's format)

```markdown
- [AgentGate](https://github.com/wookat/agentgate) - Scan, lock, and CI-gate MCP servers: tool-poisoning/credential scanning, a tool-surface lockfile (rug-pull defense), drift-failing CI action, and a public advisory database. `TypeScript` `Apache-2.0`
```

Chinese variant (for Awesome-MCP-ZH):

```markdown
- [AgentGate](https://github.com/wookat/agentgate) - MCP 服务器供应链安全门禁：安全扫描 + 工具面锁文件（防 rug-pull）+ CI 漂移门禁 + 公开安全通报库。（TypeScript，Apache-2.0，含中文文档）
```

## PR checklist per list

1. Read the list's CONTRIBUTING.md and entry format (alphabetical order? category rules?).
2. One PR per list; title like `Add AgentGate (MCP security gate)`.
3. PR body: one-sentence description + why it fits the section + link to COMPARISON.md.
4. Never open PRs to multiple lists from the same commit/fork blindly — maintainers
   notice TOC-spam and it burns credibility.
