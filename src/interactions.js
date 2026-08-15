/**
 * interactions.js — 页面交互：滚动揭示、吸顶头部、锚点、阅读进度、导航高亮。
 * 统一以 getScrollRoot() 的结果作为滚动容器（capture 模式为内容元素，其余为 window）。
 */

function $(selector, root = document) {
  return root.querySelector(selector)
}

function scrollTopOf(root) {
  return root ? root.scrollTop : window.scrollY || document.documentElement.scrollTop
}

/** 滚动揭示动画（仅在 JS 可用时隐藏元素，见 html.js 门控） */
export function setupReveal(root) {
  const nodes = document.querySelectorAll('[data-reveal]')
  if (!('IntersectionObserver' in window)) {
    nodes.forEach((el) => el.classList.add('is-visible'))
    return
  }
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible')
          io.unobserve(entry.target)
        }
      })
    },
    {
      root: root instanceof Element ? root : null,
      threshold: 0.16,
      rootMargin: '0px 0px -6% 0px',
    },
  )
  nodes.forEach((el) => io.observe(el))
}

/** 吸顶头部：滚动超过阈值后加下边框 */
export function setupHeader(root) {
  const header = $('.site-header')
  if (!header) return
  const target = root || window
  const onScroll = () => {
    header.classList.toggle('is-scrolled', scrollTopOf(root) > 12)
  }
  onScroll()
  target.addEventListener('scroll', onScroll, { passive: true })
}

/** 页内锚点平滑滚动（拦截 #，避免点击后页面跳顶） */
export function setupAnchors(root) {
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (event) => {
      const href = link.getAttribute('href')
      if (!href) return
      if (href === '#') {
        // 占位链接（如项目卡片）：不做任何事，也不要跳回顶部。
        event.preventDefault()
        return
      }
      if (href === '#top') {
        // 回到顶部：capture 模式滚动内容元素，其余模式滚动 window。
        event.preventDefault()
        const top = document.getElementById('top')
        if (top && link.classList.contains('skip-link')) {
          top.focus({ preventScroll: true })
        }
        if (root) root.scrollTo({ top: 0, behavior: 'smooth' })
        else window.scrollTo({ top: 0, behavior: 'smooth' })
        return
      }
      const target = document.querySelector(href)
      if (!target) return
      event.preventDefault()
      target.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  })
}

/** 顶部阅读进度条（fixed 元素，transform 更新，避免回流） */
export function setupProgress(root) {
  const bar = $('.scroll-progress')
  if (!bar) return
  const target = root || window

  const measure = () => {
    if (root) {
      return { max: Math.max(root.scrollHeight - root.clientHeight, 1) }
    }
    const doc = document.documentElement
    return { max: Math.max(doc.scrollHeight - window.innerHeight, 1) }
  }

  let { max } = measure()
  let raf = 0
  const onScroll = () => {
    if (raf) return
    raf = requestAnimationFrame(() => {
      raf = 0
      const progress = Math.min(scrollTopOf(root) / max, 1)
      bar.style.transform = `scaleX(${progress})`
    })
  }

  window.addEventListener('resize', () => {
    ;({ max } = measure())
    onScroll()
  })
  target.addEventListener('scroll', onScroll, { passive: true })
  onScroll()
}

/** 导航高亮：当前可见区块对应的链接加 is-active */
export function setupNavHighlight(root) {
  const sections = ['about', 'work', 'projects', 'contact']
    .map((id) => document.getElementById(id))
    .filter(Boolean)
  const links = Array.from(document.querySelectorAll('.nav a[href^="#"]'))
  if (!sections.length || !links.length || !('IntersectionObserver' in window)) return

  const setActive = (id) => {
    links.forEach((a) => a.classList.toggle('is-active', a.getAttribute('href') === `#${id}`))
  }

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) setActive(entry.target.id)
      })
    },
    {
      root: root instanceof Element ? root : null,
      rootMargin: '-35% 0px -60% 0px',
      threshold: 0,
    },
  )
  sections.forEach((section) => io.observe(section))
}

/** Hero 聚光跟随：鼠标位置驱动 CSS 变量，仅限精指针设备 */
export function setupHeroSpotlight() {
  const hero = $('.hero')
  if (!hero || !window.matchMedia('(pointer: fine)').matches) return

  let raf = 0
  const onMove = (event) => {
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
}
