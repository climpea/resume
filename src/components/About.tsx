/** 关于：大标题陈述 + 个人介绍 + 技能分组 + 关键成果数字 */
import { about, skillGroups, stats } from '../content'
import { SectionHead } from './SectionHead'

export function About() {
  return (
    <section id="about" className="section about">
      <SectionHead index="01" label="关于" />

      <div className="about__grid">
        <h2 className="about__lead" data-reveal>
          {about.lead}
        </h2>
        <div className="about__side" data-reveal data-reveal-delay="1">
          <p className="about__body">{about.body}</p>
          <div className="skill-groups" aria-label="技能">
            {skillGroups.map((group) => (
              <section className="skill-group" aria-label={group.title} key={group.title}>
                <h3 className="skill-group__title">{group.title}</h3>
                <ul className="skill-group__list">
                  {group.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        </div>
      </div>

      <dl className="stats" aria-label="关键成果">
        {stats.map((s) => (
          <div className="stat" data-reveal key={s.label}>
            <dt className="stat__value">{s.value}</dt>
            <dd className="stat__label">{s.label}</dd>
            <dd className="stat__detail">{s.detail}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}
