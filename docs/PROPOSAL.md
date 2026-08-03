# 项目一页纸：AgentGate — MCP 安全与信任门禁套件（开源）

## 背景与洞察（2025-08 ~ 2026-08 调研结论）
- GitHub Octoverse 2025：增长最快的 10 个仓库中 6 个是 AI 基础设施；MCP 标准 8 个月 37k star，是当前最强的开源浪潮。
- 官方 MCP 2026 路线图明确点名 4 大企业级缺口：**审计追踪、SSO 认证、网关行为、配置可移植性**——规范走扩展路线，落地工具真空期至少 12 个月。
- 真实事故已发生：postmark-mcp 补丁版本植入 BCC 后门、mcp-remote RCE（CVE-2025-6514，CVSS 9.6）、Azure MCP SSRF（CVE-2026-26118）、"rug-pull"（上游悄改工具描述/参数）。NSA 与 OWASP 已发布 MCP 加固指导。
- 竞品格局：mcp-scan/MCPScan/mcp-lock/toolpin/mcp-warden 等均为碎片化小工具（星数 5~30，各覆盖一角，无文档站、无 registry、无一体化体验）。**赛道热、需求真、无赢家——影响力窗口期。**

## 定位
AgentGate：MCP 时代的 `npm audit + package-lock + Dependabot` 三合一。一条命令完成：扫描（tool poisoning/凭证泄露/SSRF/RCE 向量）→ 锁定（工具面 hash 锁文件，防 rug-pull）→ 门禁（CI 漂移即红）→ 通报（公开 advisory 数据库自动比对）。比碎片竞品更完整、更好用、文档更好、开箱即用。

## 目标（成功指标）
- 3 个月 GitHub 1k+ star；进入 MCP 社区 awesome 列表与讨论区；被至少 3 个知名 MCP 客户端/服务器项目引用或集成。
- 成熟产品而非 demo：完整测试、CI、文档站、GitHub Action、advisory DB 上线。
- 商业化预留：开源核心 + 未来托管版（团队策略中心/组织审计面板）实现公司持续盈利。

## 三条并行路线（三位负责人）
1. **路线 A · 核心引擎**：TypeScript CLI `agentgate`（scan/lock/diff/ci 子命令），静态+连接式扫描规则引擎，锁文件规范（JSON Schema），npm 发布，测试覆盖。
2. **路线 B · 平台与文档**：文档站 + 官网（Cloudflare Pages，现代设计、移动端适配）、公开 MCP Advisory 数据库（结构化 JSON + Workers API）、HTML 扫描报告查看器。
3. **路线 C · 生态与增长**：GitHub Action、pre-commit hook、各客户端（Claude/Cursor/VS Code/Codex）配置自动发现与**配置可移植转换器**、README/多语文档打磨、对比评测与发布内容（HN/Reddit/V2EX 发布包）。

## 技术选型（遵循公司原则：最新主流、不造轮子）
TypeScript + Node 22、官方 @modelcontextprotocol/sdk、zod、vitest；网站 Astro Starlight + Tailwind；部署 Cloudflare Pages/Workers + D1/KV；许可证 Apache-2.0。

## 里程碑
- W1：仓库+骨架+锁文件规范草案；scan/lock 最小闭环可运行。
- W2：CI 门禁 + Action + advisory DB v1 + 文档站上线。
- W3：多客户端配置支持、报告查看器、竞品逐项对比达标 → 验收包。
- W4+：公开发布（SOP-03）、进入 SOP-05 运营迭代。

## 资源缺口（一次性申报，不阻塞）
- GitHub 组织/仓库名（默认在 wookat 下建 `agentgate`，如需独立 org 请告知）。
- 域名（建议 agentgate.dev 或 zalize.com 子域，默认先用 pages.dev）。
- npm 发布 token（发布阶段需要；此前用 dry-run）。

如无异议将按此执行。
