/**
 * lib/github.ts — GitHub 数据层（无 DOM 依赖，纯函数可单测）
 *
 * 与 UI 解耦：组件通过 hooks/useGitHub 消费这里的拉取/分析结果。
 *
 * 策略（静态站点下的“实时”工程实践）：
 *  - SWR：sessionStorage 列表缓存（5 分钟 TTL）+ 后台静默刷新；
 *  - 配额感知：读取 X-RateLimit-*，耗尽时抛出 rate-limited 错误；
 *  - README / 语言占比变化极慢：localStorage 长缓存（6h / 24h）；
 *  - “一句话总结”不做浏览器端 LLM（API Key 不能进前端），改为
 *    启发式提取 + content.ts 人工精选覆盖。
 */
import type { GithubConfig } from '../content'

export interface Repo {
  name: string
  url: string
  description: string
  language: string
  stars: number
  forks: number
  pushedAt: string
  archived: boolean
  fork: boolean
  topics: string[]
}

export interface RepoAnalysis {
  summary: string
  stack: string[]
  langbar: LangBreakdown[]
}

export interface LangBreakdown {
  lang: string
  pct: number
}

export interface GithubProfile {
  publicRepos: number
  createdAt: string
}

export interface RateInfo {
  limit: string | null
  remaining: string | null
  reset: number
}

export interface RateLimitError extends Error {
  reset: number
  limit?: string | null
}

export function isRateLimitError(err: unknown): err is RateLimitError {
  return err instanceof Error && (err as RateLimitError).reset != null
}

const API = 'https://api.github.com'

export const LIST_CACHE_KEY = 'gh-repos-v1'
export const LIST_TTL = 5 * 60 * 1000
export const README_TTL = 6 * 60 * 60 * 1000
export const LANGS_TTL = 24 * 60 * 60 * 1000

/** 常用语言色（GitHub linguist 配色子集），未知语言回退中性色 */
export const LANG_COLORS: Record<string, string> = {
  JavaScript: '#f1e05a',
  TypeScript: '#3178c6',
  HTML: '#e34c26',
  CSS: '#563d7c',
  SCSS: '#c6538c',
  Python: '#3572a5',
  Java: '#b07219',
  Go: '#00add8',
  Rust: '#dea584',
  Vue: '#41b883',
  Shell: '#89e051',
  C: '#555555',
  'C++': '#f34b7d',
  'C#': '#178600',
  PHP: '#4f5d95',
  Ruby: '#701516',
  Kotlin: '#a97bff',
  Swift: '#f05138',
  Dart: '#00b4ab',
  Dockerfile: '#384d54',
  Markdown: '#083fa1',
  JSON: '#292929',
}

/** README 技术栈关键词词典（大小写不敏感） */
const TECH_DICT = [
  'React', 'Vue', 'TypeScript', 'JavaScript', 'Node.js', 'Vite', 'Webpack',
  'Rollup', 'Docker', 'Kubernetes', 'Python', 'Go', 'Rust', 'Java', 'Kotlin',
  'Swift', 'Flutter', 'uni-app', 'Electron', 'Express', 'Koa', 'Midway',
  'NestJS', 'Next.js', 'Nuxt', 'Tailwind', 'Less', 'Sass', 'PostCSS',
  'WebGL', 'Canvas', 'PWA', 'qiankun', '微前端', '小程序', '鸿蒙',
  'HarmonyOS', 'LangChain', 'LLM', '大模型', 'MySQL', 'Redis', 'MongoDB',
  'PostgreSQL', 'GitHub Actions', 'ESLint', 'Jest', 'Vitest', 'Playwright',
  'Cypress', 'Chrome 插件',
]

const SUMMARY_SECTION = /简介|介绍|概述|关于|项目说明|About|Overview|Introduction|What is/i
const BOILERPLATE = /^(logo|demo|演示|预览|安装|使用说明|usage|install|screenshot|截图|快速开始|quick start|getting started|效果图|目录|架构|部署|deploy|背景|背景与目标)/i

/* ================= 纯函数 ================= */

