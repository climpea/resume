/** 关于：大标题陈述 + 自我评价（右列）+ 技能特长（独立小模块）+ 关键成果数字 */
import { Fragment } from 'react'
import type { ReactNode } from 'react'
import { about, skillGroups, stats } from '../content'
import { SectionHead } from './SectionHead'

/** 把「类别：描述」原文拆成标签 + 正文（仅展示拆分，文字不变） */
function splitSkill(item: string): { cat: string; desc: string } {
  const idx = item.indexOf('：')
  return idx > 0 ? { cat: item.slice(0, idx), desc: item.slice(idx + 1) } : { cat: '', desc: item }
}

/** 大标题中需要高亮的技术名词（仅展示强调，文本与顺序不变） */
const LEAD_HIGHLIGHTS = ['React + TypeScript', 'HTML5/CSS3/JavaScript', 'UmiJS/MobX/Ant Design']

/** 把句子按关键词拆成 普通文本 + 高亮词 片段 */
function renderLead(text: string): ReactNode[] {
  const pattern = new RegExp(`(${LEAD_HIGHLIGHTS.map((t) => t.replace(/[.+]/g, '\\$&')).join('|')})`, 'g')
  return text.split(pattern).map((part, i) =>
    LEAD_HIGHLIGHTS.includes(part) ? (
      <em className="about__lead-hl" key={i}>
        {part}
      </em>
    ) : (
      <Fragment key={i}>{part}</Fragment>
    ),
  )
}

export function About() {
  const skills = skillGroups.flatMap((g) => g.items)

  return (
    <section id="about" className="section about">
      <SectionHead index="01" label="关于" />

      <div className="about__grid">
        <h2 className="about__lead" data-reveal>
          {renderLead(about.lead)}
        </h2>
        <div className="about__side" data-reveal data-reveal-delay="1">
          <div className="about__eval" aria-label="自我评价">
            {about.items.map((item, i) => (
              <p className="about__body" key={i}>
                {item}
              </p>
            ))}
          </div>
        </div>
      </div>

      {/* 技能特长：独立小模块，标签 + 说明 双列行式排版 */}
      <section className="about__skills" data-reveal aria-label="技能特长">
        <h3 className="about__skills-title">{skillGroups[0]?.title ?? '技能特长'}</h3>
        <ul className="about__skills-list">
          {skills.map((item) => {
            const { cat, desc } = splitSkill(item)
            return (
              <li className="about__skill" key={item}>
                {cat && <span className="about__skill-cat">{cat}：</span>}
                <span className="about__skill-desc">{desc}</span>
              </li>
            )
          })}
        </ul>
      </section>

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

