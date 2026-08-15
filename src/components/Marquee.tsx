/** 走马灯：关键词无缝滚动（内容重复 3 份，配合 CSS translateX(-33.333%)） */
import { Fragment } from 'react'
import { marquee } from '../content'

export function Marquee() {
  const track = Array.from({ length: 3 }, () => marquee).flat()
  return (
    <div className="marquee" aria-hidden="true">
      <div className="marquee__track">
        {track.map((item, i) => (
          <Fragment key={i}>
            <span className="marquee__item">{item}</span>
            <span className="marquee__sep" aria-hidden="true">
              ✦
            </span>
          </Fragment>
        ))}
      </div>
    </div>
  )
}
