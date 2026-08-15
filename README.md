# 李永慧 · 个人主页

基于 **React 19 + TypeScript + Vite** 的静态个人主页，含 WebGL「雨滴玻璃」
粒子特效。设计方向：**暗色编辑风** —— 暖墨黑底 + 香槟金点缀 + 大字号混排
（Syne / 思源宋体 / JetBrains Mono）。

## 本地预览

```bash
npm install
npm run dev
```

## 修改内容

只需编辑 `src/content.ts`：姓名、简介、走马灯关键词、关键成果、技能、经历、
项目、联系方式、GitHub 模块配置，以及 `particles`（雨滴数量/大小/动效参数）。
各组件直接消费这份类型化数据。

## 架构（React + TS，分层清晰）

```
index.html              粒子壳（#particle-root / #scroll-root）+ SEO / 无障碍
src/
  main.tsx              入口：先挂粒子，再挂 React
  App.tsx               根组件：区块编排 + 站点级副作用（title/meta）
  content.ts            唯一数据源（全量类型化）
  components/           展示组件（无业务逻辑）
    Header / Hero / Marquee / About / Work / Projects / OpenSource / Contact
    / Footer / Atmosphere / SectionHead
  hooks/                业务逻辑（副作用收敛）
    useGitHub（SWR + 自动刷新 + README 分析状态机）
    useReveal / useScrollProgress / useNavHighlight / useHeroSpotlight
  lib/                  与框架解耦的纯逻辑（可在 Node 单测）
    github.ts           GitHub 拉取 / README 提取 / 技术栈与语言分析（无 DOM）
    droplets.ts         粒子系统装配（capture / overlay / none 降级）
    particles/DropletsVanilla.ts  WebGL 雨滴引擎
    scroll.ts           锚点平滑滚动工具
  style.css / fonts.css 样式与自托管字体 @font-face
  public/github-data.json  构建期预取的 GitHub 快照（运行时只读它）
scripts/
  fetch-fonts.mjs       拉取并子集化字体（递归扫描 src + 数据文件，见下）
  fetch-github-data.mjs 预取 GitHub 数据生成静态 JSON（见下）
```

**约定**：组件只负责展示，副作用一律进 hooks，可测逻辑一律进 lib。

### GitHub 数据：构建期预取，运行时零配额（`scripts/fetch-github-data.mjs`）

**架构**：站点运行时**不再调用 GitHub API** —— `scripts/fetch-github-data.mjs`
在构建/CI 时用 GITHUB_TOKEN（配额 1000 次/小时）预取仓库、README、语言占比，
计算好一句话总结与技术栈，生成 `public/github-data.json`；页面只加载这个
静态文件。**访客与预览页面零 API 消耗，配额问题彻底消失**，语言占比也不用牺牲。

- **数据新鲜度**：`.github/workflows/deploy.yml` 定时（每 6 小时）重建部署；
  本地想刷新数据执行 `npm run github:data`；
- **复用同一套逻辑**：预取脚本直接复用 `lib/github.ts` 的纯函数与拉取管线
  （Node 原生 import TS），浏览器与 CI 行为一致；
- **运行时**：`hooks/useGitHub` 加载 JSON（sessionStorage 缓存即时首屏 +
  后台重新校验），刷新按钮只是重拉静态文件；
- **容错**：预取失败不阻断部署（保留旧数据文件）；数据文件缺失时页面给出
  明确提示；
- **配置**：`src/content.ts` 的 `github` 字段（username、exclude、featured、
  summaries、`skipReadmeWhenDescribed` 等）同时作用于预取脚本与展示。

### 粒子特效：三种模式（渐进增强）

`lib/droplets.ts` 按能力检测自动选择，页面内容永远真实可读：

1. **capture（完整版）**：需要实验性 html-in-canvas API（Chromium
   `chrome://flags/#canvas-draw-element` 或 Origin Trial）。页面渲染进
   canvas，雨滴会折射背后的内容 —— 原始效果。
2. **overlay（兜底版）**：任意支持 WebGL2 的浏览器。同一套雨滴着色器以
   固定玻璃层覆盖在正常 DOM 之上，内容仍是真实 DOM（可选中、可被读屏
   器读取、SEO 友好），滚动开销为零。绝大多数访问者会落到这一档。
3. **none**：无 WebGL2 时退化为普通页面，内容不受影响。

低端设备（< 4 核 / < 4GB 内存）与 `prefers-reduced-motion` 用户会自动
跳过 capture 模式。

### 字体：自托管 + 子集化

页面文案会出现在思源宋体（Noto Serif SC）中。全量 CJK 字体有几 MB，且
Google Fonts 在国内不可达 —— 因此 `scripts/fetch-fonts.mjs` 只拉取页面
实际用到的汉字生成小型子集，连同 Syne、Source Sans 3、JetBrains Mono
的拉丁子集一起放到 `src/assets/fonts/`。

改过页面文案后，重新生成字体（子集是按文案字符生成的，务必重跑）：

```bash
node scripts/fetch-fonts.mjs
```

## 构建

```bash
npm run build
```

构建前会自动执行 `tsc --noEmit` 类型检查。产物在 `dist/`。GitHub Actions
（`.github/workflows/deploy.yml`）在 push 到 `main` 时自动构建并部署到
GitHub Pages（`base: /resume/`，见 `vite.config.js`）。
