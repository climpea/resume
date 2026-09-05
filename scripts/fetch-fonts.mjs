/**
 * fetch-fonts.mjs
 * ------------------------------------------------------------------
 * Self-host the webfonts used by the site so nothing render-blocking
 * depends on fonts.googleapis.com (which is unreachable in mainland
 * China and slows down first paint everywhere else).
 *
 * What it does:
 *  1. Collects every CJK character used in the repo and asks Google
 *     Fonts for a *text-subsetted* Noto Serif SC (tiny, ~100-200 KB
 *     per weight instead of megabytes of full CJK fonts).
 *  2. Downloads the latin subsets of Syne (display) and Source Sans 3
 *     (body) — a few KB per weight.
 *  3. Writes the downloaded woff2 files to src/assets/fonts/ and a
 *     ready-to-import src/fonts.css with the original unicode-ranges.
 *
 * Re-run whenever the page copy changes:
 *    node scripts/fetch-fonts.mjs
 * ------------------------------------------------------------------
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync, statSync, unlinkSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const outDir = join(root, 'src', 'assets', 'fonts')
const outCss = join(root, 'src', 'fonts.css')

// A real browser UA is required, otherwise Google Fonts serves TTF instead of woff2.
const UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36'

async function fetchText(url) {
  const res = await fetch(url, { headers: { 'user-agent': UA } })
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`)
  return res.text()
}

/** Parse the @font-face blocks out of a Google Fonts css2 response. */
function parseFaces(css) {
  const faces = []
  for (const block of css.split('@font-face').slice(1)) {
    const prop = (name) => {
      const m = block.match(new RegExp(`${name}\\s*:\\s*([^;]+);`))
      return m ? m[1].trim() : null
    }
    const src = block.match(/url\((https:[^)]+)\)/)
    if (!src) continue
    faces.push({
      family: prop('font-family')?.replace(/['"]/g, ''),
      weight: prop('font-weight'),
      style: prop('font-style') || 'normal',
      range: prop('unicode-range'),
      url: src[1],
    })
  }
  return faces
}

// 1) 递归收集 src/ 下所有源文件 + 页面/文档，提取全部 CJK 字符
//    用于 text= 子集化 Noto Serif SC。fonts.css 是产物，不参与扫描。
function collectFiles(dir, acc = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) collectFiles(full, acc)
    else if (entry !== 'fonts.css' && /\.(ts|tsx|js|mjs|css|html)$/.test(entry)) acc.push(full)
  }
  return acc
}

const scanFiles = [
  join(root, 'index.html'),
  join(root, 'public', 'github-data.json'), // 动态数据（仓库描述等）也要覆盖进字库子集
  ...collectFiles(join(root, 'src')),
  join(root, 'README.md'),
]
let all = ''
for (const f of scanFiles) {
  if (existsSync(f)) all += readFileSync(f, 'utf8')
}
const chars = [
  ...new Set(all.match(/[\u2e80-\u9fff\uf900-\ufaff\uff00-\uffef]/g) || []),
]
  .sort()
  .join('')
// Punctuation the regex above misses but the design uses.
const extra = '—·…'
console.log(
  `Subsetting Noto Serif SC to ${chars.length + extra.length} unique glyphs`,
)

const families = [
  {
    name: 'Noto Serif SC',
    query: `family=Noto+Serif+SC:wght@500;600;700&text=${encodeURIComponent(chars + extra)}`,
  },
  { name: 'Syne', query: 'family=Syne:wght@600;700;800' },
  { name: 'Source Sans 3', query: 'family=Source+Sans+3:ital,wght@0,400;0,500;0,600;1,400' },
  { name: 'JetBrains Mono', query: 'family=JetBrains+Mono:wght@400;500;600' },
]

/**
 * 请求 css2 并校验 text= 子集是否生效。
 * Google Fonts 偶发返回忽略 text= 的全量分片响应（Noto 会有数百条 @font-face）；
 * 此时自动重试几次，直到拿到紧凑子集（每字重一条）。
 */
