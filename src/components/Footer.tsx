/** 页脚 */
import { profile } from '../content'
import { scrollToHash } from '../lib/scroll'

export function Footer() {
  return (
    <footer className="site-footer">
      <span className="footer__name">
        {profile.nameZh} · {profile.nameEn}
      </span>
      <span className="footer__meta">
        © {new Date().getFullYear()} · {profile.location}
      </span>
      <a className="footer__top" href="#top" onClick={(e) => scrollToHash('#top', e)}>
        回到顶部 ↑
      </a>
    </footer>
  )
}
