/** 吸顶头部：Logo + 导航（当前区块高亮）+ 求职状态 */
import { useEffect, useRef } from 'react'
import { getScrollRoot } from '../lib/droplets'
import { getScrollTop, scrollToHash } from '../lib/scroll'

const NAV_ITEMS = [
  { id: 'about', label: '关于' },
  { id: 'work', label: '经历' },
  { id: 'projects', label: '作品' },
  { id: 'open-source', label: '开源' },
  { id: 'contact', label: '联系' },
]

export function Header({ activeId }: { activeId: string }) {
  const headerRef = useRef<HTMLElement | null>(null)

  // 滚动超过阈值给头部加下边框（直接操作 class，避免无谓重渲染）
  useEffect(() => {
    const el = headerRef.current
    if (!el) return
    const onScroll = () => el.classList.toggle('is-scrolled', getScrollTop() > 12)
    onScroll()
    const target = getScrollRoot() || window
    target.addEventListener('scroll', onScroll, { passive: true })
    return () => target.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header className="site-header" ref={headerRef}>
      <a className="logo" href="#top" onClick={(e) => scrollToHash('#top', e)}>
        李永慧<span className="logo__dot">.</span>
      </a>
      <nav className="nav" aria-label="主导航">
        {NAV_ITEMS.map(({ id, label }) => (
          <a
            key={id}
            href={`#${id}`}
            className={activeId === id ? 'is-active' : undefined}
            onClick={(e) => scrollToHash(`#${id}`, e)}
          >
            {label}
          </a>
        ))}
      </nav>
      <span className="header-status" aria-hidden="true">
        <span className="header-status__dot" />
        求职中
      </span>
    </header>
  )
}
