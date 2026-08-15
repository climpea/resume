/**
 * main.js — 应用入口。
 *
 * 职责分三层：
 *  1. data     src/content.js      —— 唯一数据源
 *  2. render   src/render.js       —— 数据 -> DOM
 *  3. effects  src/interactions.js —— 交互；src/droplets.js —— 粒子特效
 *
 * 加载顺序：先挂粒子（决定滚动容器模式），再渲染内容与交互。
 */
import './fonts.css'
import './style.css'
import { mountDroplets, getScrollRoot } from './droplets.js'
import { render } from './render.js'
import {
  setupReveal,
  setupHeader,
  setupAnchors,
  setupProgress,
  setupNavHighlight,
  setupHeroSpotlight,
} from './interactions.js'

mountDroplets()
render()

const scrollRoot = getScrollRoot()
setupReveal(scrollRoot)
setupHeader(scrollRoot)
setupAnchors(scrollRoot)
setupProgress(scrollRoot)
setupNavHighlight(scrollRoot)
setupHeroSpotlight()