async function fetchSubsetCss(url, attempts = 6) {
  let lastCount = 0
  for (let i = 1; i <= attempts; i++) {
    const css = await fetchText(url)
    const count = (css.match(/@font-face/g) || []).length
    if (count <= 6) return css
    lastCount = count
    console.warn(`  text= 子集未生效（${count} 条 @font-face），第 ${i}/${attempts} 次重试…`)
    await new Promise((r) => setTimeout(r, 1000 * i))
  }
  throw new Error(`Google Fonts 持续忽略 text= 子集参数（${lastCount} 条响应）`)
}

mkdirSync(outDir, { recursive: true })

// Google Fonts 的 text= 子集参数存在字符量上限（实测约 600+ 字符后被静默忽略，
// 返回全量分片 CSS）。因此把 CJK 字符集切成 ≤450 字符的块分别请求，
// 每块产出一个子集字体文件，多块共用同一 font-weight（unicode-range 分流）。
const CHUNK_SIZE = 450
const cjkText = chars + extra
const chunks = []
for (let i = 0; i < cjkText.length; i += CHUNK_SIZE) {
  chunks.push(cjkText.slice(i, i + CHUNK_SIZE))
}

// 清理旧的 noto 子集文件（内容随文案变化，避免名称复用导致陈旧缓存）
for (const entry of readdirSync(outDir)) {
  if (entry.startsWith('noto-serif-sc-')) {
    try { unlinkSync(join(outDir, entry)) } catch { /* ignore */ }
  }
}

const facesOut = []

for (const fam of families) {
  let faces = []
  if (fam.name === 'Noto Serif SC') {
    for (let ci = 0; ci < chunks.length; ci++) {
      const query = `family=Noto+Serif+SC:wght@500;600;700&text=${encodeURIComponent(chunks[ci])}`
      const css = await fetchSubsetCss(
        `https://fonts.googleapis.com/css2?${query}&display=swap`,
      )
      const chunkFaces = parseFaces(css)
      for (const f of chunkFaces) {
        f.seq = ci
        faces.push(f)
      }
      if (chunks.length > 1) {
        console.log(`  块 ${ci + 1}/${chunks.length}：${chunks[ci].length} 字符 → ${chunkFaces.length} 条`)
      }
    }
  } else {
    const css = await fetchText(
      `https://fonts.googleapis.com/css2?${fam.query}&display=swap`,
    )
    faces = parseFaces(css)
  }
  if (fam.name !== 'Noto Serif SC') {
    // Only keep the basic-latin subset — that is all the design needs.
    faces = faces.filter((f) => f.range?.startsWith('U+0000'))
  }
  for (const face of faces) {
    const slug = fam.name.replace(/\s+/g, '-').toLowerCase()
    const seq = Number.isInteger(face.seq) ? `-${face.seq + 1}` : ''
    const file = `${slug}-${face.weight}${face.style === 'italic' ? 'i' : ''}${seq}.woff2`
    const path = join(outDir, file)
    if (!existsSync(path)) {
      const res = await fetch(face.url, { headers: { 'user-agent': UA } })
      if (!res.ok) throw new Error(`download failed ${file}: HTTP ${res.status}`)
      writeFileSync(path, Buffer.from(await res.arrayBuffer()))
      console.log(`  downloaded ${file}`)
    } else {
      console.log(`  exists     ${file}`)
    }
    facesOut.push({ ...face, file })
  }
}

const cssOut =
  facesOut
    .map(
      (f) => `@font-face {
  font-family: '${f.family}';
  font-style: ${f.style};
  font-weight: ${f.weight};
  font-display: swap;
  src: url('./assets/fonts/${f.file}') format('woff2');
  unicode-range: ${f.range};
}`,
    )
    .join('\n\n') + '\n'

writeFileSync(outCss, cssOut)
console.log(`\nWrote ${outCss} with ${facesOut.length} @font-face rules.`)
