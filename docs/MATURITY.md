# 成熟产品升级清单（Wave 2 · 总负责人下达）

基准：OpenSSF Best Practices Badge（passing→silver）、npm 生态发布工程惯例、头部开源工具（vllm/ollama/biome 等）的共性。目标：达到「用户敢在生产 CI 里跑」的可信度。验收以本清单逐项对照。

## A · 工程与发布（路线 A）
- [ ] 发布工程：changesets（semver + CHANGELOG 自动化）、GitHub Actions 发布流水线、npm provenance（OIDC trusted publishing）、GitHub Release + 产物签名
- [ ] 测试深化：核心覆盖率 ≥80% 并在 CI 强制；针对真实 MCP server（官方 SDK 示例 server）的端到端集成测试；快照测试锁定 `--json` 输出契约
- [ ] 健壮性：损坏配置/超时/不可连接 server 的优雅报错与 exit code 约定；`--debug` 诊断；大型配置性能可接受
- [ ] 供应链自卫：CI actions pin 到 SHA、依赖锁定、SECURITY.md（漏洞披露流程）、agentgate 自己扫自己（dogfood 在 CI 跑 agentgate ci）
- [ ] lockfile 规范 v1 冻结：版本字段 + 迁移策略，schema 发布到网站

## B · 平台与文档（路线 B）
- [ ] 文档完整性：任务导向指南（CI 集成各平台配方、威胁模型、规则参考逐条文档、FAQ、troubleshooting）；文档搜索；SEO/OG 卡片
- [ ] Advisory DB 产品化：收录扩充（≥15 条已核实）、社区提交流程（PR 模板+校验 CI）、RSS/JSON feed、网站可浏览可搜索
- [ ] 报告查看器打磨：可分享链接（无后端，URL/文件加载）、severity 过滤、移动端
- [ ] 无障碍（键盘/对比度/aria）与 Lighthouse ≥90（性能/可访问性/SEO）
- [ ] 站点切换主域 https://agentgate.zalize.com （已生效），全站内链与 canonical 更新

## C · 社区治理与增长（路线 C）
- [x] 治理文件：CONTRIBUTING.md、CODE_OF_CONDUCT.md、GOVERNANCE.md、SUPPORT.md、issue/PR 模板、ROADMAP.md（公开）（PR #16）
- [x] OpenSSF Best Practices Badge：逐条自评完成（docs/OPENSSF-SELF-ASSESSMENT.md）；bestpractices.dev 提交与 README 挂徽章待总负责人账号操作
- [x] 自动化：Dependabot（含 toolchain major 忽略规则）、stale bot 策略、release notes 模板（PR #18/#31）
- [x] 演示资产：终端演示 GIF（asciinema+agg）、README hero 图（PR #23）
- [x] 发布执行：稿件已刷新（PR #26）；awesome 列表收录 PR 按总负责人指令执行中（docs/launch/awesome-listings.md）

## 公共
- 一切走 PR + CI 绿后合并；跨路线接口以 docs/spec/ 为准。
- 每项完成在 PR 描述中引用本清单条目。
