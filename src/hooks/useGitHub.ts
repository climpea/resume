/**
 * useGitHub — 开源区块状态管理。
 *
 * 数据来源：构建期由 scripts/fetch-github-data.mjs 预取生成的静态 JSON
 * （public/github-data.json，CI 每 6 小时自动重建）。运行时**不调用**
 * GitHub API —— 配额消耗归零，访客与预览页面都只加载静态文件。
 *
 * 仍然保留 SWR 体验：sessionStorage 缓存即时首屏 + 后台重新校验 JSON；
 * “刷新”按钮只是重新拉取静态文件（不消耗任何配额）。
 */
import { useCallback, useEffect, useRef, useState } from 'react'
import { cacheRead, cacheWrite, formatRelative, LIST_CACHE_KEY, LIST_TTL, topLanguage } from '../lib/github'
import type { GithubProfile, Repo, RepoAnalysis } from '../lib/github'

const REFRESH_INTERVAL = 10 * 60 * 1000 // 重新校验 JSON 的周期
const DATA_URL = `${import.meta.env.BASE_URL}github-data.json`

export type GitHubStatus = 'loading' | 'ready' | 'error' | 'empty'

interface GitHubData {
  fetchedAt: string
  profile: GithubProfile | null
  repos: Repo[]
  analysis: Record<string, RepoAnalysis>
}

export interface GitHubState {
  profile: GithubProfile | null
  repos: Repo[] | null // null = 骨架屏阶段
  analysis: Record<string, RepoAnalysis>
  rate: string
  status: GitHubStatus
  error: string
  refreshing: boolean
  refresh: () => void
  /** 概况派生数据 */
  meta: {
    years: number
    topLang: string
    latest: string
  }
}

export function useGitHub(): GitHubState {
  const [data, setData] = useState<GitHubData | null>(null)
  const [rate, setRate] = useState('正在加载…')
  const [status, setStatus] = useState<GitHubStatus>('loading')
  const [error, setError] = useState('')
  const [refreshing, setRefreshing] = useState(false)
  const busyRef = useRef(false)

  const load = useCallback(async () => {
    if (busyRef.current) return
    busyRef.current = true
    setRefreshing(true)
    try {
      const res = await fetch(DATA_URL, { cache: 'no-store' })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = (await res.json()) as GitHubData
      if (!Array.isArray(json.repos) || typeof json.fetchedAt !== 'string') {
        throw new Error('invalid data file')
      }
      cacheWrite(LIST_CACHE_KEY, json, sessionStorage)
      setData(json)
      setError('')
      setStatus(json.repos.length ? 'ready' : 'empty')
      setRate(json.fetchedAt ? `数据更新于 ${formatRelative(json.fetchedAt)} · 定时同步` : '暂无数据')
    } catch (err) {
      setStatus('error')
      setError('GitHub 数据加载失败，请稍后重试。')
      setRate('同步失败')
    } finally {
      busyRef.current = false
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    // 先渲染缓存（若有），再后台重新校验静态 JSON（零配额）
    const cached = cacheRead<GitHubData>(LIST_CACHE_KEY, LIST_TTL, sessionStorage)
    if (cached) {
      setData(cached.data)
      setStatus(cached.data.repos.length ? 'ready' : 'empty')
      setRate(cached.data.fetchedAt ? `数据更新于 ${formatRelative(cached.data.fetchedAt)}` : '暂无数据')
    }
    load()

    const timer = window.setInterval(() => {
      if (!document.hidden) load()
    }, REFRESH_INTERVAL)
    const onVisibility = () => {
      if (!document.hidden) load()
    }
    document.addEventListener('visibilitychange', onVisibility, { passive: true })
    return () => {
      window.clearInterval(timer)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [load])

  const list = data?.repos ?? []
  const meta = {
    years: Math.max(
      new Date().getFullYear() -
        (data?.profile ? new Date(data.profile.createdAt).getFullYear() : new Date().getFullYear()),
      0,
    ),
    topLang: topLanguage(list),
    latest: list.reduce((acc, r) => (r.pushedAt > acc ? r.pushedAt : acc), ''),
  }

  return {
    profile: data?.profile ?? null,
    repos: data ? data.repos : null,
    analysis: data?.analysis ?? {},
    rate,
    status,
    error,
    refreshing,
    refresh: load,
    meta,
  }
}
