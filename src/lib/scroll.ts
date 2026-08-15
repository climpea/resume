/**
 * 页内锚点平滑滚动工具（React 组件统一通过 onClick 调用，替代全局事件委托）。
 */
import type { MouseEvent } from 'react'
import { getScrollRoot } from './droplets'

export function scrollToHash(hash: string, event?: MouseEvent<HTMLElement>) {
  event?.preventDefault()
  if (!hash || hash === '#') return

  if (hash === '#top') {
    // 回到顶部：capture 模式滚动内容元素，其余模式滚动 window
    const root = getScrollRoot()
    if (root) root.scrollTo({ top: 0, behavior: 'smooth' })
    else window.scrollTo({ top: 0, behavior: 'smooth' })
    return
  }

  const target = document.querySelector<HTMLElement>(hash)
  target?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

/** 当前滚动位置（兼容两种滚动容器） */
export function getScrollTop(): number {
  const root = getScrollRoot()
  return root ? root.scrollTop : window.scrollY || document.documentElement.scrollTop
}
