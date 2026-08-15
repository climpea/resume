/**
 * App — 应用根组件。
 *
 * 结构即页面：氛围层 → 头部 → 主内容（各区块）→ 页脚。
 * 交互全部收敛到 hooks（useReveal / useScrollProgress / useNavHighlight …）。
 */
import { useEffect, useRef } from 'react'
import { profile } from './content'
import { useNavHighlight } from './hooks/useNavHighlight'
import { useReveal } from './hooks/useReveal'
import { useScrollProgress } from './hooks/useScrollProgress'
import { About } from './components/About'
import { Atmosphere } from './components/Atmosphere'
import { Contact } from './components/Contact'
import { Footer } from './components/Footer'
import { Header } from './components/Header'
import { Hero } from './components/Hero'
import { Marquee } from './components/Marquee'
import { OpenSource } from './components/OpenSource'
import { Projects } from './components/Projects'
import { Work } from './components/Work'

export default function App() {
  useReveal()
  const activeId = useNavHighlight()
  const progressRef = useRef<HTMLDivElement | null>(null)
  useScrollProgress(progressRef)

  // 站点级元信息
  useEffect(() => {
    document.title = `${profile.nameZh} · ${profile.nameEn} — 前端工程师`
    const meta = document.querySelector('meta[name="description"]')
    if (meta) {
      meta.setAttribute(
        'content',
        `${profile.nameZh} · ${profile.nameEn} — 前端工程师，多端统一 / 低代码 / AI 应用落地经验。`,
      )
    }
  }, [])

  return (
    <>
      <div className="scroll-progress" ref={progressRef} aria-hidden="true" />

      <Atmosphere />
      <Header activeId={activeId} />

      <main id="top" tabIndex={-1}>
        <Hero />
        <Marquee />
        <About />
        <Work />
        <Projects />
        <OpenSource />
        <Contact />
      </main>

      <Footer />
    </>
  )
}
