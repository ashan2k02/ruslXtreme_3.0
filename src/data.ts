export type DataState = 'verified' | 'placeholder'

export interface NavItem {
  label: string
  href: string
  section: string
}

export interface MissionStage {
  index: string
  label: string
  title: string
  detail: string
  state: DataState
}

export interface RuleGroup {
  number: string
  title: string
  detail: string
  items: string[]
  state: DataState
}

export interface CommitteeMember {
  initials: string
  role: string
  name: string
  state: DataState
}

export interface GalleryItem {
  title: string
  label: string
  image: string
  alt: string
}

export const navItems: NavItem[] = [
  { label: 'Mission', href: '#about', section: '01' },
  { label: 'Timeline', href: '#timeline', section: '02' },
  { label: 'Rules', href: '#rules', section: '03' },
  { label: 'Results', href: '#leaderboard', section: '04' },
  { label: 'Archive', href: '#gallery', section: '05' },
]

export const missionStages: MissionStage[] = [
  { index: '01', label: 'Briefing', title: 'Event announcement', detail: 'Official announcement date — awaiting confirmation.', state: 'placeholder' },
  { index: '02', label: 'Uplink', title: 'Team registration', detail: 'Registration is closed. Official registration window — awaiting confirmation.', state: 'verified' },
  { index: '03', label: 'Launch', title: 'Competition day', detail: 'Official date, time, and venue — awaiting confirmation.', state: 'placeholder' },
  { index: '04', label: 'Debrief', title: 'Results & recognition', detail: 'Official results release details — awaiting confirmation.', state: 'placeholder' },
]

export const ruleGroups: RuleGroup[] = [
  {
    number: '01',
    title: 'Eligibility',
    detail: 'The official participant criteria have not been published in the supplied brief.',
    items: ['Participant eligibility — official rule pending.', 'Team size and composition — official rule pending.'],
    state: 'placeholder',
  },
  {
    number: '02',
    title: 'Format',
    detail: 'The competition structure is intentionally left open until official information is supplied.',
    items: ['Platform and contest format — official rule pending.', 'Duration and problem count — official rule pending.'],
    state: 'placeholder',
  },
  {
    number: '03',
    title: 'Conduct',
    detail: 'The final code of conduct should be added here by the organizing team.',
    items: ['Permitted resources — official rule pending.', 'Integrity and conduct policy — official rule pending.'],
    state: 'placeholder',
  },
]

export const committeeMembers: CommitteeMember[] = [
  { initials: '—', role: 'Lead coordinator', name: 'Profile pending verification', state: 'placeholder' },
  { initials: '—', role: 'Technical direction', name: 'Profile pending verification', state: 'placeholder' },
  { initials: '—', role: 'Operations & experience', name: 'Profile pending verification', state: 'placeholder' },
  { initials: '—', role: 'Communications', name: 'Profile pending verification', state: 'placeholder' },
]

export const galleryItems: GalleryItem[] = [
  { title: 'The signal', label: 'Visual placeholder / nebula', image: '/assets/archive-nebula.svg', alt: 'Abstract blue and purple nebula with a glowing planet' },
  { title: 'Orbital logic', label: 'Visual placeholder / orbit', image: '/assets/archive-orbit.svg', alt: 'Abstract glowing planet with intersecting orbital rings' },
  { title: 'Command center', label: 'Visual placeholder / interface', image: '/assets/archive-command.svg', alt: 'Abstract futuristic command interface with radar circle' },
  { title: 'Launch sequence', label: 'Visual placeholder / ascent', image: '/assets/archive-launch.svg', alt: 'Abstract luminous launch vehicle moving through a star field' },
]

export const partnerSlots = [
  { label: 'Founding partner', name: 'Partner slot open', state: 'placeholder' as DataState },
  { label: 'Technology partner', name: 'Partner slot open', state: 'placeholder' as DataState },
  { label: 'Community partner', name: 'Partner slot open', state: 'placeholder' as DataState },
]
