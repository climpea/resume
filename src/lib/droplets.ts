import {
  createDroplets,
  supportsHtmlInCanvas,
} from './particles/DropletsVanilla'
import { particles } from '../content'

/**
 * 粒子系统装配（由 main.tsx 在 React 挂载前调用）。
 *
 * 引擎支持两种渲染模式，按能力检测自动选择（渐进增强，而非硬依赖）：
 *
 *   'capture' — 完整「雨滴玻璃」折射。需要实验性 html-in-canvas API
 *               （drawElementImage + requestPaint）。页面在 canvas 内滚动，
 *               着色器折射捕获到的内容。低端设备与 reduced-motion 用户跳过。
 *
 *   'overlay' — 同一套 WebGL 雨滴着色器以固定玻璃层覆盖正常 DOM
 *               （着色器 uHasContent = 0 路径）。任意 WebGL2 浏览器可用，
 *               内容仍是真实 DOM（可选中、可读、SEO 友好），滚动零开销。
 *
 *   'none'    — 无 WebGL2：普通页面，无粒子。
 */

export type DropletMode = 'capture' | 'overlay' | 'none'

/** @type {import('./particles/DropletsVanilla').DropletsInstance | null} */
let instance: ReturnType<typeof createDroplets> = null
let mode: DropletMode = 'none'

export function getDropletMode(): DropletMode {
  return mode
}

function webgl2Available(): boolean {
  try {
    const probe = document.createElement('canvas')
    const gl = probe.getContext('webgl2')
    return Boolean(gl && !gl.isContextLost())
  } catch {
    return false
  }
}

/** 低端设备启发式：跳过昂贵的 capture 路径 */
function detectLowEnd(): boolean {
  try {
    const nav = navigator as Navigator & { deviceMemory?: number }
    const cores = navigator.hardwareConcurrency
    const mem = nav.deviceMemory
    if (typeof cores === 'number' && cores > 0 && cores < 4) return true
    if (typeof mem === 'number' && mem > 0 && mem < 4) return true
  } catch {
    /* ignore */
  }
  return false
}

// 默认配置由 content.ts 的 particles 覆盖（数据驱动，调参无需改代码）。
// 用 Object.assign 合并，避免 TS2783（字面量属性与已知键 spread 重叠）。
const DEFAULTS = {
  intensity: 0.38,
  speed: 0.9,
  scale: 0.48,
  dropWidth: 1,
  dropLength: 1.1,
  refraction: 0.2,
  blur: 0.12,
  vignette: 0.06,
  fallSpeed: 0.85,
  wiggle: 0.85,
  staticDrops: 0.25,
  interactive: true,
  interactionRadius: 0.28,
  interactionStrength: 0.55,
  interactionDistortion: 2.4,
  // Soft champagne tint aligned with the dark page atmosphere.
  tint: [0.96, 0.93, 0.85] as [number, number, number],
  tintStrength: 0.1,
}
const BASE_OPTIONS = Object.assign({}, DEFAULTS, particles)

/**
 * 挂载雨滴粒子。降级链：capture → overlay → 普通页面。
 */
export function mountDroplets(options: Partial<typeof BASE_OPTIONS> = {}) {
  const root = document.getElementById('particle-root')
  const content = document.getElementById('scroll-root')
  if (!root || !content) return null

  const config = { ...BASE_OPTIONS, ...options }

  if (!webgl2Available()) {
    root.classList.add('is-fallback')
    document.documentElement.classList.add('scroll-fallback')
    console.info('[Droplets] WebGL2 unavailable — showing the plain page.')
    return null
  }

  const reducedMotion =
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
  const canCapture = supportsHtmlInCanvas() && !detectLowEnd() && !reducedMotion

  const output = document.createElement('canvas')
  output.className = 'particle-scroll__output'
  output.setAttribute('aria-hidden', 'true')

  const source = document.createElement('canvas')
  source.className = 'particle-scroll__source'
  source.setAttribute('layoutsubtree', 'true')

  const fail = () => {
    root.classList.remove('is-active')
    root.classList.add('is-fallback')
    document.documentElement.classList.remove('scroll-particle', 'overlay-particle')
    document.documentElement.classList.add('scroll-fallback')
    if (source.parentNode === root) source.remove()
    if (output.parentNode === root) output.remove()
    if (source.contains(content)) root.insertBefore(content, source)
  }

  // ---- capture 模式：页面被移入源 canvas ----
  if (canCapture) {
    root.insertBefore(source, content)
    source.appendChild(content)
    root.appendChild(output)
    root.classList.add('is-active')
    document.documentElement.classList.add('scroll-particle')

    instance = createDroplets({ source, content, output }, config)
    if (instance) {
      mode = 'capture'
      return instance
    }
    // GL 初始化失败：清理后继续尝试 overlay 模式
    fail()
  }

  // ---- overlay 模式：固定玻璃层覆盖正常 DOM ----
  root.appendChild(output)
  root.classList.add('is-active')
  document.documentElement.classList.add('overlay-particle')

  instance = createDroplets(
    { source, content, output },
    {
      ...config,
      // 无捕获内容可折射；提高 tint 让水滴呈现香槟雾色而非灰点
      tint: [0.98, 0.96, 0.9],
      tintStrength: 0.3,
    },
  )
  if (!instance) {
    fail()
    return null
  }
  mode = 'overlay'
  return instance
}

/**
 * 哪个元素在滚动页面：
 *  - capture 模式：canvas 内的内容元素
 *  - overlay / none / fallback：window
 */
export function getScrollRoot(): HTMLElement | null {
  return mode === 'capture' ? document.getElementById('scroll-root') : null
}

export function destroyDroplets() {
  instance?.destroy()
  instance = null
  mode = 'none'
}
