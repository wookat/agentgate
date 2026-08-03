# V2EX 发帖草稿

> ⚠️ 请勿发布 —— 仅为内容包，一切对外发布由总负责人按 SOP-03 统一执行。
> 节点建议：「分享创造」（首选）或「程序员」。发布前按 v0.1 实际交付核对所有说法。

## 标题（二选一）

1. AgentGate：给 MCP 服务器做 npm audit + lockfile + CI 门禁的开源工具
2. 开源了一个 MCP 供应链安全门禁：扫描 + 锁定工具面 + CI 漂移即红

## 正文

大家现在给 Claude / Cursor / VS Code 加 MCP 服务器，基本都是复制一段 JSON 就完事。
但 MCP 的安全事故已经真实发生了：

- postmark-mcp 在一个补丁版本里植入了邮件 BCC 后门；
- mcp-remote 出过 CVSS 9.6 的 RCE（CVE-2025-6514）；
- 最隐蔽的是 rug pull：你批准过的服务器在上游悄悄改掉工具描述或参数 schema，
  Agent 每次连接都实时读取，而你的仓库里什么都没变，客户端也不会通知你。

现有工具各管一段：扫描器（Snyk Agent Scan、Cisco MCP Scanner、MCTS）没有锁文件和
漂移门禁；锁文件类（ToolPin、mcp-warden、mcp-lock）没有真正的安全扫描，也没有
通报数据库。我把逐项对比（每项都去读了对方 README/代码核实）放在了仓库的
docs/COMPARISON.md。

所以做了 AgentGate，一个 CLI 闭环四步：

- `agentgate scan`：静态 + 可选连接式扫描（工具投毒/隐藏 Unicode/提示注入、凭证泄露、SSRF/RCE 向量、过度授权组合）
- `agentgate lock`：把工具名、描述、输入 schema 哈希固定进 agentgate.lock
- `agentgate ci`：CI 里任何漂移即非零退出，输出可读 diff；配套 GitHub Action 和 pre-commit hook
- 通报比对：公开的结构化 MCP 安全通报数据库自动交叉检查

另外附带一个配置转换器，Claude Desktop / Claude Code / Cursor / VS Code / Codex /
OpenCode 的 MCP 配置互转（官方 MCP 2026 路线图点名的配置可移植性缺口）。

TypeScript + Node 22，Apache-2.0 开源：https://github.com/wookat/agentgate

中文 README 也有。欢迎拍砖，尤其想听大家对 lockfile schema 的意见（docs/spec/ 下有
JSON Schema，希望和其他工具收敛成通用格式而不是各搞一套）。

## 发布注意

- 发帖账号需有一定活跃度，新号发推广帖易被降权/移走。
- 首日在线回复评论；V2EX 用户对"纯营销"敏感，回复保持工程师口吻、直面质疑。
- 不要同日在多个节点重复发。
