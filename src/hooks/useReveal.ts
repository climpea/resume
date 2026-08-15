/**
 * useReveal — 滚动揭示动画。
 * 扫描 [data-reveal] 元素，进入视口后加 .is-visible（CSS 仅在 html.js 下隐藏）。
 */
import { useEffect } from 'react'
import { getScrollRoot } from '../lib/droplets'

export function useReveal() {
  useEffect(() => {
    const nodes = document.querySelectorAll('[data-reveal]')
    if (!('IntersectionObserver' in window)) {
      nodes.forEach((el) => el.classList.add('is-visible'))
      return
    }
    const root = getScrollRoot() instanceof Element ? getScrollRoot() : null
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible')
            io.unobserve(entry.target)
          }
        })
      },
      { root, threshold: 0.16, rootMargin: '0px 0px -6% 0px' },
    )
    nodes.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])
}
