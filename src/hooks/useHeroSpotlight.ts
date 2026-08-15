/**
 * useHeroSpotlight — Hero 聚光跟随：鼠标位置驱动 CSS 变量（仅精指针设备）。
 */
import { useEffect } from 'react'
import type { RefObject } from 'react'

export function useHeroSpotlight(heroRef: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const hero = heroRef.current
    if (!hero || !window.matchMedia('(pointer: fine)').matches) return

    let raf = 0
    const onMove = (event: PointerEvent) => {
      if (raf) return
      raf = requestAnimationFrame(() => {
        raf = 0
        const rect = hero.getBoundingClientRect()
        const x = ((event.clientX - rect.left) / rect.width) * 100
        const y = ((event.clientY - rect.top) / rect.height) * 100
        hero.style.setProperty('--sx', `${x}%`)
        hero.style.setProperty('--sy', `${y}%`)
      })
    }

    hero.addEventListener('pointermove', onMove, { passive: true })
    return () => {
      hero.removeEventListener('pointermove', onMove)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [heroRef])
}
