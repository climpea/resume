/**
 * useScrollProgress — 顶部阅读进度条。
 * 通过 ref 直接更新 transform（不触发 React 重渲染），rAF 节流。
 */
import { useEffect } from 'react'
import type { RefObject } from 'react'
import { getScrollRoot } from '../lib/droplets'
import { getScrollTop } from '../lib/scroll'

export function useScrollProgress(barRef: RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    const bar = barRef.current
    if (!bar) return
    let raf = 0
    let max = 1

    const measure = () => {
      const root = getScrollRoot()
      max = root
        ? Math.max(root.scrollHeight - root.clientHeight, 1)
        : Math.max(document.documentElement.scrollHeight - window.innerHeight, 1)
    }
    const onScroll = () => {
      if (raf) return
      raf = requestAnimationFrame(() => {
        raf = 0
        bar.style.transform = `scaleX(${Math.min(getScrollTop() / max, 1)})`
      })
    }

    measure()
    onScroll()
    window.addEventListener('resize', () => {
      measure()
      onScroll()
    })
    const target = getScrollRoot() || window
    target.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('resize', measure)
      target.removeEventListener('scroll', onScroll)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [barRef])
}
