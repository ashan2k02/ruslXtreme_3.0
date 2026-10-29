export interface ArchiveItem {
  id: string
  title: string
  label: string
  image: string
  alt: string
  featured?: boolean
}

export interface ArchiveEvent {
  id: string
  name: string
  status: string
  description: string
  items: ArchiveItem[]
}

// Illustrative demo archive only — replace visuals and descriptions with verified event photography and history.
const item = (id: string, title: string, label: string, image: string, featured = false): ArchiveItem => ({
  id, title, label, image, featured,
  alt: `${title}; illustrative demo artwork, not an authentic event photograph`,
})

export const archiveEvents: ArchiveEvent[] = [
  {
    id: 'ruslxtreme-1', name: 'RUSLXTREME 1.0', status: 'Edition archive / demo', description: 'A placeholder visual chapter for the first edition. Verified event history and photography are not yet available.',
    items: [
      item('r1-feature', 'First signal', 'Illustrative demo artwork', '/assets/archive/archive-10.svg', true),
      item('r1-orbit', 'Orbital logic', 'Illustrative demo artwork', '/assets/archive-orbit.svg'),
      item('r1-command', 'Command center', 'Illustrative demo artwork', '/assets/archive-command.svg'),
    ],
  },
  {
    id: 'ruslxtreme-2', name: 'RUSLXTREME 2.0', status: 'Edition archive / demo', description: 'A placeholder visual chapter for the second edition. No dates, venues, results, or participant details are being presented as fact.',
    items: [
      item('r2-feature', 'Second orbit', 'Illustrative demo artwork', '/assets/archive/archive-20.svg', true),
      item('r2-launch', 'Launch sequence', 'Illustrative demo artwork', '/assets/archive-launch.svg'),
      item('r2-nebula', 'The signal', 'Illustrative demo artwork', '/assets/archive-nebula.svg'),
    ],
  },
  {
    id: 'ruslxtreme-3', name: 'RUSLXTREME 3.0', status: 'Current event / demo archive', description: 'The current event chapter is ready for verified memories, official highlights, and authentic photography when supplied by the organizers.',
    items: [
      item('r3-feature', 'Beyond limits', 'Illustrative demo artwork', '/assets/archive/archive-30.svg', true),
      item('r3-orbit', 'Mission control', 'Illustrative demo artwork', '/assets/archive-orbit.svg'),
      item('r3-command', 'Ready room', 'Illustrative demo artwork', '/assets/archive-command.svg'),
    ],
  },
]

export const archiveItems = archiveEvents.flatMap((event) => event.items)
