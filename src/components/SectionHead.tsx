/** 区块头：编号 —— 分隔线 —— 标签 */
export function SectionHead({ index, label }: { index: string; label: string }) {
  return (
    <div className="section__head">
      <span className="section__index" data-reveal>
        {index}
      </span>
      <span className="section__rule" data-reveal />
      <span className="section__label" data-reveal>
        {label}
      </span>
    </div>
  )
}
