/**
 * useNavHighlight — 导航高亮：当前可见区块 id（交给 Header 渲染 is-active）。
 */
import { useEffect, useState } from 'react'
import { getScrollRoot } from '../lib/droplets'

const SECTION_IDS = ['about', 'work', 'projects', 'open-source', 'contact']

export function useNavHighlight(): string {
  const [activeId, setActiveId] = useState('')

  useEffect(() => {
    const sections = SECTION_IDS.map((id) => document.getElementById(id)).filter(
      (el): el is HTMLElement => el !== null,
    )
    if (!sections.length || !('IntersectionObserver' in window)) return

    const root = getScrollRoot() instanceof Element ? getScrollRoot() : null
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveId(entry.target.id)
        })
      },
      { root, rootMargin: '-35% 0px -60% 0px', threshold: 0 },
    )
    sections.forEach((section) => io.observe(section))
    return () => io.disconnect()
  }, [])

  return activeId
}
