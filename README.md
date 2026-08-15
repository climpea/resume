# 李永慧 · 个人主页

基于 Vite 的静态个人主页，含 WebGL「雨滴玻璃」粒子特效。
设计方向：**暗色编辑风** —— 暖墨黑底 + 香槟金点缀 + 大字号混排（Syne /
思源宋体 / JetBrains Mono）。

## 本地预览

```bash
npm install
npm run dev
```

## 修改内容

只需编辑 `src/content.js`：姓名、简介、走马灯关键词、关键成果、技能、经历、
项目、联系方式。页面由 `src/render.js` 渲染这份数据，无需改动 HTML。

## 架构

```
index.html            页面骨架 + SEO / 无障碍（静态兜底内容）
src/
  main.js             应用入口：装配粒子、渲染、交互
  content.js          唯一数据源（简历内容）
  render.js           数据 -> DOM
  interactions.js     交互：滚动揭示、吸顶头部、锚点、阅读进度、导航高亮、Hero 聚光
  droplets.js         粒子系统装配（能力检测 + 模式降级）
  fonts.css           自托管字体 @font-face（由脚本生成）
  style.css           全部样式（暗色编辑风）
  components/canvasui/DropletsVanilla.ts  WebGL 雨滴引擎（Canvas UI 移植）
scripts/
  fetch-fonts.mjs     拉取并子集化字体（见下）
```

### 粒子特效：三种模式（渐进增强）

`droplets.js` 按能力检测自动选择，页面内容永远真实可读：

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

产物在 `dist/`。GitHub Actions（`.github/workflows/deploy.yml`）在 push
到 `main` 时自动构建并部署到 GitHub Pages（`base: /resume/`，见
`vite.config.js`）。
