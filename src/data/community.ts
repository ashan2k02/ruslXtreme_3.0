export interface FaqItem {
  id: string
  question: string
  answer: string
  verified: boolean
}

export type SponsorState = 'verified' | 'pending'

export interface SponsorSlot {
  id: string
  tier: string
  category: string
  name: string
  state: SponsorState
  logo?: string
  logoAlt?: string
  website?: string
  description?: string
  tagline?: string
  headquarters?: string
}

export const faqItems: FaqItem[] = [
  {
    id: 'general',
    question: 'What is RUSLXTREME 3.0?',
    answer: 'RUSLXTREME 3.0 is a competitive programming event organized by the IEEE Student Branch of Rajarata University of Sri Lanka.',
    verified: true,
  },
  {
    id: 'registration',
    question: 'Can I still register for RUSLXTREME 3.0?',
    answer: 'Registration is closed. Please refer to official announcements for any future participation updates.',
    verified: true,
  },
  {
    id: 'format',
    question: 'What will the competition format be?',
    answer: 'The official competition format has not yet been confirmed. Please refer to upcoming official announcements for verified details.',
    verified: false,
  },
  {
    id: 'eligibility',
    question: 'Who is eligible to participate?',
    answer: 'Eligibility conditions have not yet been published. Details will be announced through official channels.',
    verified: false,
  },
  {
    id: 'schedule',
    question: 'When and where will the event take place?',
    answer: 'The official event date, time, and venue have not yet been confirmed. Please refer to the official announcement when available.',
    verified: false,
  },
  {
    id: 'rules',
    question: 'Where can I find the rules and guidelines?',
    answer: 'The official rulebook is pending. Verified rules and guidelines will be added here when supplied by the organizers.',
    verified: false,
  },
  {
    id: 'announcements',
    question: 'Where are official announcements published?',
    answer: 'All official announcements, schedules, and verified mission briefs will be released exclusively through the official channels of the IEEE Student Branch of Rajarata University of Sri Lanka.',
    verified: true,
  },
]

// Official verified sponsors and neutral tier placeholders.
export const sponsorSlots: SponsorSlot[] = [
  {
    id: 'kaya-intelligence',
    tier: 'Silver Tier',
    category: 'OFFICIAL SILVER SPONSOR',
    name: 'KAYA Intelligence, Inc.',
    state: 'verified',
    logo: '/assets/sponsors/kaya-intelligence-logo.png',
    logoAlt: 'KAYA Intelligence, Inc. Official Logo',
    website: 'https://kayaintelligence.com/',
    tagline: 'The Platform Where AI Gets to Work.',
    description:
      'KAYA Intelligence, Inc. is an Enterprise AI Execution Platform designed to help business-critical processes operate at enterprise scale. Built for the world’s largest regulated enterprises, Kaya enables organizations to operationalize AI and reinvent how work gets done.',
    headquarters: 'Jersey City, New Jersey, USA',
  },
  {
    id: 'founding',
    tier: 'Tier 01',
    category: 'Founding Partner',
    name: 'Official partner to be announced',
    state: 'pending',
  },
  {
    id: 'technology',
    tier: 'Tier 02',
    category: 'Technology Partner',
    name: 'Official partner to be announced',
    state: 'pending',
  },
  {
    id: 'community',
    tier: 'Tier 03',
    category: 'Community Partner',
    name: 'Official partner to be announced',
    state: 'pending',
  },
]
