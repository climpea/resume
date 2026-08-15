/**
 * useGitHub — 开源区块状态管理（SWR + 自动刷新 + README 分析）。
 */
import { useCallback, useEffect, useRef, useState } from 'react'
import { github as githubConfig, profile } from '../content'
import {
  analyzeRepos,
  cacheRead,
  cacheWrite,
  fetchAllRepos,
  formatRelative,
  isRateLimitError,
  LIST_CACHE_KEY,
  LIST_TTL,
  resolveUsername,
  sortAndFilter,
  topLanguage,
} from '../lib/github'
import type { GithubProfile, Repo, RepoAnalysis } from '../lib/github'

const REFRESH_INTERVAL = 5 * 60 * 1000
const USERNAME = resolveUsername(githubConfig.username, profile.links.github)

export type GitHubStatus = 'loading' | 'ready' | 'error' | 'ratelimited' | 'empty'

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
  const [profileData, setProfileData] = useState<GithubProfile | null>(null)
  const [repos, setRepos] = useState<Repo[] | null>(null)
  const [analysis, setAnalysis] = useState<Record<string, RepoAnalysis>>({})
  const [rate, setRate] = useState('正在连接 GitHub…')
  const [status, setStatus] = useState<GitHubStatus>('loading')
  const [error, setError] = useState('')
  const [refreshing, setRefreshing] = useState(false)
  const busyRef = useRef(false)

  const refresh = useCallback(async () => {
    if (busyRef.current || !USERNAME) return
    busyRef.current = true
    setRefreshing(true)
    try {
      const { profile: p, repos: list, rate: rateInfo } = await fetchAllRepos(USERNAME)
      const sorted = sortAndFilter(list, githubConfig)
      cacheWrite(LIST_CACHE_KEY, { profile: p, repos: sorted }, sessionStorage)
      setProfileData(p)
      setRepos(sorted)
      setError('')
      setStatus(sorted.length ? 'ready' : 'empty')
      setRate(`已同步 · 配额 ${rateInfo.remaining}/${rateInfo.limit}`)

      // README 一句话 + 技术栈 + 语言占比（渐进填充）
      try {
        await analyzeRepos(USERNAME, sorted, githubConfig.summaries, (name, a) => {
          setAnalysis((prev) => ({ ...prev, [name]: a }))
        })
      } catch (err) {
        if (isRateLimitError(err)) {
          const mins = Math.max(Math.ceil((err.reset - Date.now()) / 60000), 1)
          setRate(`配额已用完 · ${mins} 分钟后恢复`)
          setStatus('ratelimited')
        }
      }
    } catch (err) {
      if (isRateLimitError(err)) {
        const mins = Math.max(Math.ceil((err.reset - Date.now()) / 60000), 1)
        setRate(`配额已用完 · ${mins} 分钟后恢复`)
        setStatus('ratelimited')
        setError('GitHub 请求过于频繁，已保留上次数据，稍后可手动刷新。')
      } else {
        setRate('同步失败')
        setStatus('error')
        setError('GitHub 暂时无法连接，请稍后重试。')
      }
    } finally {
      busyRef.current = false
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    // SWR：先渲染缓存（若新鲜），再后台刷新
    const cached = cacheRead<{ profile: GithubProfile; repos: Repo[] }>(LIST_CACHE_KEY, LIST_TTL, sessionStorage)
    if (cached) {
      setProfileData(cached.data.profile)
      setRepos(cached.data.repos)
      setStatus(cached.data.repos.length ? 'ready' : 'empty')
      setRate('已加载缓存 · 后台同步中…')
      analyzeRepos(USERNAME, cached.data.repos, githubConfig.summaries, (name, a) => {
        setAnalysis((prev) => ({ ...prev, [name]: a }))
      }).catch(() => {})
    }
    refresh()

    const timer = window.setInterval(() => {
      if (!document.hidden) refresh()
    }, REFRESH_INTERVAL)
    const onVisibility = () => {
      if (!document.hidden) refresh()
    }
    document.addEventListener('visibilitychange', onVisibility, { passive: true })
    return () => {
      window.clearInterval(timer)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [refresh])

  const list = repos ?? []
  const meta = {
    years: Math.max(new Date().getFullYear() - (profileData ? new Date(profileData.createdAt).getFullYear() : new Date().getFullYear()), 0),
    topLang: topLanguage(list),
    latest: list.reduce((acc, r) => (r.pushedAt > acc ? r.pushedAt : acc), ''),
  }

  return {
    profile: profileData,
    repos,
    analysis,
    rate,
    status,
    error,
    refreshing,
    refresh,
    meta,
  }
}

/** 供组件直接使用的格式化（避免重复 import 链） */
export { formatRelative }
