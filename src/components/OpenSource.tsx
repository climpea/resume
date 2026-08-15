/** 开源：GitHub 实时仓库 + README 一句话总结 + 技术栈 + 语言占比 */
import type { CSSProperties } from 'react'
import { useGitHub } from '../hooks/useGitHub'
import { formatRelative, LANG_COLORS } from '../lib/github'
import type { Repo, RepoAnalysis } from '../lib/github'
import { SectionHead } from './SectionHead'

export function OpenSource() {
  const { profile: ghProfile, repos, analysis, rate, error, refreshing, refresh, meta } = useGitHub()

  return (
    <section id="open-source" className="section oss">
      <SectionHead index="04" label="开源 / OSS" />

      <div className="oss__head">
        <h2 className="section__title" data-reveal>
          GitHub 动态
        </h2>
        <div className="oss__toolbar" data-reveal data-reveal-delay="1">
          <span className="oss__rate" id="oss-rate" role="status" aria-live="polite">
            {rate}
          </span>
          <button
            className={`oss__refresh${refreshing ? ' is-loading' : ''}`}
            id="oss-refresh"
            type="button"
            onClick={refresh}
            disabled={refreshing}
          >
            ↻ 刷新
          </button>
        </div>
      </div>

      {(ghProfile || repos) && (
        <dl className="oss__stats" aria-label="仓库概况">
          <div className="stat oss__stat">
            <dt className="stat__value">{ghProfile?.publicRepos ?? repos?.length ?? '—'}</dt>
            <dd className="stat__label">公开仓库</dd>
          </div>
          <div className="stat oss__stat">
            <dt className="stat__value">{meta.years > 0 ? meta.years : '—'}</dt>
            <dd className="stat__label">开源年限</dd>
            <dd className="stat__detail">{meta.years > 0 ? '年' : '今年'}</dd>
          </div>
          <div className="stat oss__stat">
            <dt className="stat__value">{meta.topLang || '—'}</dt>
            <dd className="stat__label">主要语言</dd>
          </div>
          <div className="stat oss__stat">
            <dt className="stat__value">{formatRelative(meta.latest) || '—'}</dt>
            <dd className="stat__label">最近更新</dd>
          </div>
        </dl>
      )}

      {repos === null ? (
        <ul className="oss__list" aria-label="仓库列表">
          {[0, 1, 2].map((i) => (
            <li className="oss__item oss__item--skeleton" aria-hidden="true" key={i}>
              <div className="oss__skeleton-line oss__skeleton-line--name" />
              <div className="oss__skeleton-line oss__skeleton-line--meta" />
            </li>
          ))}
        </ul>
      ) : repos.length === 0 ? (
        <p className="oss__state">暂无公开仓库。</p>
      ) : (
        <ul className="oss__list" aria-label="仓库列表">
          {repos.map((repo) => (
            <RepoRow key={repo.name} repo={repo} analysis={analysis[repo.name]} />
          ))}
        </ul>
      )}

      {/* 无数据时才醒目提示；有数据时工具栏已显示同步状态 */}
      {repos === null && error && <p className="oss__state">{error}</p>}
    </section>
  )
}

function RepoRow({ repo, analysis }: { repo: Repo; analysis?: RepoAnalysis }) {
  const summary = analysis?.summary
  const stack = analysis?.stack ?? []
  const langbar = analysis?.langbar ?? []
  const stars = repo.stars > 0 ? <span className="oss__meta-item">★ {repo.stars}</span> : null
  const forks = repo.forks > 0 ? <span className="oss__meta-item">⑂ {repo.forks}</span> : null
  const updated = repo.pushedAt ? (
    <span className="oss__meta-item oss__meta-updated">更新于 {formatRelative(repo.pushedAt)}</span>
  ) : null

  return (
    <li className="oss__item">
      <a className="oss__link" href={repo.url} target="_blank" rel="noopener noreferrer">
        <div className="oss__main">
          <h3 className="oss__name">{repo.name}</h3>

          {summary && <p className="oss__summary">{summary}</p>}

          {stack.length > 0 && (
            <ul className="oss__stack">
              {stack.map((item) => (
                <li className="oss__chip" key={item}>
                  <i className="oss__dot" style={{ '--lang': LANG_COLORS[item] || '#8b949e' } as CSSProperties} />
                  {item}
                </li>
              ))}
            </ul>
          )}

          {langbar.length > 0 && (
            <div className="oss__langbar">
              <div className="oss__langbar-track">
                {langbar.map((l) => (
                  <i
                    key={l.lang}
                    style={{ width: `${l.pct.toFixed(1)}%`, background: LANG_COLORS[l.lang] || '#8b949e' }}
                    title={`${l.lang} ${l.pct.toFixed(0)}%`}
                  />
                ))}
              </div>
              <span className="oss__langbar-legend">
                {langbar.map((l) => `${l.lang} ${Math.round(l.pct)}%`).join(' · ')}
              </span>
            </div>
          )}

          {(stars || forks || updated) && (
            <p className="oss__meta">
              {stars}
              {forks}
              {updated}
            </p>
          )}
        </div>
        <span className="oss__arrow" aria-hidden="true">
          ↗
        </span>
      </a>
    </li>
  )
}
