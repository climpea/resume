import './style.css'
import { about, experience, profile, projects, skills } from './content.js'

function $(selector, root = document) {
  return root.querySelector(selector)
}

function render() {
  $('.hero__title').textContent = profile.title
  $('.hero__tagline').textContent = profile.tagline
  $('.about__lead').textContent = about.lead
  $('.about__body').textContent = about.body

  const skillsEl = $('.skills')
  skillsEl.innerHTML = skills.map((s) => `<li>${escapeHtml(s)}</li>`).join('')

  const timeline = $('.timeline')
  timeline.innerHTML = experience
    .map(
      (item, i) => `
      <li class="timeline__item" data-reveal data-reveal-delay="${Math.min(i, 3)}">
        <p class="timeline__period">${escapeHtml(item.period)}</p>
        <div>
          <h3 class="timeline__role">${escapeHtml(item.role)}</h3>
          <p class="timeline__org">${escapeHtml(item.org)}</p>
          <p class="timeline__summary">${escapeHtml(item.summary)}</p>
        </div>
      </li>`
    )
    .join('')

  const projectList = $('.project-list')
  projectList.innerHTML = projects
    .map(
      (p, i) => `
      <li data-reveal data-reveal-delay="${Math.min(i, 3)}">
        <a class="project" href="${escapeAttr(p.href)}" ${p.href === '#' ? '' : 'target="_blank" rel="noopener noreferrer"'}>
          <span class="project__year">${escapeHtml(p.year)}</span>
          <div>
            <h3 class="project__name">${escapeHtml(p.name)}</h3>
            <p class="project__desc">${escapeHtml(p.desc)}</p>
          </div>
          <span class="project__arrow" aria-hidden="true">→</span>
        </a>
      </li>`
    )
    .join('')

  const email = $('.contact__email')
  email.href = `mailto:${profile.email}`
  email.textContent = profile.email

  const links = $('.contact__links')
  const linkItems = [
    profile.links.github && { label: 'GitHub', href: profile.links.github },
    profile.links.linkedin && { label: 'LinkedIn', href: profile.links.linkedin },
    profile.links.blog && { label: 'Blog', href: profile.links.blog },
  ].filter(Boolean)

  links.innerHTML = linkItems
    .map(
      (l) =>
        `<a href="${escapeAttr(l.href)}" target="_blank" rel="noopener noreferrer">${escapeHtml(l.label)}</a>`
    )
    .join('')

  $('.footer__name').textContent = `${profile.nameZh} · ${profile.nameEn}`
  $('.footer__copy').textContent = `© ${new Date().getFullYear()}`

  document.title = `${profile.nameZh} · ${profile.nameEn}`
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

function setupReveal() {
  const nodes = document.querySelectorAll('[data-reveal]')
  if (!('IntersectionObserver' in window)) {
    nodes.forEach((el) => el.classList.add('is-visible'))
    return
  }

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible')
          io.unobserve(entry.target)
        }
      })
    },
    { threshold: 0.16, rootMargin: '0px 0px -6% 0px' }
  )

  nodes.forEach((el) => io.observe(el))
}

function setupHeader() {
  const header = $('.site-header')
  const onScroll = () => {
    header.classList.toggle('is-scrolled', window.scrollY > 12)
  }
  onScroll()
  window.addEventListener('scroll', onScroll, { passive: true })
}

render()
setupReveal()
setupHeader()
