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
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync, statSync } from 'node:fs'
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
//    用于 text= 子集化 Noto Serif SC。
function collectFiles(dir, acc = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) collectFiles(full, acc)
    else if (/\.(ts|tsx|js|mjs|css|html)$/.test(entry)) acc.push(full)
  }
  return acc
}

const scanFiles = [
  join(root, 'index.html'),
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

mkdirSync(outDir, { recursive: true })
const facesOut = []

for (const fam of families) {
  const css = await fetchText(
    `https://fonts.googleapis.com/css2?${fam.query}&display=swap`,
  )
  let faces = parseFaces(css)
  if (fam.name !== 'Noto Serif SC') {
    // Only keep the basic-latin subset — that is all the design needs.
    faces = faces.filter((f) => f.range?.startsWith('U+0000'))
  }
  for (const face of faces) {
    const slug = fam.name.replace(/\s+/g, '-').toLowerCase()
    const file = `${slug}-${face.weight}${face.style === 'italic' ? 'i' : ''}.woff2`
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
