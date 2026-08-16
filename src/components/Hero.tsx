/** Hero 首屏：聚光跟随 + 巨型混排标题 + 旋转徽章 + 行动按钮 */
import { useRef } from 'react'
import { profile } from '../content'
import { useHeroSpotlight } from '../hooks/useHeroSpotlight'
import { scrollToHash } from '../lib/scroll'

export function Hero() {
  const heroRef = useRef<HTMLElement | null>(null)
  useHeroSpotlight(heroRef)

  return (
    <section className="hero" aria-label="首页" ref={heroRef}>
      <div className="hero__spotlight" aria-hidden="true" />

      <div className="hero__meta" data-reveal>
        <span>PORTFOLIO — 2025</span>
        <span className="hero__meta-dot" aria-hidden="true">·</span>
        <span>BEIJING, CN</span>
        <span className="hero__meta-dot" aria-hidden="true">·</span>
        <span className="hero__meta-strong">前端开发</span>
      </div>

      <h1 className="hero__title">
        <span className="hero__en hero__en--solid" data-reveal>
          YONGHUI
        </span>
        <span className="hero__row" data-reveal data-reveal-delay="1">
          <span className="hero__en hero__en--ghost">LI</span>
          <span className="hero__zh">{profile.nameZh}</span>
        </span>
      </h1>

      <div className="hero__side" aria-hidden="true" data-reveal data-reveal-delay="2">
        <svg className="hero__badge" viewBox="0 0 120 120">
          <defs>
            <path id="badge-circle" d="M60,60 m-44,0 a44,44 0 1,1 88,0 a44,44 0 1,1 -88,0" />
          </defs>
          <text className="hero__badge-text">
            <textPath href="#badge-circle">OPEN TO WORK · 前端工程师 · OPEN TO WORK ·</textPath>
          </text>
          <circle className="hero__badge-center" cx="60" cy="60" r="6" />
        </svg>
      </div>

      <div className="hero__foot">
        <div className="hero__copy">
          <p className="hero__tagline" data-reveal data-reveal-delay="3">
            {profile.tagline}
          </p>
          <p className="hero__subtitle" data-reveal data-reveal-delay="3">
            {profile.subtitle}
          </p>
        </div>
        <div className="hero__actions" data-reveal data-reveal-delay="4">
          <a className="btn btn--primary" href="#work" onClick={(e) => scrollToHash('#work', e)}>
            查看经历
          </a>
          <a className="btn btn--ghost" href="#contact" onClick={(e) => scrollToHash('#contact', e)}>
            联系我
          </a>
        </div>
      </div>

      <div className="hero__scrollhint" aria-hidden="true" data-reveal data-reveal-delay="4">
        <span>SCROLL</span>
        <span className="hero__scrollhint-line" />
      </div>
    </section>
  )
}
