#!/usr/bin/env node
/**
 * fetch-github-data.mjs — 构建/CI 时预取 GitHub 数据，生成静态 JSON。
 *
 * 设计动机：站点运行时直接调用 GitHub API 会消耗匿名配额（60 次/小时/IP），
 * 预览刷新页面尤其容易触顶。本脚本把拉取挪到构建期（CI 有 GITHUB_TOKEN，
 * 配额 1000 次/小时），产出 public/github-data.json —— 运行时只加载这个
 * 静态文件，配额消耗归零，语言占比等分析照常保留。
 *
 * 用法：
 *   node scripts/fetch-github-data.mjs          # 匿名（本地）或 CI 注入 token
 * 数据新鲜度：由 .github/workflows/deploy.yml 的定时触发（默认每 6 小时）重建。
 */
import { writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')

// Node 无 localStorage/sessionStorage：给 lib 提供 no-op 存储，
// 让 analyzeOne 的缓存逻辑退化为“每次都拉取”（CI 里正好要最新数据）。
const noopStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
}
globalThis.localStorage = noopStorage
globalThis.sessionStorage = noopStorage

const lib = await import('../src/lib/github.ts')
const { github: githubConfig } = await import('../src/content.ts')

lib.setGithubToken(process.env.GITHUB_TOKEN || '')

const OUT = join(root, 'public', 'github-data.json')

async function main() {
  try {
    const { profile, repos } = await lib.fetchAllRepos(githubConfig.username)
    const sorted = lib.sortAndFilter(repos, githubConfig)
    const analysisMap = await lib.analyzeRepos(
      githubConfig.username,
      sorted,
      githubConfig.summaries,
      githubConfig.skipReadmeWhenDescribed !== false,
    )
    const payload = {
      fetchedAt: new Date().toISOString(),
      profile,
      repos: sorted,
      analysis: Object.fromEntries(analysisMap),
    }
    mkdirSync(dirname(OUT), { recursive: true })
    writeFileSync(OUT, JSON.stringify(payload, null, 2) + '\n')
    console.log(`[github-data] OK: ${sorted.length} repos -> ${OUT}`)
  } catch (err) {
    // 拉取失败不阻断构建：有旧文件则保留，否则写占位
    console.warn(`[github-data] fetch failed: ${err.message}`)
    if (!existsSync(OUT)) {
      const placeholder = { fetchedAt: '', profile: null, repos: [], analysis: {}, error: err.message }
      mkdirSync(dirname(OUT), { recursive: true })
      writeFileSync(OUT, JSON.stringify(placeholder, null, 2) + '\n')
      console.warn('[github-data] wrote placeholder (empty data)')
    }
  }
}

await main()
