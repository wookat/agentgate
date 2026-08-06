<div align="center">

# AgentGate

**扫描、锁定、门禁你的 MCP 服务器 —— MCP 时代的 `npm audit` + lockfile + CI 漂移门禁。**

[![CI](https://github.com/wookat/agentgate/actions/workflows/ci.yml/badge.svg)](https://github.com/wookat/agentgate/actions/workflows/ci.yml)
[![npm](https://img.shields.io/npm/v/mcp-agentgate)](https://www.npmjs.com/package/mcp-agentgate)
[![License: Apache-2.0](https://img.shields.io/badge/license-Apache--2.0-blue.svg)](LICENSE)
[![Node >= 22](https://img.shields.io/badge/node-%3E%3D22-brightgreen)](package.json)
[![MCP](https://img.shields.io/badge/Model%20Context%20Protocol-compatible-8A2BE2)](https://modelcontextprotocol.io)

[English](README.md) | 简体中文

<img src="docs/assets/demo.gif" alt="agentgate 演示：scan 发现硬编码凭证与未锁定包，lock 固定工具面，diff 捕获上游 rug-pull" width="900">

</div>

---

AgentGate 是面向 [Model Context Protocol](https://modelcontextprotocol.io) 服务器的开源信任与供应链门禁。真实事故已经发生：postmark-mcp 补丁版本植入 BCC 后门、mcp-remote RCE（CVE-2025-6514，CVSS 9.6），以及上游悄悄修改工具描述的"rug pull"——你的 Agent 每次连接都实时读取这些描述，而客户端不会通知你。现有工具各覆盖一角（见[竞品对比](docs/COMPARISON.md)），AgentGate 用一个工具闭环全部四步：

| 步骤 | 作用 |
|---|---|
| **Scan 扫描** | 静态 + 可选连接式分析：工具投毒（隐藏 Unicode、提示注入）、凭证泄露、SSRF/RCE 向量、过度授权组合 |
| **Lock 锁定** | 把 Agent 实际看到的工具面（名称、描述、输入 schema）固定进 `agentgate.lock`，防御 rug-pull |
| **Gate 门禁** | 与已批准基线有任何漂移即 CI 红灯；基于 diff 评审，而非二元允许/拒绝 |
| **Deps 依赖防护** | 拦截 AI 幻觉包（slopsquatting）与 typosquat 依赖 —— 安装前对 manifest *与源码 import* 做 npm/PyPI 实时核验 |
| **Advise 通报** | 与[公开结构化 MCP 安全通报数据库](advisories/)自动比对 |

## 快速开始

npm 包名为 **`mcp-agentgate`**（`agentgate` 被占用），安装后命令仍是 **`agentgate`**：

```bash
npm i -g mcp-agentgate   # 或直接 npx mcp-agentgate <命令>

agentgate scan                 # 静态扫描本机 MCP 配置（自动发现 Claude / Cursor / VS Code / Codex / OpenCode）
agentgate scan --live          # 另外连接 stdio 服务器审计实时工具面
                               # （启动前会询问确认；CI 中加 --yes）
agentgate lock                 # 把当前工具面固定进 agentgate.lock
agentgate diff                 # 任何工具名/描述/schema 变化即退出码 1 + 可读 diff
agentgate ci --fail-on high    # CI 门禁：漂移或高危发现即非零退出
```

从源码开发：`git clone` 后 `pnpm install && pnpm build`，然后 `node packages/cli/dist/index.js`。文档站：**https://agentgate.zalize.com**。

扫描规则七大类，对齐真实事故：`tool-poisoning`、`credential-leak`、`overprivileged`、`auth-missing`、`ssrf`、`rce-vectors`、`supply-chain`。锁文件格式见 [docs/spec/agentgate.lock.schema.json](docs/spec/agentgate.lock.schema.json)。

## 一步接入 CI 门禁

```yaml
# .github/workflows/mcp-gate.yml
steps:
  - uses: actions/checkout@v4
  - uses: wookat/agentgate/packages/action@v0.8.0
    with:
      command: ci
```

SARIF 上传到 GitHub code scanning 及全部参数见 [packages/action](packages/action/)。

或使用 pre-commit 钩子：

```yaml
# .pre-commit-config.yaml
repos:
  - repo: https://github.com/wookat/agentgate
    rev: v0.8.0
    hooks:
      - id: agentgate-ci
```

## 兼容性

| 平台 | 状态 |
| --- | --- |
| Linux | 每个 PR CI 实测（`ubuntu-latest`） |
| macOS | 每个 PR CI 实测（`macos-latest`） |
| Windows | 每个 PR CI 实测（`windows-latest`） |
| Node.js | >= 22（`engines` 强制） |

完整测试套件（含真实 stdio MCP fixture server）在三个操作系统上跑 CI；客户端配置发现覆盖各 OS 下 Claude Desktop、Claude Code、Cursor、VS Code、Codex、OpenCode 的平台特定路径。

## 配置可移植转换

在各 MCP 客户端之间迁移配置，无需手工重写 JSON/TOML（官方 MCP 2026 路线图明确点名配置可移植性缺口）：

```bash
npx mcp-agentgate config convert --from cursor --to vscode --in .cursor/mcp.json --out .vscode/mcp.json
```

支持 Claude Desktop、Claude Code、Cursor、VS Code、Codex、OpenCode，任何有损转换都会显式告警。也可用独立包 [mcp-agentgate-config-convert](packages/config-convert/)。

## 为什么不只用扫描器（或只用 lockfile）？

扫描器只能发现"扫描当时"的已知恶意模式，看不到一周后悄悄变更的已批准服务器；lockfile 能抓漂移，却不判断你锁进去的东西本身是否安全。AgentGate 两者兼做，还叠加公开通报数据库比对。与 mcp-scan（现 Snyk Agent Scan）、Cisco MCP Scanner、MCTS、ToolPin、mcp-warden、两个 mcp-lock 的逐项对比（每项均核实过来源）：**[docs/COMPARISON.md](docs/COMPARISON.md)**。

## 仓库结构

```
packages/cli/            # agentgate CLI（scan / lock / diff / ci）       [路线 A]
packages/core/           # 规则引擎、锁文件规范实现                       [路线 A]
packages/action/         # GitHub Action                                  [路线 C]
packages/config-convert/ # MCP 客户端配置转换器                           [路线 C]
advisories/              # 公开 MCP 通报数据库（结构化 JSON）             [路线 B]
website/                 # 文档站 + 报告查看器（Cloudflare Pages）        [路线 B]
docs/                    # 规范与项目文档
```

## 参与贡献

欢迎 PR。跨模块接口（CLI JSON 输出、advisory schema、lockfile schema）定义在 [docs/spec/](docs/spec/)，改代码请在同一 PR 中同步更新规范。

## 许可证

[Apache-2.0](LICENSE)
