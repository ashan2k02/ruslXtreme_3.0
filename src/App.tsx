import { useEffect, useRef, useState, type MouseEvent, type ReactNode } from 'react'
import {
  Activity,
  ArrowDown,
  ArrowUpRight,
  Award,
  Building2,
  ChevronRight,
  CircleDot,
  Code2,
  Globe,
  Image as ImageIcon,
  Layers3,
  Mail,
  MapPin,
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
import { navItems, ruleGroups } from './data'
import { committeeLeadership, committeeTeams } from './data/committee'
import { archiveEvents, archiveItems } from './data/archive'
import { competitionInfo, journeyStages } from './data/competition'
import { faqItems, sponsorSlots } from './data/community'

function LinkedInIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37h2.79V10.9H6.46M7.86 6.3a1.63 1.63 0 1 0 0 3.26 1.63 1.63 0 0 0 0-3.26z" />
    </svg>
  )
}

function GitHubIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
  )
}

function StatusPill({ children, tone = 'placeholder' }: { children: ReactNode; tone?: 'placeholder' | 'live' }) {
  return <span className={`status-pill status-pill--${tone}`}><span />{children}</span>
}

function App() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [activeGallery, setActiveGallery] = useState<number | null>(null)
  const [openFaqs, setOpenFaqs] = useState<Record<string, boolean>>({ [faqItems[0].id]: true })
  const toggleFaq = (id: string) => setOpenFaqs((prev) => ({ ...prev, [id]: !prev[id] }))
  const lightboxCloseRef = useRef<HTMLButtonElement>(null)
  const galleryTriggerRef = useRef<HTMLButtonElement>(null)
  const heroRef = useRef<HTMLElement>(null)
  const cursorGlowRef = useRef<HTMLDivElement>(null)
  const celestialRef = useRef<HTMLDivElement>(null)
  const starsNearRef = useRef<HTMLDivElement>(null)
  const starsMidRef = useRef<HTMLDivElement>(null)
  const terrainRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const isTouch = window.matchMedia('(hover: none) or (pointer: coarse)').matches
    if (prefersReducedMotion || isTouch) return

    const hero = heroRef.current
    if (!hero) return

    let rafId: number
    let targetX = 0
    let targetY = 0
    let currentGlowX = 0
    let currentGlowY = 0
    let targetNormX = 0
    let targetNormY = 0
    let isInside = false

    const onPointerMove = (e: globalThis.MouseEvent) => {
      const rect = hero.getBoundingClientRect()
      const relX = e.clientX - rect.left
      const relY = e.clientY - rect.top

      targetX = relX
      targetY = relY
      targetNormX = ((relX / rect.width) - 0.5) * 2
      targetNormY = ((relY / rect.height) - 0.5) * 2

      if (!isInside) {
        isInside = true
        currentGlowX = relX
        currentGlowY = relY
        if (cursorGlowRef.current) {
          cursorGlowRef.current.style.opacity = '1'
        }
      }
    }

    const onPointerLeave = () => {
      isInside = false
      if (cursorGlowRef.current) {
        cursorGlowRef.current.style.opacity = '0'
      }
      targetNormX = 0
      targetNormY = 0
    }

    let smoothOffX = 0
    let smoothOffY = 0

    const render = () => {
      if (isInside && cursorGlowRef.current) {
        currentGlowX += (targetX - currentGlowX) * 0.14
        currentGlowY += (targetY - currentGlowY) * 0.14
        cursorGlowRef.current.style.transform = `translate3d(${currentGlowX}px, ${currentGlowY}px, 0)`
      }

      smoothOffX += (targetNormX - smoothOffX) * 0.05
      smoothOffY += (targetNormY - smoothOffY) * 0.05

      if (celestialRef.current) {
        const cx = smoothOffX * -14
        const cy = smoothOffY * -12
        celestialRef.current.style.transform = `translate3d(${cx.toFixed(2)}px, ${cy.toFixed(2)}px, 0)`
      }

      if (starsNearRef.current) {
        const sx = smoothOffX * -8
        const sy = smoothOffY * -7
        starsNearRef.current.style.transform = `translate3d(${sx.toFixed(2)}px, ${sy.toFixed(2)}px, 0)`
      }

      if (starsMidRef.current) {
        const mx = smoothOffX * -4
        const my = smoothOffY * -3
        starsMidRef.current.style.transform = `translate3d(${mx.toFixed(2)}px, ${my.toFixed(2)}px, 0)`
      }

      if (terrainRef.current) {
        const tx = smoothOffX * -6
        const ty = smoothOffY * -3
        terrainRef.current.style.transform = `translate3d(${tx.toFixed(2)}px, ${ty.toFixed(2)}px, 0)`
      }

      rafId = requestAnimationFrame(render)
    }

    hero.addEventListener('mousemove', onPointerMove, { passive: true })
    hero.addEventListener('mouseleave', onPointerLeave, { passive: true })
    rafId = requestAnimationFrame(render)

    return () => {
      hero.removeEventListener('mousemove', onPointerMove)
      hero.removeEventListener('mouseleave', onPointerLeave)
      cancelAnimationFrame(rafId)
    }
  }, [])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (activeGallery !== null) {
          setActiveGallery(null)
          requestAnimationFrame(() => galleryTriggerRef.current?.focus())
        } else if (mobileOpen) {
          setMobileOpen(false)
        }
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [activeGallery, mobileOpen])

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
        <section className="hero" id="home" ref={heroRef}>
          <div className="hero__lunar-bg" aria-hidden="true" />
          <div className="hero__vignette" aria-hidden="true" />
          <div className="hero__cursor-glow" ref={cursorGlowRef} aria-hidden="true" />

          <div className="hero__stars hero__stars--deep" aria-hidden="true" />
          <div className="hero__stars hero__stars--mid" ref={starsMidRef} aria-hidden="true" />
          <div className="hero__stars hero__stars--near" ref={starsNearRef} aria-hidden="true" />

          <div className="hero__twinkles" aria-hidden="true">
            <span className="twinkle-star twinkle-star--1" />
            <span className="twinkle-star twinkle-star--2" />
            <span className="twinkle-star twinkle-star--3" />
            <span className="twinkle-star twinkle-star--4" />
          </div>

          <div className="hero__celestial-system" ref={celestialRef} aria-hidden="true">
            <div className="hero__moon">
              <div className="hero__moon-rimlight" />
            </div>
            <div className="hero__earth" />
          </div>

          <div className="hero__terrain" ref={terrainRef} aria-hidden="true">
            <svg className="hero__terrain-svg" viewBox="0 0 1920 280" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="terrainFade" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="transparent" />
                  <stop offset="35%" stopColor="#0a0d14" stopOpacity=".88" />
                  <stop offset="100%" stopColor="#080b12" />
                </linearGradient>
              </defs>
              <path d="M0 280V195c30-8 80-35 140-42 65-7 130 12 210 5 90-8 155-38 230-32 85 7 160 42 245 38 75-4 140-28 215-35 80-8 160 6 240 2 70-3 130-22 200-28 65-5 120 8 190 12 55 3 120-5 160-12l90 177z" fill="url(#terrainFade)" />
              <ellipse cx="420" cy="230" rx="55" ry="12" fill="rgba(6,8,14,.7)" />
              <ellipse cx="820" cy="210" rx="38" ry="9" fill="rgba(6,8,14,.65)" />
              <ellipse cx="1350" cy="225" rx="48" ry="11" fill="rgba(6,8,14,.6)" />
              <ellipse cx="250" cy="245" rx="28" ry="7" fill="rgba(8,10,16,.5)" />
              <ellipse cx="650" cy="240" rx="22" ry="5" fill="rgba(8,10,16,.45)" />
            </svg>
          </div>

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
              {journeyStages.map((stage) => <article className={`timeline-item${stage.state === 'verified' ? ' timeline-item--active' : ''}`} key={stage.index}>
                <div className="timeline-item__marker"><span>{stage.index}</span><i /></div>
                <div className="timeline-item__label">{stage.label}</div>
                <div className="timeline-item__copy"><h3>{stage.title}</h3><p>{stage.detail}</p></div>
                <StatusPill tone={stage.state === 'verified' ? 'live' : 'placeholder'}>{stage.state === 'verified' ? 'Verified' : 'Pending'}</StatusPill>
              </article>)}
            </div>
          </div>
        </section>

        <section className="section section--rules" id="rules">
          <div className="shell-width">
            <div className="section-topline"><div className="section-index">03 <span>/</span> RULES</div><div className="section-topline__aside"><ShieldCheck size={16} /> No invented rules</div></div>
            <div className="rules-heading"><SectionHeading eyebrow="Competition protocol" title="Precision over noise." copy="The rules module is ready for the official brief. Until then, these placeholders make missing information visible instead of filling the gaps with guesses." /><div className="rules-orb"><div><Code2 size={25} /><span>RULESET<br />PENDING</span></div></div></div>
            <div className="competition-info" aria-label="Competition information"><div className="competition-info__intro"><span className="competition-info__kicker"><Radio size={14} /> Mission dossier</span><h3>Know what is confirmed.</h3><p>One verified signal, with every missing detail left visible until the official brief arrives.</p></div><div className="competition-info__grid">{competitionInfo.map((field) => <div className={`competition-info__field competition-info__field--${field.state}`} key={field.label}><div><span>{field.label}</span><StatusPill tone={field.state === 'verified' ? 'live' : 'placeholder'}>{field.state === 'verified' ? 'Verified' : 'Pending'}</StatusPill></div><strong>{field.value}</strong><small>{field.note}</small></div>)}</div></div>
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
            <div className="section-topline"><div className="section-index">05 <span>/</span> CREW</div><StatusPill tone="live">Official committee verified</StatusPill></div>
            <div className="committee-heading"><SectionHeading eyebrow="Organizing committee" title="The crew behind the signal." copy="The official organizing committee powering RUSLXTREME 3.0. Dedicated leads, coordinators, and contributors across all operational tracks." /><Users className="committee-heading__icon" size={46} strokeWidth={1} /></div>
            <div className="committee-demo-note committee-verified-note"><span className="signal-dot" /> OFFICIAL COMMITTEE DIRECTORY <span>Verified roles and members from official committee submissions.</span></div>
            <div className="committee-leadership">
              {committeeLeadership.map((member) => (
                <article className="leader-card" key={member.id}>
                  <div className="leader-card__image-wrap">
                    <img src={member.portrait} alt={`${member.name}, ${member.title} portrait`} loading="lazy" decoding="async" />
                    <span className="leader-card__scan">LEADERSHIP / VERIFIED</span>
                    <span className="leader-card__index">0{committeeLeadership.indexOf(member) + 1}</span>
                  </div>
                  <div className="leader-card__body">
                    <div className="member-card__role">{member.title}</div>
                    <h3>{member.name}</h3>
                    <p>{member.bio}</p>
                    <div className="member-card__footer">
                      <span className="member-card__status member-card__status--verified"><span />Verified leader</span>
                      {(member.linkedin || member.github || member.portfolio) && (
                        <div className="member-card__socials">
                          {member.linkedin && (
                            <a href={member.linkedin} target="_blank" rel="noopener noreferrer" className="member-card__social-link" aria-label={`LinkedIn profile of ${member.name}`}>
                              <LinkedInIcon size={14} />
                            </a>
                          )}
                          {member.github && (
                            <a href={member.github} target="_blank" rel="noopener noreferrer" className="member-card__social-link" aria-label={`GitHub profile of ${member.name}`}>
                              <GitHubIcon size={14} />
                            </a>
                          )}
                          {member.portfolio && (
                            <a href={member.portfolio} target="_blank" rel="noopener noreferrer" className="member-card__social-link" aria-label={`Portfolio website of ${member.name}`}>
                              <Globe size={14} />
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
            <div className="committee-teams">
              {committeeTeams.map((team, teamIndex) => (
                <section className="committee-team" key={team.id} aria-labelledby={`team-${team.id}`}>
                  <div className="committee-team__heading">
                    <div>
                      <span className="committee-team__index">0{teamIndex + 1}</span>
                      <h3 id={`team-${team.id}`}>{team.name}</h3>
                    </div>
                    <p>{team.description}</p>
                  </div>
                  <div className="committee-members">
                    {team.members.map((member) => (
                      <article className="directory-card" key={member.id}>
                        <img src={member.portrait} alt={`${member.name}, ${member.title} portrait`} loading="lazy" decoding="async" />
                        <div className="directory-card__body">
                          <span className="member-card__role">{member.title}</span>
                          <h4>{member.name}</h4>
                          <span className="directory-card__team">{member.team}</span>
                          <div className="member-card__footer">
                            <span className="member-card__status member-card__status--verified"><span />Verified member</span>
                            {(member.linkedin || member.github || member.portfolio) && (
                              <div className="member-card__socials">
                                {member.linkedin && (
                                  <a href={member.linkedin} target="_blank" rel="noopener noreferrer" className="member-card__social-link" aria-label={`LinkedIn profile of ${member.name}`}>
                                    <LinkedInIcon size={13} />
                                  </a>
                                )}
                                {member.github && (
                                  <a href={member.github} target="_blank" rel="noopener noreferrer" className="member-card__social-link" aria-label={`GitHub profile of ${member.name}`}>
                                    <GitHubIcon size={13} />
                                  </a>
                                )}
                                {member.portfolio && (
                                  <a href={member.portfolio} target="_blank" rel="noopener noreferrer" className="member-card__social-link" aria-label={`Portfolio website of ${member.name}`}>
                                    <Globe size={13} />
                                  </a>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          </div>
        </section>

        <section className="section section--gallery" id="gallery">
          <div className="shell-width">
            <div className="section-topline"><div className="section-index">06 <span>/</span> ARCHIVE</div><div className="section-topline__aside"><ImageIcon size={16} /> Local illustrative archive</div></div>
            <div className="gallery-heading"><SectionHeading eyebrow="Past events & memories" title="Every challenge leaves a legacy." copy="The archive celebrates the spirit of RUSLXTREME across its event chapters. Authentic photography and verified history will replace these clearly labeled demo visuals when supplied by the organizers." /><div className="gallery-heading__index">03<br /><span>CHAPTERS</span></div></div>
            <div className="archive-demo-note"><span className="signal-dot" /> ILLUSTRATIVE DEMO ARCHIVE <span>Artwork is not authentic event photography.</span></div>
            <div className="archive-events">{archiveEvents.map((event) => <section className="archive-event" key={event.id} aria-labelledby={`archive-${event.id}`}><div className="archive-event__heading"><div><span className="archive-event__status">{event.status}</span><h3 id={`archive-${event.id}`}>{event.name}</h3></div><p>{event.description}</p></div><div className="archive-event__grid">{event.items.map((item) => { const index = archiveItems.findIndex((archiveItem) => archiveItem.id === item.id); return <button className={`archive-card${item.featured ? ' archive-card--featured' : ''}`} type="button" key={item.id} onClick={(event) => openGallery(index, event)} aria-label={`Open ${event.name} ${item.title} image`}><img src={item.image} alt={item.alt} loading="lazy" decoding="async" /><span className="gallery-card__overlay" /><span className="gallery-card__meta"><span>{item.label}</span><strong>{item.title}</strong></span><span className="gallery-card__open"><ArrowUpRight size={17} /></span></button> })}</div></section>)}</div>
          </div>
        </section>

        <section className="section section--faq" id="faq">
          <div className="shell-width faq-layout">
            <div>
              <div className="section-index">07 <span>/</span> FAQ</div>
              <SectionHeading
                eyebrow="Frequently asked"
                title="Clear answers. No assumptions."
                copy="A concise briefing for the questions visitors are most likely to have. Verified information is separated from details still awaiting the official announcement."
              />
            </div>
            <div className="faq-list">
              {faqItems.map((item, index) => {
                const isOpen = Boolean(openFaqs[item.id])
                return (
                  <article className={`faq-item${isOpen ? ' faq-item--open' : ''}`} key={item.id}>
                    <h3>
                      <button
                        id={`faq-trigger-${item.id}`}
                        type="button"
                        aria-expanded={isOpen}
                        aria-controls={`faq-answer-${item.id}`}
                        onClick={() => toggleFaq(item.id)}
                      >
                        <span className="faq-item__number">0{index + 1}</span>
                        <span>{item.question}</span>
                        <ChevronRight size={17} aria-hidden="true" />
                      </button>
                    </h3>
                    <div
                      className="faq-item__answer"
                      id={`faq-answer-${item.id}`}
                      role="region"
                      aria-labelledby={`faq-trigger-${item.id}`}
                      hidden={!isOpen}
                    >
                      <p>{item.answer}</p>
                      <span>
                        <span
                          className={`faq-item__dot faq-item__dot--${item.verified ? 'verified' : 'pending'}`}
                          aria-hidden="true"
                        />
                        {item.verified ? 'Verified project information' : 'Pending official information'}
                      </span>
                    </div>
                  </article>
                )
              })}
            </div>
          </div>
        </section>

        <section className="section section--partners" id="partners">
          <div className="shell-width partners-showcase">
            <div className="section-topline">
              <div className="section-index">08 <span>/</span> ALLIES</div>
              <StatusPill tone="live">Official Silver Sponsor Confirmed</StatusPill>
            </div>
            <div className="partners-showcase__heading">
              <SectionHeading
                eyebrow="Sponsors & partners"
                title="Fueling the next generation of problem solvers."
                copy="Empowering students and competitive programmers through premier industry collaboration. We proudly welcome KAYA Intelligence, Inc. as an Official Silver Sponsor for RUSLXTREME 3.0."
              />
              <div className="partners-showcase__mark partners-showcase__mark--silver">
                <Award size={30} />
                <span>SILVER<br />SPONSOR</span>
              </div>
            </div>

            {/* Featured Official Silver Sponsor Card */}
            <div className="sponsors-featured">
              {sponsorSlots.filter((s) => s.state === 'verified').map((sponsor) => (
                <article className="sponsor-feature-card sponsor-feature-card--silver" key={sponsor.id}>
                  <div className="sponsor-feature-card__shimmer" />
                  <div className="sponsor-feature-card__header-bar">
                    <div className="sponsor-tier-badge sponsor-tier-badge--silver">
                      <Sparkles size={13} />
                      <span>{sponsor.category}</span>
                    </div>
                    <span className="sponsor-feature-card__status">
                      <span className="pulse-dot" /> Confirmed Partner
                    </span>
                  </div>

                  <div className="sponsor-feature-card__grid">
                    <div className="sponsor-feature-card__logo-panel">
                      <div className="sponsor-feature-card__logo-box">
                        <img
                          src={sponsor.logo}
                          alt={sponsor.logoAlt || `${sponsor.name} logo`}
                          className="sponsor-feature-card__logo-img"
                          loading="lazy"
                          decoding="async"
                        />
                      </div>
                      {sponsor.website && (
                        <a
                          href={sponsor.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="button button--silver"
                          aria-label={`Visit official website of ${sponsor.name}`}
                        >
                          Visit Official Website <ArrowUpRight size={15} />
                        </a>
                      )}
                    </div>

                    <div className="sponsor-feature-card__info">
                      <div className="sponsor-feature-card__headline">
                        <h3>{sponsor.name}</h3>
                        {sponsor.tagline && (
                          <p className="sponsor-feature-card__tagline">“{sponsor.tagline}”</p>
                        )}
                      </div>

                      {sponsor.description && (
                        <p className="sponsor-feature-card__desc">{sponsor.description}</p>
                      )}

                      <div className="sponsor-feature-card__meta-list">
                        {sponsor.headquarters && (
                          <div className="sponsor-feature-card__meta-item">
                            <MapPin size={15} className="sponsor-meta-icon" />
                            <span><strong>Headquarters:</strong> {sponsor.headquarters}</span>
                          </div>
                        )}
                        <div className="sponsor-feature-card__meta-item">
                          <Building2 size={15} className="sponsor-meta-icon" />
                          <span><strong>Platform:</strong> Enterprise AI Execution Platform</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {/* Additional Sponsor & Partnership Tiers */}
            <div className="partners-pending-section">
              <div className="partners-pending-header">
                <div>
                  <span className="partners-pending-eyebrow">Partnership Opportunities</span>
                  <h4>Additional Sponsorship Tiers</h4>
                </div>
                <a className="button button--ghost" href="#contact" onClick={scrollTo}>
                  Partner with the mission <ArrowUpRight size={15} />
                </a>
              </div>

              <div className="sponsor-grid">
                {sponsorSlots.filter((s) => s.state === 'pending').map((slot) => (
                  <article className="sponsor-card sponsor-card--pending" key={slot.id}>
                    <div className="sponsor-card__top">
                      <span>{slot.tier}</span>
                      <StatusPill tone="placeholder">Pending</StatusPill>
                    </div>
                    <div className="sponsor-card__logo">
                      <Layers3 size={25} />
                      <span>SLOT<br />AVAILABLE</span>
                    </div>
                    <div>
                      <span className="sponsor-card__category">{slot.category}</span>
                      <h3>{slot.name}</h3>
                    </div>
                    <span className="sponsor-card__note">
                      Tier inquiries open. Connect via mission contact.
                    </span>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="section section--contact" id="contact">
          <div className="shell-width contact-card">
            <div className="contact-card__visual"><div className="contact-card__grid" /><div className="contact-card__planet" /><span className="contact-card__tag">Open channel / RUSLXTREME 3.0</span><div className="contact-card__code">STATUS: <strong>AWAITING UPLINK</strong><br />ORIGIN: <strong>RAJARATA / LK</strong><br />MODE: <strong>MISSION CONTROL</strong></div></div>
            <div className="contact-card__copy"><div className="section-index">09 <span>/</span> CONTACT</div><SectionHeading eyebrow="Open a channel" title="Have an official update? Send it through." copy="Contact channels were not included in the supplied brief. This space is intentionally ready for the verified organizer email, social links, venue details, and other official updates." /><div className="contact-actions"><span className="button button--primary button--disabled" role="status">Official email pending <Mail size={16} /></span><a className="text-link" href="#home" onClick={scrollTo}>Return to mission start <ArrowUpRight size={15} /></a></div></div>
          </div>
        </section>
      </main>

      <footer className="site-footer"><div className="shell-width site-footer__inner"><BrandMark compact /><p>RUSLXTREME 3.0 — Think. Code. Conquer.</p><div className="footer-links"><a href="#about" onClick={scrollTo}>Mission</a><a href="#rules" onClick={scrollTo}>Rules</a><a href="#gallery" onClick={scrollTo}>Archive</a><a href="#faq" onClick={scrollTo}>FAQ</a><a href="#partners" onClick={scrollTo}>Partners</a><a href="#contact" onClick={scrollTo}>Contact</a></div><div className="footer-socials"><a href="#contact" aria-label="Visual archive placeholder" onClick={scrollTo}><ImageIcon size={16} /></a><a href="#contact" aria-label="Community placeholder" onClick={scrollTo}><Users size={16} /></a><a href="#contact" aria-label="Code community placeholder" onClick={scrollTo}><Code2 size={16} /></a></div></div><div className="shell-width site-footer__bottom"><span>Organized by the IEEE Student Branch of Rajarata University of Sri Lanka.</span><span>Frontend mission brief / 2026</span></div></footer>

      {activeGallery !== null && <div className="lightbox" role="dialog" aria-modal="true" aria-label={`${archiveItems[activeGallery].title} gallery image`} onClick={closeGallery}><button ref={lightboxCloseRef} type="button" className="lightbox__close icon-button" aria-label="Close gallery image" onClick={closeGallery}><X size={20} /></button><figure onClick={(event) => event.stopPropagation()}><img src={archiveItems[activeGallery].image} alt={archiveItems[activeGallery].alt} /><figcaption><span>{archiveItems[activeGallery].label}</span><strong>{archiveItems[activeGallery].title}</strong></figcaption></figure></div>}
    </div>
  )
}

export default App