/** GitHub 描述字段可能含 HTML 实体（&amp; 等），做一次解码 */
export function decodeEntities(value: string): string {
  if (!value) return ''
  return value
    .replace(/&#x([0-9a-f]+);/gi, (_, hex: string) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec: string) => String.fromCodePoint(parseInt(dec, 10)))
    .replace(/&quot;/g, '"')
    .replace(/&apos;|&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
}

/** 把原始 API 返回规整为最小字段集 */
export function normalizeRepos(raw: unknown): Repo[] {
  return (Array.isArray(raw) ? raw : []).map((r: any) => ({
    name: r.name,
    url: r.html_url,
    description: decodeEntities(r.description || ''),
    language: r.language || '',
    stars: r.stargazers_count || 0,
    forks: r.forks_count || 0,
    pushedAt: r.pushed_at || r.updated_at || '',
    archived: !!r.archived,
    fork: !!r.fork,
    topics: Array.isArray(r.topics) ? r.topics : [],
  }))
}

/** 过滤 + 排序：exclude 剔除 → featured 置顶 → 按配置排序 → 限量 */
export function sortAndFilter(list: Repo[], config: GithubConfig): Repo[] {
  const featured = new Set(config.featured || [])
  const excluded = new Set(config.exclude || [])
  const filtered = list.filter((r) => {
    if (config.excludeForks !== false && r.fork) return false
    if (config.excludeArchived !== false && r.archived) return false
    if (excluded.has(r.name)) return false
    return true
  })
  const rank = (r: Repo) => (featured.has(r.name) ? 0 : 1)
  filtered.sort((a, b) => {
    if (rank(a) !== rank(b)) return rank(a) - rank(b)
    if (config.sort === 'stars') {
      if (b.stars !== a.stars) return b.stars - a.stars
    }
    return (b.pushedAt || '').localeCompare(a.pushedAt || '')
  })
  const max = Number.isFinite(config.maxRepos) ? config.maxRepos : 20
  return filtered.slice(0, max)
}

/** 相对时间：今天 / N 天前 / N 周前 / N 个月前 / 具体日期 */
export function formatRelative(iso: string): string {
  if (!iso) return ''
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''
  const days = Math.floor((Date.now() - date.getTime()) / 86400000)
  if (days < 1) return '今天'
  if (days < 7) return `${days} 天前`
  if (days < 30) return `${Math.floor(days / 7)} 周前`
  if (days < 365) return `${Math.floor(days / 30)} 个月前`
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

/** 最常用的语言 */
export function topLanguage(list: Repo[]): string {
  const counts = new Map<string, number>()
  for (const r of list) {
    if (!r.language) continue
    counts.set(r.language, (counts.get(r.language) || 0) + 1)
  }
  let best = ''
  let max = 0
  for (const [lang, count] of counts) {
    if (count > max) {
      best = lang
      max = count
    }
  }
  return best
}

function cleanMarkdownLine(line: string): string {
  return line
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ') // 图片
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1') // 链接保留文字
    .replace(/`([^`]*)`/g, '$1') // 行内代码
    .replace(/\*\*([^*]+)\*\*/g, '$1') // 加粗
    .replace(/[*_~#>|]/g, ' ') // 残留标记
    .replace(/\s+/g, ' ')
    .trim()
}

/** 一句话总结：README 启发式提取（首个有效段落 / 「简介」小节） */
export function extractSummary(markdown: string): string {
  if (!markdown) return ''
  const text = markdown
    .replace(/^---[\s\S]*?---/, '') // YAML frontmatter
    .replace(/<!--[\s\S]*?-->/g, '') // HTML 注释
  const lines = text.split(/\r?\n/)
  const cleaned: string[] = []
  let inCode = false
  let sectionStart = -1
  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i]
    if (/^\s*```/.test(raw)) {
      inCode = !inCode
      cleaned.push('')
      continue
    }
    if (inCode) {
      cleaned.push('')
      continue
    }
    if (/^\s*#{1,3}\s+/.test(raw)) {
      const heading = raw.replace(/^\s*#{1,3}\s+/, '')
      if (SUMMARY_SECTION.test(heading) && sectionStart < 0) sectionStart = cleaned.length
      cleaned.push('')
      continue
    }
    cleaned.push(cleanMarkdownLine(raw))
  }
  const start = sectionStart >= 0 ? sectionStart : 0
  for (let i = start; i < cleaned.length; i++) {
    const line = cleaned[i]
    if (line.length < 8) continue
    if (BOILERPLATE.test(line)) continue
    if (/^\s*\|/.test(lines[i])) continue // 表格行
    return capSentence(line)
  }
  return ''
}

/** 截到第一句结尾（限长内） */
function capSentence(line: string, max = 90): string {
  if (line.length <= max) return line
  const m = line.match(/^[\s\S]{0,90}?[。！？.!?]/)
  return m ? m[0] : `${line.slice(0, max - 1)}…`
}

/** 技术栈关键词扫描（README 文本 → 命中词典项） */
export function extractTechStack(markdown: string): string[] {
  if (!markdown) return []
  const text = markdown
  const found: string[] = []
  for (const kw of TECH_DICT) {
    const escaped = kw.replace(/[.+()]/g, '\\$&')
    const re = new RegExp(`\\b${escaped}\\b`, 'i')
    if (re.test(text)) found.push(kw)
  }
  return found.slice(0, 6)
}

/** 语言字节占比 → [{lang, pct}]（pct≥1% 的保留，降序） */
export function parseLanguagesBreakdown(bytes: Record<string, number> | null | undefined): LangBreakdown[] {
  if (!bytes || typeof bytes !== 'object') return []
  const total = Object.values(bytes).reduce((a, b) => a + b, 0)
  if (!total) return []
  return Object.entries(bytes)
    .map(([lang, size]) => ({ lang, pct: (size / total) * 100 }))
    .sort((a, b) => b.pct - a.pct)
    .filter((x) => x.pct >= 1)
}

/* ================= 缓存 ================= */

interface CacheEntry<T> {
  fetchedAt: number
  data: T
}

export function cacheRead<T>(key: string, ttl: number, storage: Storage): CacheEntry<T> | null {
  try {
    const raw = storage.getItem(key)
    if (!raw) return null
    const data = JSON.parse(raw) as CacheEntry<T>
    if (!data || Date.now() - data.fetchedAt > ttl) return null
    return data
  } catch {
    return null
  }
}

export function cacheWrite<T>(key: string, data: T, storage: Storage) {
  try {
    storage.setItem(key, JSON.stringify({ data, fetchedAt: Date.now() }))
  } catch {
    /* 隐私模式等场景忽略 */
  }
}

/* ================= 拉取 ================= */

async function fetchJSON(path: string): Promise<{ data: any; rate: RateInfo }> {
  const res = await fetch(`${API}${path}`, {
    headers: { Accept: 'application/vnd.github+json' },
    cache: 'no-store',
  })
  const rate: RateInfo = {
    limit: res.headers.get('x-ratelimit-limit'),
    remaining: res.headers.get('x-ratelimit-remaining'),
    reset: Number(res.headers.get('x-ratelimit-reset')) * 1000,
  }
  if (res.status === 403 && rate.remaining === '0') {
    throw Object.assign(new Error('rate-limited'), { reset: rate.reset, limit: rate.limit })
  }
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return { data: await res.json(), rate }
}

/** 小并发限制：分析请求（README/语言）最多同时 2 个 */
async function mapLimit<T, R>(items: T[], limit: number, fn: (item: T, index: number) => Promise<R>): Promise<R[]> {
  const results: R[] = []
  let i = 0
  const worker = async () => {
    while (i < items.length) {
      const idx = i++
      results[idx] = await fn(items[idx], idx)
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker))
  return results
}

/** 拉取用户资料 + 仓库列表（一次刷新 2 个请求） */
export async function fetchAllRepos(username: string): Promise<{
  profile: GithubProfile
  repos: Repo[]
  rate: RateInfo
}> {
  const [profileRes, reposRes] = await Promise.all([
    fetchJSON(`/users/${username}`),
    fetchJSON(`/users/${username}/repos?per_page=100&sort=updated`),
  ])
  return {
    profile: {
      publicRepos: profileRes.data.public_repos,
      createdAt: profileRes.data.created_at,
    },
    repos: normalizeRepos(reposRes.data),
    rate: reposRes.rate,
  }
}

async function fetchRaw(path: string): Promise<Response> {
  return fetch(`${API}${path}`, {
    headers: { Accept: 'application/vnd.github.raw' },
    cache: 'no-store',
  })
}

function throwIfRateLimited(res: Response): void {
  if (res.status === 403 && res.headers.get('x-ratelimit-remaining') === '0') {
    throw Object.assign(new Error('rate-limited'), {
      reset: Number(res.headers.get('x-ratelimit-reset')) * 1000,
    })
  }
}

/** 单个仓库：README（raw）+ 语言占比，均走长缓存；配额耗尽抛错中止 */
async function analyzeOne(username: string, repo: Repo, summaries: Record<string, string>): Promise<RepoAnalysis> {
  const result: RepoAnalysis = { summary: '', stack: [], langbar: [] }
  const readmeCache = cacheRead<{ text: string }>(`gh-readme-${repo.name}`, README_TTL, localStorage)
  let readme = readmeCache ? readmeCache.data.text : ''
  if (!readmeCache) {
    try {
      const res = await fetchRaw(`/repos/${username}/${repo.name}/readme`)
      throwIfRateLimited(res)
      if (res.status === 404) {
        cacheWrite(`gh-readme-${repo.name}`, { text: '' }, localStorage)
      } else if (res.ok) {
        readme = await res.text()
        cacheWrite(`gh-readme-${repo.name}`, { text: readme }, localStorage)
      }
    } catch (err) {
      if (isRateLimitError(err)) throw err
      /* 网络抖动：静默，走缓存/空 */
    }
  }

  // 一句话总结：人工精选 > README 提取 > 仓库描述
  result.summary = summaries[repo.name] || (readme ? extractSummary(readme) : '') || repo.description || ''

  // 技术栈：主语言 + topics + README 关键词（去重）
  const stackSet = new Set<string>()
  if (repo.language) stackSet.add(repo.language)
  for (const t of repo.topics) stackSet.add(t)
  for (const kw of readme ? extractTechStack(readme) : []) stackSet.add(kw)
  result.stack = [...stackSet].slice(0, 8)

  // 语言占比（真实字节分析，24h 缓存）
  const langsCache = cacheRead<Record<string, number>>(`gh-langs-${repo.name}`, LANGS_TTL, localStorage)
  if (langsCache) {
    result.langbar = parseLanguagesBreakdown(langsCache.data)
  } else {
    try {
      const res = await fetch(`${API}/repos/${username}/${repo.name}/languages`, {
        headers: { Accept: 'application/vnd.github+json' },
        cache: 'no-store',
      })
      throwIfRateLimited(res)
      if (res.ok) {
        const data = await res.json()
        cacheWrite(`gh-langs-${repo.name}`, data, localStorage)
        result.langbar = parseLanguagesBreakdown(data)
      }
    } catch (err) {
      if (isRateLimitError(err)) throw err
    }
  }
  return result
}

/**
 * 对仓库逐个做 README 分析（并发 2）。
 * onProgress 每完成一个仓库回调一次，便于 UI 渐进填充。
 */
export async function analyzeRepos(
  username: string,
  repos: Repo[],
  summaries: Record<string, string>,
  onProgress?: (name: string, analysis: RepoAnalysis) => void,
): Promise<Map<string, RepoAnalysis>> {
  const map = new Map<string, RepoAnalysis>()
  await mapLimit(repos, 2, async (repo) => {
    const analysis = await analyzeOne(username, repo, summaries)
    map.set(repo.name, analysis)
    onProgress?.(repo.name, analysis)
  })
  return map
}

/** 解析 username：显式配置优先，否则从 profile.links.github 提取 */
export function resolveUsername(configured: string, githubUrl: string): string {
  return (
    configured ||
    githubUrl.replace(/^https?:\/\/github\.com\//, '').replace(/\/$/, '')
  )
}
