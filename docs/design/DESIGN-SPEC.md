# AgentGate 官网 + 文档站设计规范（DESIGN-SPEC）

> 适用范围：`website/`（Astro Starlight + Tailwind，Cloudflare Pages）。本规范可直接照做：所有 token 均以 CSS 自定义属性给出，Starlight 通过 [CSS custom properties 覆盖](https://starlight.astro.build/guides/css-and-tailwind/) 实现，landing 与报告查看器用自定义页面/组件实现。高保真原型见 `docs/design/prototype/landing.html`。
>
> 硬规则：**禁止用 emoji 作图标，一律内联 SVG（stroke 1.5px，24×24 viewBox，`currentColor`）**；移动端 390px 无横向滚动为验收硬指标。

## 1. 设计语言定位

- **定位**：现代开发者工具风（参考 Biome / Turborepo / Vitest 文档站的气质）——克制、精密、以代码与终端为视觉母题。
- **主题**：深色为默认主题，提供亮色主题切换（Starlight 内置 `data-theme` 切换，两套 token 都定义）。
- **气质关键词**：security（可信、稳重）、gate（门禁、通过/拦截的状态色语义）、terminal-native（等宽字体、终端窗口、diff 高亮作为核心视觉元素）。
- **品牌色**：青绿色（teal/emerald 区间）作为主色——安全工具常用绿色系表达"通过/可信"，同时与竞品（多为蓝/紫）区分。危险/漂移用红、警告用琥珀，构成 gate 语义三色。

## 2. 设计 Tokens

全部定义为 CSS 自定义属性，挂在 `:root`（暗色默认）与 `[data-theme='light']` 上。Starlight 的 `--sl-color-*` 变量映射到这些 token。

### 2.1 配色

| Token | 暗色（默认） | 亮色 | 用途 |
|---|---|---|---|
| `--ag-bg` | `#0B1120` | `#FFFFFF` | 页面背景 |
| `--ag-bg-subtle` | `#111A2E` | `#F6F8FB` | 卡片/分区底 |
| `--ag-bg-raised` | `#16203A` | `#FFFFFF` | 浮起卡片、代码窗口 |
| `--ag-border` | `#233045` | `#E2E8F0` | 边框/分隔线 |
| `--ag-text` | `#E6EDF6` | `#0F172A` | 正文 |
| `--ag-text-muted` | `#94A3B8` | `#475569` | 次要文字 |
| `--ag-accent` | `#2DD4BF` | `#0D9488` | 主色（链接、按钮、高亮） |
| `--ag-accent-strong` | `#5EEAD4` | `#0F766E` | hover/强调 |
| `--ag-accent-contrast` | `#042F2E` | `#FFFFFF` | 主色按钮上的文字 |
| `--ag-danger` | `#F87171` | `#DC2626` | 严重/漂移/critical |
| `--ag-warn` | `#FBBF24` | `#D97706` | 警告/medium |
| `--ag-ok` | `#34D399` | `#059669` | 通过/locked |
| `--ag-info` | `#60A5FA` | `#2563EB` | 信息/low |

Starlight 映射（放 `website/src/styles/custom.css`）：`--sl-color-accent: var(--ag-accent)`、`--sl-color-bg: var(--ag-bg)`、`--sl-color-text: var(--ag-text)`、`--sl-color-bg-nav/--sl-color-bg-sidebar: var(--ag-bg-subtle)`、`--sl-color-hairline: var(--ag-border)`。

对比度要求：正文对背景 ≥ 4.5:1，muted 文字 ≥ 4.5:1（上表已满足），大号标题 ≥ 3:1。

### 2.2 字体栈

```css
--ag-font-sans: "Inter", ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", "PingFang SC", "Noto Sans SC", sans-serif;
--ag-font-mono: "JetBrains Mono", ui-monospace, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace;
```

- Inter / JetBrains Mono 经 `@fontsource` 自托管（Astro 生态标准做法），禁止运行时 Google Fonts 请求。
- 命令、锁文件字段、hash、包名、CLI 输出一律 mono。

### 2.3 字号阶梯（rem，1rem=16px）

| Token | 值 | 行高 | 用途 |
|---|---|---|---|
| `--ag-text-xs` | 0.75rem | 1rem | 徽标、标签 |
| `--ag-text-sm` | 0.875rem | 1.25rem | 辅助说明、侧栏 |
| `--ag-text-base` | 1rem | 1.625rem | 正文 |
| `--ag-text-lg` | 1.125rem | 1.75rem | 引导段、卡片标题 |
| `--ag-text-xl` | 1.25rem | 1.75rem | 小节标题 |
| `--ag-text-2xl` | 1.5rem | 2rem | H3 |
| `--ag-text-3xl` | 1.875rem | 2.25rem | H2 / 分区标题 |
| `--ag-text-4xl` | 2.25rem | 2.5rem | 移动端 hero 标题 |
| `--ag-text-5xl` | 3rem | 1.1 | 桌面 hero 标题（`md:` 起用） |

### 2.4 间距

沿用 Tailwind 4px 基线（0.25rem 步进）。约定：

- 分区纵向留白：移动 `py-16`（4rem），桌面 `py-24`（6rem）。
- 内容容器：`max-w-6xl mx-auto px-4 sm:px-6 lg:px-8`。
- 卡片内边距 `p-6`；卡片网格间距 `gap-6`。
- 相邻文本块间距：标题-正文 `mt-4`，正文-CTA `mt-8`。

### 2.5 圆角

| Token | 值 | 用途 |
|---|---|---|
| `--ag-radius-sm` | 6px | 徽标、行内代码、小标签 |
| `--ag-radius-md` | 10px | 按钮、输入框 |
| `--ag-radius-lg` | 14px | 卡片、代码窗口 |
| `--ag-radius-full` | 9999px | pill 徽标 |

### 2.6 阴影

暗色主题阴影弱化、以边框+微光为主；亮色用常规投影。

```css
--ag-shadow-card: 0 1px 2px rgb(0 0 0 / .3), 0 0 0 1px var(--ag-border);        /* 暗色 */
--ag-shadow-card-light: 0 1px 3px rgb(15 23 42 / .08), 0 1px 2px rgb(15 23 42 / .06);
--ag-shadow-raised: 0 12px 32px rgb(0 0 0 / .35);                                /* 终端窗口/浮层 */
--ag-glow-accent: 0 0 40px rgb(45 212 191 / .18);                                /* hero 装饰光晕 */
```

### 2.7 动效

| Token | 值 | 用途 |
|---|---|---|
| `--ag-ease` | `cubic-bezier(0.22, 1, 0.36, 1)` | 统一缓动 |
| `--ag-dur-fast` | 150ms | hover、按钮、链接 |
| `--ag-dur-base` | 250ms | 卡片浮起、菜单展开 |
| `--ag-dur-slow` | 400ms | 入场淡入上移（仅 hero/首屏） |

规则：只动 `opacity`/`transform`；尊重 `prefers-reduced-motion: reduce`（关闭入场动画）；不做滚动劫持/视差。

## 3. Landing 页信息架构与分区线框

单页，自上而下 6 个分区。导航锚点：Features / Quick start / Advisories / Docs（外链文档站）/ GitHub。

### 3.1 Header（sticky）

- 高 64px，`backdrop-blur` + 半透明 `--ag-bg`，底部 1px `--ag-border`。
- 左：logo（盾+尖括号内联 SVG）+ "AgentGate" 字标。右（桌面）：Features / Quick start / Advisories / Docs 链接 + GitHub 图标按钮 + 主题切换。
- 移动（<768px）：右侧只留汉堡按钮，点击展开全宽下拉抽屉（列出全部链接，`--ag-dur-base` 展开）。

### 3.2 Hero

- 桌面：两栏 12 列网格，左 6 列文案、右 6 列终端演示窗口；移动：单列，终端窗口置于文案下方。
- 左栏：pill 徽标（"Open source · Apache-2.0"）→ H1（两行内，关键词 accent 渐变色）→ 一句副标（`npm audit + lockfile + CI gate for MCP` 类比）→ 双 CTA（实心 accent "Get started" + 描边 "GitHub"）→ 下方一行 mono 安装命令 `npm i -g agentgate`（带复制按钮）。
- 右栏：模拟终端窗口（`--ag-bg-raised`、红黄绿窗口点、mono 字体），展示 `agentgate scan` 输出：数行检查结果（ok 绿 / warn 琥珀 / danger 红）+ 退出摘要，体现 gate 语义三色。
- 背景装饰：顶部中央径向光晕（`--ag-glow-accent`）+ 细网格线，`pointer-events-none`，**必须 `overflow-hidden` 防横向滚动**。

### 3.3 Features（4 卡）

- 标题 "One loop, four gates" + 说明句。
- 网格：桌面 4 列（`lg:grid-cols-4`），平板 2 列，移动 1 列。
- 每卡：40px 圆角方形图标容器（内联 SVG：scan=雷达/放大镜、lock=挂锁、gate=盾+对勾、advise=数据库）→ 卡片标题（mono 小写命令名 `scan` / `lock` / `gate` / `advise`）→ 两行描述。
- hover：边框变 accent、`translateY(-2px)`，`--ag-dur-fast`。

### 3.4 Quick start

- 两栏（桌面）：左侧 3 步编号列表（Install → Scan & lock → Gate in CI，每步一句话），右侧代码窗口展示对应命令与 `agentgate.lock` 片段；移动单列，代码窗口在列表后。
- 代码窗口同终端样式，语法高亮只需 2 色（命令 accent、注释 muted）。

### 3.5 Advisory 数据库入口

- 单条横幅卡片（全宽、`--ag-bg-subtle`、大圆角）：左侧标题 "Public MCP advisory database" + 一句说明（结构化 JSON、免费 API、CLI 自动比对），右侧 CTA "Browse advisories"。
- 下方 3 个真实案例小卡（mono 的 advisory id + severity 徽标 + 一行摘要）：CVE-2025-6514（mcp-remote RCE，critical）、postmark-mcp 后门（critical）、CVE-2026-26118（Azure MCP SSRF，high）。severity 徽标用 pill + 语义色。

### 3.6 Footer

- 三列（移动折为单列）：品牌列（logo + 一句话 + Apache-2.0）；Docs 列（Getting started / CLI reference / Lockfile spec / Advisory schema）；Community 列（GitHub / Issues / Contributing）。
- 底部一行版权 + "Built for the MCP ecosystem"。

## 4. 文档站导航行为（Starlight）

- **侧栏结构**（`astro.config.mjs` sidebar）：Getting Started（Installation / Quick start）→ Guides（Scanning / Locking / CI gate / GitHub Action）→ Reference（CLI / Lockfile spec / Advisory schema / Workers API）→ Advisories（外链或索引页）。
- 侧栏视觉：背景 `--ag-bg-subtle`；当前项左侧 2px accent 竖条 + accent 文字；分组标题 `--ag-text-xs` 大写字距 0.05em。
- **移动端（<800px，Starlight 断点）**：使用 Starlight 内置行为——顶栏汉堡展开全屏侧栏抽屉；不自定义重写，只做配色覆盖。右侧 "On this page" 目录在移动端折叠为顶部下拉（Starlight 默认）。
- 顶栏与 landing Header 视觉一致（同 logo、同配色），保证官网↔文档站切换无跳感。
- 搜索用 Starlight 内置 Pagefind，样式随 token 自动生效。

## 5. 报告查看器页面布局建议

静态页（`website/` 内自定义 Astro 页面），读取 CLI 的 JSON 扫描输出（文件拖入或 URL 参数）。

- **布局**：顶部工具条（文件名 + 扫描时间 + "Load report" 按钮）→ 摘要行（4 个统计卡：critical/high/medium/low 计数，各用语义色）→ 主体两栏：左侧 findings 列表（可按 severity/类别过滤的筛选条），右侧选中 finding 详情（规则 id、severity、所在 server/tool、证据代码块、修复建议、advisory 链接）。
- **移动端**：两栏折叠为单列——列表项点击后详情以全屏抽屉滑入（`--ag-dur-base`），返回按钮回列表。
- severity 徽标、mono 字体、卡片样式全部复用第 2 节 token；无 JS 框架依赖倾向时可用少量原生 JS + Astro island。
- 空状态：居中内联 SVG（文档+放大镜）+ "Drop a scan report JSON here"。

## 6. 移动端（390px）适配硬指标

1. **无横向滚动**：`html,body { overflow-x: hidden }` 兜底，但根因治理——所有装饰性绝对定位元素放在 `overflow-hidden` 容器内；代码块 `overflow-x-auto`（块内滚动允许，页面级不允许）；长 mono 串（hash/包名）`break-all` 或块内滚动。
2. 触控目标 ≥ 44×44px（导航项、按钮、汉堡、复制按钮）。
3. hero 标题降为 `--ag-text-4xl`；分区留白降为 `py-16`；CTA 按钮全宽堆叠（`flex-col gap-3 w-full`，`sm:` 起并排）。
4. 表格（对比表、advisory 列表）外包 `overflow-x-auto` 容器。
5. 图片/终端窗口 `max-w-full`；网格一律从 `grid-cols-1` 起步再向上加列。
6. 字号不小于 14px（`--ag-text-sm`）；行内代码不因 mono 字体溢出容器。
7. 验收方式：DevTools 390×844 逐屏检查 `document.documentElement.scrollWidth <= 390`。

## 7. 实现落点（给路线 B 工程）

- `website/src/styles/custom.css`：第 2 节全部 token + Starlight 变量映射。
- `website/tailwind.config`（或 Tailwind v4 `@theme`）：把 token 暴露为 `colors.ag.*`、`fontFamily.sans/mono` 等工具类。
- landing 为 Starlight 项目里的自定义 splash 页（`template: splash` 或独立 Astro 页面）；Header/Footer 做成共享组件。
- 图标：统一 24×24、stroke 1.5、`currentColor` 的内联 SVG（可从 Lucide 拷贝路径），不引入图标字体。
