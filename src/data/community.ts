export interface FaqItem {
  id: string
  question: string
  answer: string
  verified: boolean
}

export interface SponsorSlot {
  id: string
  tier: string
  category: string
  name: string
  state: 'pending'
  website?: string
}

export const faqItems: FaqItem[] = [
  { id: 'general', question: 'What is RUSLXTREME 3.0?', answer: 'RUSLXTREME 3.0 is a competitive programming event organized by the IEEE Student Branch of Rajarata University of Sri Lanka.', verified: true },
  { id: 'registration', question: 'Can I still register?', answer: 'Registration is closed. Please refer to official announcements for any future participation updates.', verified: true },
  { id: 'format', question: 'What will the competition format be?', answer: 'The official competition format has not yet been confirmed. Please refer to the official announcement when available.', verified: false },
  { id: 'eligibility', question: 'Who is eligible to participate?', answer: 'Eligibility conditions have not yet been published. Details will be announced through official channels.', verified: false },
  { id: 'schedule', question: 'When and where will the event take place?', answer: 'The official event date, time, and venue have not yet been confirmed. Please refer to the official announcement when available.', verified: false },
  { id: 'rules', question: 'Where can I find the rules and guidelines?', answer: 'The official rulebook is pending. Verified rules and guidelines will be added here when supplied by the organizers.', verified: false },
]

// Neutral placeholders only — no sponsor names, logos, or URLs are invented.
export const sponsorSlots: SponsorSlot[] = [
  { id: 'founding', tier: 'Tier 01', category: 'Founding partner', name: 'Official partner to be announced', state: 'pending' },
  { id: 'technology', tier: 'Tier 02', category: 'Technology partner', name: 'Official partner to be announced', state: 'pending' },
  { id: 'community', tier: 'Tier 03', category: 'Community partner', name: 'Official partner to be announced', state: 'pending' },
]
