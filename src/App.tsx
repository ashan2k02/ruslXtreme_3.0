import { useEffect, useRef, useState, type MouseEvent, type ReactNode } from 'react'
import {
  Activity,
  ArrowDown,
  ArrowUpRight,
  ChevronRight,
  CircleDot,
  Code2,
  Image as ImageIcon,
  Layers3,
  Mail,
  Menu,
  Radio,
  ShieldCheck,
  Sparkles,
  Trophy,
  Users,
  X,
} from 'lucide-react'
import { BrandMark } from './components/BrandMark'
import { SectionHeading } from './components/SectionHeading'
import { committeeMembers, galleryItems, missionStages, navItems, partnerSlots, ruleGroups } from './data'

function StatusPill({ children, tone = 'placeholder' }: { children: ReactNode; tone?: 'placeholder' | 'live' }) {
  return <span className={`status-pill status-pill--${tone}`}><span />{children}</span>
}

function App() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [activeGallery, setActiveGallery] = useState<number | null>(null)
  const lightboxCloseRef = useRef<HTMLButtonElement>(null)
  const galleryTriggerRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && activeGallery !== null) {
        setActiveGallery(null)
        requestAnimationFrame(() => galleryTriggerRef.current?.focus())
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [activeGallery])

  useEffect(() => {
    if (activeGallery !== null) lightboxCloseRef.current?.focus()
  }, [activeGallery])

  const closeMobile = () => setMobileOpen(false)
  const openGallery = (index: number, event: MouseEvent<HTMLButtonElement>) => {
    galleryTriggerRef.current = event.currentTarget
    setActiveGallery(index)
  }
  const closeGallery = () => {
    setActiveGallery(null)
    requestAnimationFrame(() => galleryTriggerRef.current?.focus())
  }
  const scrollTo = (event: MouseEvent<HTMLAnchorElement>) => {
    const href = event.currentTarget.getAttribute('href')
    if (href?.startsWith('#')) {
      event.preventDefault()
      document.querySelector(href)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      closeMobile()
    }
  }

  return (
    <div className="site-shell">
      <header className="site-header">
        <div className="shell-width site-header__inner">
          <BrandMark />
          <nav className={`site-nav${mobileOpen ? ' site-nav--open' : ''}`} id="primary-navigation" aria-label="Primary navigation">
            {navItems.map((item) => <a key={item.href} href={item.href} onClick={scrollTo}><span>{item.section}</span>{item.label}</a>)}
            <a className="site-nav__cta" href="#contact" onClick={scrollTo}>Contact <ArrowUpRight size={15} /></a>
          </nav>
          <button className="icon-button menu-button" type="button" aria-label={mobileOpen ? 'Close navigation' : 'Open navigation'} aria-expanded={mobileOpen} aria-controls="primary-navigation" onClick={() => setMobileOpen((open) => !open)}>
            {mobileOpen ? <X size={21} /> : <Menu size={21} />}
          </button>
        </div>
      </header>

      <main>
        <section className="hero" id="home">
          <div className="hero__stars hero__stars--one" />
          <div className="hero__stars hero__stars--two" />
          <div className="hero__nebula" />
          <div className="hero__planet hero__planet--large" />
          <div className="hero__planet hero__planet--small" />
          <div className="hero__orbit hero__orbit--one" />
          <div className="hero__orbit hero__orbit--two" />
          <div className="shell-width hero__content">
            <div className="hero__topline"><span>RUSL / 03</span><span className="topline-line" /><span>IEEE STUDENT BRANCH / RAJARATA</span></div>
            <div className="hero__copy">
              <div className="hero__brandline"><span>RUSLXTREME</span><b>3.0</b></div>
              <div className="hero__eyebrow"><span className="signal-dot" />Mission control online <StatusPill tone="live">Registration closed</StatusPill></div>
              <h1>Explore<br /><em>beyond</em> limits<span className="headline-mark">*</span></h1>
              <p className="hero__lede">A competitive programming experience that challenges minds and celebrates innovation.</p>
              <div className="hero__actions">
                <a className="button button--primary" href="#about" onClick={scrollTo}>Explore the Mission <ArrowDown size={17} /></a>
                <a className="button button--ghost" href="#rules" onClick={scrollTo}>Discover the Competition <ArrowUpRight size={16} /></a>
              </div>
            </div>
            <div className="hero__footer">
              <div className="hero__meta"><span className="meta-kicker">Tagline</span><strong>Think. Code. Conquer.</strong></div>
              <div className="hero__meta"><span className="meta-kicker">Transmission</span><strong>Static mission brief / v3.0</strong></div>
              <div className="hero__scroll"><span>Scroll to navigate</span><ArrowDown size={15} /></div>
            </div>
          </div>
        </section>

        <section className="section section--intro" id="about">
          <div className="shell-width intro-grid">
            <div className="section-index">01 <span>/</span> MISSION</div>
            <div className="intro-grid__main">
                <SectionHeading eyebrow="Mission brief" title="Code is a way of seeing further." copy="RUSLXTREME 3.0 is a competitive programming event organized by the IEEE Student Branch of Rajarata University of Sri Lanka. This brief introduces the event while keeping every unconfirmed detail clearly marked." />
              <div className="intro-grid__lower">
                <p className="body-copy">The event identity is built around curiosity, precision, and the rush of solving something that looked impossible a moment ago. Details in this brief remain intentionally honest: anything not supplied by the organizers is marked as a placeholder until verified.</p>
                <div className="brief-card">
                  <div className="brief-card__header"><span>Mission status</span><Radio size={16} /></div>
                  <div className="brief-card__signal"><span className="signal-dot" />Registration closed</div>
                  <p>Team registration is already closed. Official event details will be uplinked by the organizing team.</p>
                  <a href="#contact" onClick={scrollTo}>Request an official update <ChevronRight size={15} /></a>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="section section--dark" id="timeline">
          <div className="shell-width">
            <div className="section-topline"><div className="section-index">02 <span>/</span> TIMELINE</div><StatusPill>Official dates pending</StatusPill></div>
            <div className="split-heading"><SectionHeading eyebrow="Mission timeline" title="Every great solve has a sequence." copy="A clear route from first signal to final debrief. Dates and milestones stay marked as placeholders until the official schedule is released." /><div className="telemetry"><Activity size={17} /><span>Telemetry / static</span><strong>03.0</strong></div></div>
            <div className="timeline-list">
              {missionStages.map((stage, index) => <article className={`timeline-item${index === 2 ? ' timeline-item--active' : ''}`} key={stage.index}>
                <div className="timeline-item__marker"><span>{stage.index}</span><i /></div>
                <div className="timeline-item__label">{stage.label}</div>
                <div className="timeline-item__copy"><h3>{stage.title}</h3><p>{stage.detail}</p></div>
                <StatusPill tone={stage.state === 'verified' ? 'live' : 'placeholder'}>{stage.state === 'verified' ? 'Confirmed' : 'Placeholder'}</StatusPill>
              </article>)}
            </div>
          </div>
        </section>

        <section className="section section--rules" id="rules">
          <div className="shell-width">
            <div className="section-topline"><div className="section-index">03 <span>/</span> RULES</div><div className="section-topline__aside"><ShieldCheck size={16} /> No invented rules</div></div>
            <div className="rules-heading"><SectionHeading eyebrow="Competition protocol" title="Precision over noise." copy="The rules module is ready for the official brief. Until then, these placeholders make missing information visible instead of filling the gaps with guesses." /><div className="rules-orb"><div><Code2 size={25} /><span>RULESET<br />PENDING</span></div></div></div>
            <div className="rule-grid">
              {ruleGroups.map((group) => <article className="rule-card" key={group.number}>
                <div className="rule-card__top"><span className="rule-card__number">{group.number}</span><StatusPill>Placeholder</StatusPill></div>
                <h3>{group.title}</h3><p>{group.detail}</p>
                <ul>{group.items.map((item) => <li key={item}><CircleDot size={13} />{item}</li>)}</ul>
              </article>)}
            </div>
            <div className="rules-note"><Sparkles size={16} /><span>Organizers: replace these placeholders with the verified rulebook before publication.</span><a href="#contact" onClick={scrollTo}>Contact the team <ArrowUpRight size={14} /></a></div>
          </div>
        </section>

        <section className="section section--score" id="leaderboard">
          <div className="shell-width">
            <div className="section-topline"><div className="section-index">04 <span>/</span> RESULTS</div><StatusPill>Awaiting official data</StatusPill></div>
            <div className="score-layout">
              <SectionHeading eyebrow="Leaderboard" title="The scoreboard is quiet. For now." copy="No official competition results were provided. When verified scores arrive, this view is designed to make every position legible." />
              <div className="score-legend"><span><i className="legend-dot legend-dot--cyan" />Live surface</span><span><i className="legend-dot legend-dot--purple" />Verified data only</span></div>
            </div>
            <div className="leaderboard-panel">
              <div className="leaderboard-panel__header"><span>Rank</span><span>Team / competitor</span><span>Score</span><span>Penalty</span></div>
              <div className="leaderboard-empty"><div className="trophy-ring"><Trophy size={26} /></div><h3>Official results will appear here</h3><p>This is an honest empty state — not a sample leaderboard. No team names or scores are presented as real until the organizers confirm them.</p><a href="#contact" onClick={scrollTo} className="text-link">Share an official update <ArrowUpRight size={15} /></a></div>
              <div className="leaderboard-panel__footer"><span><span className="pulse-dot" />Data stream idle</span><span>Last sync — not available</span></div>
            </div>
          </div>
        </section>

        <section className="section section--committee" id="committee">
          <div className="shell-width">
            <div className="section-topline"><div className="section-index">05 <span>/</span> CREW</div><span className="mono-note">PEOPLE BEHIND THE MISSION</span></div>
            <div className="committee-heading"><SectionHeading eyebrow="Organizing committee" title="A mission moves because people do." copy="The organizing committee module is ready for the verified team roster. Profiles below are visibly marked as placeholders until names, roles, and portraits are supplied." /><Users className="committee-heading__icon" size={46} strokeWidth={1} /></div>
            <div className="committee-grid">{committeeMembers.map((member) => <article className="member-card" key={member.role}><div className="member-card__avatar"><span>{member.initials}</span><div className="avatar-orbit" /></div><div className="member-card__role">{member.role}</div><h3>{member.name}</h3><span className="member-card__status"><span />Placeholder profile</span></article>)}</div>
          </div>
        </section>

        <section className="section section--gallery" id="gallery">
          <div className="shell-width">
            <div className="section-topline"><div className="section-index">06 <span>/</span> ARCHIVE</div><div className="section-topline__aside"><ImageIcon size={16} /> Local documented assets</div></div>
            <div className="gallery-heading"><SectionHeading eyebrow="Previous editions" title="Signals from the archive." copy="A visual archive can hold the energy of the event before the next signal arrives. These local abstract assets are clearly labeled placeholders, ready to be replaced with verified edition photography." /><div className="gallery-heading__index">04<br /><span>FRAMES</span></div></div>
            <div className="gallery-grid">{galleryItems.map((item, index) => <button className={`gallery-card gallery-card--${index + 1}`} type="button" key={item.title} onClick={(event) => openGallery(index, event)} aria-label={`Open ${item.title} gallery image`}><img src={item.image} alt={item.alt} /><span className="gallery-card__overlay" /><span className="gallery-card__meta"><span>{item.label}</span><strong>{item.title}</strong></span><span className="gallery-card__open"><ArrowUpRight size={17} /></span></button>)}</div>
          </div>
        </section>

        <section className="section section--partners" id="partners">
          <div className="shell-width partners-layout">
            <div><div className="section-index">07 <span>/</span> ALLIES</div><SectionHeading eyebrow="Sponsors & partners" title="Good work travels farther together." copy="Verified organizations will be listed here as official partnerships are confirmed. No sponsor names or logos have been invented." /><a className="button button--ghost" href="#contact" onClick={scrollTo}>Partner with the mission <ArrowUpRight size={16} /></a></div>
            <div className="partner-stack">{partnerSlots.map((partner, index) => <div className="partner-row" key={partner.label}><span className="partner-row__num">0{index + 1}</span><div className="partner-row__logo"><Layers3 size={17} /><strong>{partner.name}</strong></div><span className="partner-row__label">{partner.label}</span><StatusPill>Pending</StatusPill></div>)}</div>
          </div>
        </section>

        <section className="section section--contact" id="contact">
          <div className="shell-width contact-card">
            <div className="contact-card__visual"><div className="contact-card__grid" /><div className="contact-card__planet" /><span className="contact-card__tag">Open channel / RUSLXTREME 3.0</span><div className="contact-card__code">STATUS: <strong>AWAITING UPLINK</strong><br />ORIGIN: <strong>RAJARATA / LK</strong><br />MODE: <strong>MISSION CONTROL</strong></div></div>
            <div className="contact-card__copy"><div className="section-index">08 <span>/</span> CONTACT</div><SectionHeading eyebrow="Open a channel" title="Have an official update? Send it through." copy="Contact channels were not included in the supplied brief. This space is intentionally ready for the verified organizer email, social links, venue details, and other official updates." /><div className="contact-actions"><span className="button button--primary button--disabled" role="status">Official email pending <Mail size={16} /></span><a className="text-link" href="#home" onClick={scrollTo}>Return to mission start <ArrowUpRight size={15} /></a></div></div>
          </div>
        </section>
      </main>

      <footer className="site-footer"><div className="shell-width site-footer__inner"><BrandMark compact /><p>RUSLXTREME 3.0 — Think. Code. Conquer.</p><div className="footer-links"><a href="#about" onClick={scrollTo}>Mission</a><a href="#gallery" onClick={scrollTo}>Archive</a><a href="#contact" onClick={scrollTo}>Contact</a></div><div className="footer-socials"><a href="#contact" aria-label="Visual archive placeholder" onClick={scrollTo}><ImageIcon size={16} /></a><a href="#contact" aria-label="Community placeholder" onClick={scrollTo}><Users size={16} /></a><a href="#contact" aria-label="Code community placeholder" onClick={scrollTo}><Code2 size={16} /></a></div></div><div className="shell-width site-footer__bottom"><span>Organized by the IEEE Student Branch of Rajarata University of Sri Lanka.</span><span>Frontend mission brief / 2026</span></div></footer>

      {activeGallery !== null && <div className="lightbox" role="dialog" aria-modal="true" aria-label={`${galleryItems[activeGallery].title} gallery image`} onClick={closeGallery}><button ref={lightboxCloseRef} type="button" className="lightbox__close icon-button" aria-label="Close gallery image" onClick={closeGallery}><X size={20} /></button><figure onClick={(event) => event.stopPropagation()}><img src={galleryItems[activeGallery].image} alt={galleryItems[activeGallery].alt} /><figcaption><span>{galleryItems[activeGallery].label}</span><strong>{galleryItems[activeGallery].title}</strong></figcaption></figure></div>}
    </div>
  )
}

export default App
