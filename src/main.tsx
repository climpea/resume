/**
 * main.tsx — 应用入口。
 *
 * 挂载顺序很关键：先挂粒子（决定滚动容器模式：capture / overlay），
 * 再挂 React。粒子壳（#particle-root / #scroll-root）由 index.html 提供，
 * React 只渲染 #root 内部内容。
 */
import './fonts.css'
import './style.css'
import { createRoot } from 'react-dom/client'
import App from './App'
import { mountDroplets } from './lib/droplets'

mountDroplets()

const rootEl = document.getElementById('root')
if (!rootEl) throw new Error('#root not found')
createRoot(rootEl).render(<App />)
