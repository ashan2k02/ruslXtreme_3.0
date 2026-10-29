export type CompetitionFieldState = 'verified' | 'pending'

export interface JourneyStage {
  index: string
  label: string
  title: string
  detail: string
  state: CompetitionFieldState
}

export interface CompetitionInfoField {
  label: string
  value: string
  note: string
  state: CompetitionFieldState
}

// Only registration closure is verified in the supplied project brief. All other fields stay pending.
export const journeyStages: JourneyStage[] = [
  { index: '01', label: 'Mission briefing', title: 'Event announcement', detail: 'Official announcement details are to be confirmed by the organizers.', state: 'pending' },
  { index: '02', label: 'Preparation', title: 'Team registration', detail: 'Registration is closed. The official registration window remains to be confirmed.', state: 'verified' },
  { index: '03', label: 'Competition day', title: 'The challenge', detail: 'Date, time, venue, and format are to be announced.', state: 'pending' },
  { index: '04', label: 'Debrief', title: 'Results & recognition', detail: 'Official results and recognition details are to be confirmed.', state: 'pending' },
]

export const competitionInfo: CompetitionInfoField[] = [
  { label: 'Current status', value: 'Registration closed', note: 'Verified from the supplied project brief.', state: 'verified' },
  { label: 'Event date & time', value: 'Details to be announced', note: 'No official date or time was supplied.', state: 'pending' },
  { label: 'Venue / participation', value: 'Details to be announced', note: 'No venue or online participation details were supplied.', state: 'pending' },
  { label: 'Competition format', value: 'Details to be announced', note: 'The official format is not yet available.', state: 'pending' },
  { label: 'Eligibility & duration', value: 'Details to be announced', note: 'Official eligibility and duration details are pending.', state: 'pending' },
  { label: 'Rules & communication', value: 'Official channels pending', note: 'Replace with verified rules and organizer channels before launch.', state: 'pending' },
]
