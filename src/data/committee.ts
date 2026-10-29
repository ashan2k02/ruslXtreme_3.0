export interface CommitteeProfile {
  id: string
  name: string
  title: string
  team: string
  bio: string
  portrait: string
  featured?: boolean
}

export interface CommitteeTeam {
  id: string
  name: string
  description: string
  members: CommitteeProfile[]
}

// DEMO DATA — replace names, portraits, positions, and bios with verified organizer information before launch.
const demoPortraits = [
  '/assets/committee/portrait-01.svg',
  '/assets/committee/portrait-02.svg',
  '/assets/committee/portrait-03.svg',
  '/assets/committee/portrait-04.svg',
  '/assets/committee/portrait-05.svg',
  '/assets/committee/portrait-06.svg',
]

export const committeeLeadership: CommitteeProfile[] = [
  { id: 'chair-demo', name: 'Aarav Perera', title: 'Project Chair', team: 'Leadership', bio: 'Demo profile for the person guiding the mission from first signal to final debrief.', portrait: demoPortraits[0], featured: true },
  { id: 'secretary-demo', name: 'Mihiri Jayasinghe', title: 'Secretary', team: 'Leadership', bio: 'Demo profile for the coordination layer connecting every team and milestone.', portrait: demoPortraits[1], featured: true },
]

const member = (id: string, name: string, title: string, team: string, portraitIndex: number): CommitteeProfile => ({
  id, name, title, team, portrait: demoPortraits[portraitIndex % demoPortraits.length], bio: 'Demo profile — replace with a verified member bio before launch.',
})

export const committeeTeams: CommitteeTeam[] = [
  { id: 'design', name: 'Design Team', description: 'Shapes the visual language, interface surfaces, and moments that make the mission memorable.', members: [member('design-lead', 'Kavindu Silva', 'Demo Team Lead', 'Design Team', 2), member('design-member', 'Nethmi Fernando', 'Demo Member', 'Design Team', 3)] },
  { id: 'content', name: 'Content Writing Team', description: 'Turns the event brief into clear stories, announcements, and mission-ready communication.', members: [member('content-lead', 'Sahan Wickramasinghe', 'Demo Team Lead', 'Content Writing Team', 4), member('content-member', 'Yasara Hettiarachchi', 'Demo Member', 'Content Writing Team', 5)] },
  { id: 'marketing', name: 'Marketing Team', description: 'Builds reach and momentum around the competition across the right channels.', members: [member('marketing-lead', 'Dulanjali Peris', 'Demo Team Lead', 'Marketing Team', 1), member('marketing-member', 'Ravindu Abeysekara', 'Demo Member', 'Marketing Team', 2)] },
  { id: 'finance', name: 'Finance Team', description: 'Keeps the mission resourced with careful planning and transparent coordination.', members: [member('finance-lead', 'Tharushi de Alwis', 'Demo Team Lead', 'Finance Team', 3), member('finance-member', 'Imesh Bandara', 'Demo Member', 'Finance Team', 4)] },
  { id: 'moderators', name: 'Moderators', description: 'Protects a fair, focused, and welcoming experience for every competitor.', members: [member('moderators-lead', 'Chenuka Rathnayake', 'Demo Team Lead', 'Moderators', 5), member('moderators-member', 'Amandi Senanayake', 'Demo Member', 'Moderators', 0)] },
  { id: 'program', name: 'Program Team', description: 'Coordinates the competitive programming experience and its technical rhythm.', members: [member('program-lead', 'Dinesh Rajapaksha', 'Demo Team Lead', 'Program Team', 2), member('program-member', 'Piumi Karunaratne', 'Demo Member', 'Program Team', 5)] },
  { id: 'logistic', name: 'Logistic Team', description: 'Moves people, places, and practical details into alignment for launch day.', members: [member('logistic-lead', 'Isuru Maduranga', 'Demo Team Lead', 'Logistic Team', 4), member('logistic-member', 'Sewmini Ekanayake', 'Demo Member', 'Logistic Team', 1)] },
]
