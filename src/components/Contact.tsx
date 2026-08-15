/** 联系：大标题 + 邮箱按钮 + 联系方式 */
import { useMemo } from 'react'
import { profile } from '../content'
import { SectionHead } from './SectionHead'

interface LinkItem {
  key: string
  label: string
  href?: string
  plain?: boolean
  external?: boolean
}

export function Contact() {
  const links = useMemo<LinkItem[]>(() => {
    const items: LinkItem[] = []
    if (profile.phone) items.push({ key: 'phone', label: profile.phone, href: `tel:${profile.phone}` })
    if (profile.location) items.push({ key: 'location', label: profile.location, plain: true })
    if (profile.links.github) items.push({ key: 'github', label: 'GitHub', href: profile.links.github, external: true })
    if (profile.links.linkedin) items.push({ key: 'linkedin', label: 'LinkedIn', href: profile.links.linkedin, external: true })
    if (profile.links.blog) items.push({ key: 'blog', label: 'Blog', href: profile.links.blog, external: true })
    return items
  }, [])

  return (
    <section id="contact" className="section contact">
      <div className="contact__watermark" aria-hidden="true">
        LET'S TALK
      </div>

      <SectionHead index="05" label="联系" />

      <h2 className="contact__title" data-reveal>
        一起聊聊<span className="contact__title-break">新想法</span>
        <span className="contact__title-dot">.</span>
      </h2>

      <p className="contact__text" data-reveal data-reveal-delay="1">
        目前在北京，求职前端工程师。欢迎就机会、协作或技术问题联系我。
      </p>

      <div className="contact__actions" data-reveal data-reveal-delay="2">
        <a className="btn btn--primary contact__email" href={`mailto:${profile.email}`}>
          {profile.email}
        </a>
        <div className="contact__links">
          {links.map((l) =>
            l.plain ? (
              <span key={l.key}>{l.label}</span>
            ) : (
              <a
                key={l.key}
                href={l.href}
                {...(l.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
              >
                {l.label}
              </a>
            ),
          )}
        </div>
      </div>
    </section>
  )
}
