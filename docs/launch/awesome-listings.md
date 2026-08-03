# Awesome-list / directory listing plan

> ⚠️ DO NOT SUBMIT — content package only. PRs to external repos are opened by the
> total lead per SOP-03, after v0.1 ships (most lists reject pre-release tools).
> Star counts verified via GitHub API on 2026-08-03.

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
