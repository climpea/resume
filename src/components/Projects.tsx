/** 精选项目：卡片网格 */
import { projects } from '../content'
import { SectionHead } from './SectionHead'

export function Projects() {
  return (
    <section id="projects" className="section projects">
      <SectionHead index="03" label="作品" />
      <h2 className="section__title" data-reveal>
        精选项目
      </h2>

      <ul className="project-grid">
        {projects.map((p, i) => (
          <li data-reveal data-reveal-delay={String(Math.min(i % 2, 2))} key={p.name}>
            <a
              className="project-card"
              href={p.href}
              {...(p.href !== '#' ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
            >
              <span className="project-card__cover" aria-hidden="true">
                <span className="project-card__num">{String(i + 1).padStart(2, '0')}</span>
                <span className="project-card__org">{p.org}</span>
                <span className="project-card__arrow">↗</span>
              </span>
              <h3 className="project-card__name">{p.name}</h3>
              <p className="project-card__desc">{p.desc}</p>
              {p.tech.length > 0 && (
                <ul className="project-card__tech">
                  {p.tech.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
              )}
            </a>
          </li>
        ))}
      </ul>
    </section>
  )
}
