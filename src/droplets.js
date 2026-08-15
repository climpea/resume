import {
  createDroplets,
  supportsHtmlInCanvas,
} from './components/canvasui/DropletsVanilla.ts'

/**
 * Particle system bootstrap.
 *
 * The droplets engine supports two render modes, selected by capability
 * detection — progressive enhancement, never a hard dependency:
 *
 *   'capture' — full "rain on glass" refraction. Requires the experimental
 *               html-in-canvas API (drawElementImage + requestPaint, a
 *               Chromium flag / Origin Trial). The page scrolls inside a
 *               canvas and the shader refracts the captured content.
 *               Disabled on low-end devices and for reduced-motion users.
 *
 *   'overlay'  — same WebGL droplet shader rendered as a fixed glass layer
 *                over the normal DOM (the shader's uHasContent = 0 path).
 *                Works in any WebGL2 browser, content stays real DOM
 *                (accessible, selectable, SEO-friendly), scrolling is free.
 *
 *   'none'     — no WebGL2 at all: plain page, no particles.
 *
 * @typedef {'capture' | 'overlay' | 'none'} DropletMode
 */

/** @type {import('./components/canvasui/DropletsVanilla').DropletsInstance | null} */
let instance = null
/** @type {DropletMode} */
let mode = 'none'

export function getDropletMode() {
  return mode
}

function webgl2Available() {
  try {
    const probe = document.createElement('canvas')
    const gl = probe.getContext('webgl2')
    return Boolean(gl && !gl.isContextLost())
  } catch {
    return false
  }
}

/** Cheap heuristic: skip the expensive capture path on low-end devices. */
function detectLowEnd() {
  try {
    const cores = navigator.hardwareConcurrency
    const mem = navigator.deviceMemory
    if (typeof cores === 'number' && cores > 0 && cores < 4) return true
    if (typeof mem === 'number' && mem > 0 && mem < 4) return true
  } catch {
    /* ignore */
  }
  return false
}

const BASE_OPTIONS = {
  // Light drizzle that fits the mist-atelier look.
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
  tint: [0.96, 0.93, 0.85],
  tintStrength: 0.1,
}

/**
 * Mount the droplet particles over the page shell.
 * Falls back through capture -> overlay -> plain page.
 */
export function mountDroplets(options = {}) {
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

  // ---- capture mode: page lives inside the source canvas -------------
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
    // GL 初始化失败：清理后继续尝试 overlay 模式，而不是直接放弃粒子。
    fail()
  }

  // ---- overlay mode: fixed glass layer over the normal page ------------
  root.appendChild(output)
  root.classList.add('is-active')
  document.documentElement.classList.add('overlay-particle')

  instance = createDroplets(
    { source, content, output },
    {
      ...config,
      // Without captured content there is nothing to refract; raise the
      // tint slightly so the overlay drops read as soft champagne mist.
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
 * Which element scrolls the page:
 *  - capture mode: the content element inside the canvas
 *  - overlay / none / fallback: the window
 */
export function getScrollRoot() {
  return mode === 'capture' ? document.getElementById('scroll-root') : null
}

export function destroyDroplets() {
  instance?.destroy()
  instance = null
  mode = 'none'
}
