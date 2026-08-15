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
scripts/
  fetch-fonts.mjs       拉取并子集化字体（递归扫描 src，见下）
```

**约定**：组件只负责展示，副作用一律进 hooks，可测逻辑一律进 lib。

### GitHub 仓库实时拉取 + README 分析（`lib/github.ts` + `hooks/useGitHub.ts`）

「开源」区块直接调用 GitHub 公开 API（无需 Token），工程要点：

- **SWR**：优先渲染 sessionStorage 缓存（5 分钟 TTL），后台静默刷新，首屏即时、数据尽量新；
- **自动刷新**：每 5 分钟一次，页面隐藏时暂停，回到前台立即补拉；另有手动刷新按钮；
- **配额感知**：读取 `X-RateLimit-*` 响应头，未登录配额为 60 次/小时/IP，耗尽时显示恢复倒计时并保留缓存数据；
- **README 分析**：每个仓库额外拉取 README 与语言占比，产出：
  - 一句话总结 —— 启发式提取 README 首个有效段落 / 「简介」小节（去代码块、徽章、表格），优先级：`content.ts` 的 `github.summaries` 人工精选 > README 提取 > 仓库描述；
  - 技术栈 chips —— 主语言 + topics + README 关键词扫描；
  - 语言占比条 —— `/languages` 接口的真实字节占比分析；
  - README / 语言数据变化极慢，localStorage 长缓存（6h / 24h），且并发限制 2，避免打爆配额；无 README 的仓库自动降级；
- **配置**：`src/content.ts` 的 `github` 字段可调整 username、排序、置顶（featured）、排除（exclude）、一句话精选（summaries）等。

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
