# 三条并行路线与分工（项目负责人：本仓库总协调）

冲突时以本文件与 docs/PROPOSAL.md 为准。各路线负责人以独立分支 + PR 协作，PR 标题前缀 `[A]` `[B]` `[C]`。

## 路线 A · 核心引擎（负责人 A）
范围：`packages/core`、`packages/cli`
- TypeScript + Node 22 monorepo（pnpm workspaces），官方 @modelcontextprotocol/sdk、zod、vitest。
- `agentgate scan`：静态（配置/仓库）+ 连接式（stdio，`--live` 显式开启）扫描；规则引擎输出 JSON/SARIF/终端表格；规则类别对齐业界：tool-poisoning / credential-leak / overprivileged / auth-missing / ssrf / rce-vectors / supply-chain。
- `agentgate lock`：生成 `agentgate.lock`（覆盖工具名/描述/输入 schema 的 SHA-256；JSON Schema 规范文件放 docs/spec/）。
- `agentgate diff` / `agentgate ci`：对比漂移，非零退出码；输出人类可读 diff。
- 客户端配置自动发现：Claude/Cursor/VS Code/Codex/OpenCode 常见配置路径。
- 测试覆盖核心逻辑；npm 发布准备（发布 token 到位前用 dry-run）。

## 路线 B · 平台与文档（负责人 B）
范围：`website/`、`advisories/`、Workers API
- 文档站+官网：Astro Starlight + Tailwind，现代设计、移动端适配（验收硬指标），部署 Cloudflare Pages（先用 pages.dev）。
- 公开 MCP Advisory 数据库：`advisories/*.json`（结构化 schema：id/包名/版本范围/severity/类型/参考链接），含已知真实案例（mcp-remote CVE-2025-6514、postmark-mcp 后门、Azure MCP CVE-2026-26118 等，需逐条核实来源）。
- Workers API：按包名/版本查询 advisory（供 CLI `scan` 调用）。
- HTML 扫描报告查看器（静态页，读取 CLI 的 JSON 输出）。

## 路线 C · 生态与增长（负责人 C）
范围：`packages/action`、集成、内容
- GitHub Action（复用 CLI）、pre-commit hook。
- 配置可移植转换器：`agentgate config convert` 各 MCP 客户端配置互转（与 A 协调 CLI 接口，代码可先独立包）。
- README/文档打磨、英文为主 + 中文 README、对比表（vs mcp-scan/mcp-lock/toolpin/mcp-warden，逐项核实）。
- 发布内容包：HN/Reddit/V2EX 发帖草稿、awesome-mcp 收录 PR 清单（发布动作等总负责人统一指挥，勿自行对外发布）。

## 公共约定
- 许可证 Apache-2.0；不提交密钥；一切交付走 PR + CI（A 负责搭 CI 基础）。
- 每完成一个里程碑按 SOP-04 向项目负责人汇报（结论/证据/下一步/风险）。
- 跨路线接口（CLI JSON 输出格式、advisory schema、lockfile schema）变更须在 PR 中 @ 相关路线并在 docs/spec/ 更新。
