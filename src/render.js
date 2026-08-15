/**
 * render.js — 把 content.js 的数据渲染进 DOM 骨架。
 * 与交互（interactions.js）、粒子特效（droplets.js）解耦。
 */
import {
  about,
  experience,
  marquee,
  profile,
  projects,
  skillGroups,
  stats,
} from './content.js'

function $(selector, root = document) {
  return root.querySelector(selector)
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}

function escapeAttr(value) {
  return escapeHtml(value).replaceAll("'", '&#39;')
}

function pad2(n) {
  return String(n).padStart(2, '0')
}

export function render() {
  $('.hero__tagline').textContent = profile.tagline
  $('.hero__subtitle').textContent = profile.subtitle
  $('.about__lead').textContent = about.lead
  $('.about__body').textContent = about.body

  renderMarquee()
  renderStats()
  renderSkills()
  renderTimeline()
  renderProjects()
  renderContact()
  renderChrome()
}

/** 走马灯：内容重复 3 份，配合 CSS translateX(-33.333%) 无缝循环 */
function renderMarquee() {
  const track = $('#marquee-track')
  if (!track) return
  const html = marquee
    .map(
      (item) =>
        `<span class="marquee__item">${escapeHtml(item)}</span>` +
        `<span class="marquee__sep" aria-hidden="true">✦</span>`,
    )
    .join('')
  track.innerHTML = html.repeat(3)
}

/** 关键成果条（dl） */
function renderStats() {
  const el = $('.stats')
  if (!el) return
  el.innerHTML = stats
    .map(
      (s) => `
      <div class="stat" data-reveal>
        <dt class="stat__value">${escapeHtml(s.value)}</dt>
        <dd class="stat__label">${escapeHtml(s.label)}</dd>
        <dd class="stat__detail">${escapeHtml(s.detail)}</dd>
      </div>`,
    )
    .join('')
}

/** 技能：按方向分组 */
function renderSkills() {
  const el = $('.skill-groups')
  if (!el) return
  el.innerHTML = skillGroups
    .map(
      (group) => `
      <section class="skill-group" aria-label="${escapeAttr(group.title)}">
        <h3 class="skill-group__title">${escapeHtml(group.title)}</h3>
        <ul class="skill-group__list">
          ${group.items.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}
        </ul>
      </section>`,
    )
    .join('')
}

/** 经历时间线：编号 + 时间 + 要点 */
function renderTimeline() {
  const timeline = $('.timeline')
  if (!timeline) return
  timeline.innerHTML = experience
    .map(
      (item, i) => `
      <li class="timeline__item" data-reveal data-reveal-delay="${Math.min(i, 3)}">
        <span class="timeline__index" aria-hidden="true">${pad2(i + 1)}</span>
        <p class="timeline__period">${escapeHtml(item.period)}</p>
        <div class="timeline__body">
          <h3 class="timeline__role">${escapeHtml(item.role)}</h3>
          <p class="timeline__org">${escapeHtml(item.org)}</p>
          <ul class="timeline__points">
            ${item.points.map((point) => `<li>${escapeHtml(point)}</li>`).join('')}
          </ul>
        </div>
      </li>`,
    )
    .join('')
}

/** 精选项目：卡片网格 */
function renderProjects() {
  const list = $('.project-grid')
  if (!list) return
  list.innerHTML = projects
    .map(
      (p, i) => `
      <li data-reveal data-reveal-delay="${Math.min(i % 2, 2)}">
        <a class="project-card" href="${escapeAttr(p.href)}" ${p.href === '#' ? '' : 'target="_blank" rel="noopener noreferrer"'}>
          <span class="project-card__cover" aria-hidden="true">
            <span class="project-card__num">${pad2(i + 1)}</span>
            <span class="project-card__org">${escapeHtml(p.org)}</span>
            <span class="project-card__arrow">↗</span>
          </span>
          <h3 class="project-card__name">${escapeHtml(p.name)}</h3>
          <p class="project-card__desc">${escapeHtml(p.desc)}</p>
          ${p.tech?.length ? `<ul class="project-card__tech">${p.tech.map((t) => `<li>${escapeHtml(t)}</li>`).join('')}</ul>` : ''}
        </a>
      </li>`,
    )
    .join('')
}

/** 联系区 */
function renderContact() {
  const email = $('.contact__email')
  if (email) {
    email.href = `mailto:${profile.email}`
    email.textContent = profile.email
  }

  const links = $('.contact__links')
  if (links) {
    const items = [
      profile.phone && { label: profile.phone, href: `tel:${profile.phone}`, external: false },
      profile.location && { label: profile.location, href: '', external: false, plain: true },
      profile.links.github && { label: 'GitHub', href: profile.links.github, external: true },
      profile.links.linkedin && { label: 'LinkedIn', href: profile.links.linkedin, external: true },
      profile.links.blog && { label: 'Blog', href: profile.links.blog, external: true },
    ].filter(Boolean)

    links.innerHTML = items
      .map((l) => {
        if (l.plain) return `<span>${escapeHtml(l.label)}</span>`
        const extra = l.external ? ' target="_blank" rel="noopener noreferrer"' : ''
        return `<a href="${escapeAttr(l.href)}"${extra}>${escapeHtml(l.label)}</a>`
      })
      .join('')
  }

  const contactText = $('.contact__text')
  if (contactText && profile.location) {
    contactText.textContent = `目前在北京，求职前端工程师。欢迎就机会、协作或技术问题联系我。`
  }
}

/** 站点级文案（页脚 / title / meta） */
function renderChrome() {
  const metaEl = $('.footer__meta')
  if (metaEl) {
    metaEl.textContent = `© ${new Date().getFullYear()} · ${profile.location}`
  }

  document.title = `${profile.nameZh} · ${profile.nameEn} — 前端工程师`
  const meta = document.querySelector('meta[name="description"]')
  if (meta) {
    meta.content = `${profile.nameZh} · ${profile.nameEn} — 前端工程师，多端统一 / 低代码 / AI 应用落地经验。`
  }
}
