/** 背景氛围：光晕 + 细网格（纯装饰） */
export function Atmosphere() {
  return (
    <div className="atmosphere" aria-hidden="true">
      <div className="atmosphere__glow atmosphere__glow--a" />
      <div className="atmosphere__glow atmosphere__glow--b" />
      <div className="atmosphere__grid" />
    </div>
  )
}
