/** 经历：编号 + 时间 + 要点 */
import { experience } from '../content'
import { SectionHead } from './SectionHead'

export function Work() {
  return (
    <section id="work" className="section work">
      <SectionHead index="02" label="经历" />

      <ol className="timeline">
        {experience.map((item, i) => (
          <li
            className="timeline__item"
            data-reveal
            data-reveal-delay={String(Math.min(i, 3))}
            key={`${item.org}-${item.period}`}
          >
            <span className="timeline__index" aria-hidden="true">
              {String(i + 1).padStart(2, '0')}
            </span>
            <p className="timeline__period">{item.period}</p>
            <div className="timeline__body">
              <h3 className="timeline__role">{item.role}</h3>
              <p className="timeline__org">{item.org}</p>
              <ul className="timeline__points">
                {item.points.map((point, j) => (
                  <li key={j}>{point}</li>
                ))}
              </ul>
            </div>
          </li>
        ))}
      </ol>
    </section>
  )
}
