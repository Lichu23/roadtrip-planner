// ─── Types ───────────────────────────────────────────────────────────────────

export type AppState = 'intake' | 'loading' | 'results'
export type Flow = 'gps' | 'destination'
export type TravelStyle = 'culture' | 'nature' | 'food' | 'adventure' | 'beaches' | 'architecture' | 'hidden'
export type BestTime = 'Morning' | 'Afternoon' | 'Full day'

export interface PracticalInfo {
  entranceFee: string
  bestTime: BestTime
  tip: string
}

export interface Stop {
  id: number
  name: string
  type: string
  description: string
  lat: number
  lon: number
  distFromPrev: number
  suggestedDays: number
  suggestedDaysLabel: string
  highlights: string[]
  bestFor: TravelStyle
  practicalInfo: PracticalInfo
  // Flow 1 only
  visited?: boolean
  // Flow 2 only
  day?: number
  dayLabel?: string
}

export interface TripResult {
  title: string
  totalKm: number
  entryPointReason?: string
  stops: Stop[]
}

export interface TripInput {
  locationName: string
  lat: number | null
  lon: number | null
  destination: string
  duration: number
  stopsCount: number
  styles: TravelStyle[]
  notes: string
}

export interface Trip {
  id: string
  createdAt: string
  flow: Flow
  input: TripInput
  result: TripResult
  results?: { en: TripResult; es: TripResult }
}

export interface HistoryEntry {
  id: string
  createdAt: string
  flow: Flow
  title: string
  locationLabel: string
  stopsCount: number
  duration: number
  trip: Trip
}

export interface DayGroupURL {
  label: string
  url: string
}

// ─── Constants ───────────────────────────────────────────────────────────────

export const TRAVEL_STYLES: { value: TravelStyle; label: string }[] = [
  { value: 'culture', label: 'Culture & history' },
  { value: 'nature', label: 'Nature' },
  { value: 'food', label: 'Food & gastronomy' },
  { value: 'adventure', label: 'Adventure' },
  { value: 'beaches', label: 'Beaches' },
  { value: 'architecture', label: 'Architecture' },
  { value: 'hidden', label: 'Hidden gems' },
]

export const DURATION_OPTIONS: Record<Flow, number[]> = {
  gps: [1, 2, 3, 5, 7],
  destination: [3, 5, 7, 10, 14],
}

export const STOPS_COUNT_OPTIONS = [3, 5, 7, 10]

export const LOADING_MESSAGES = [
  'Finding top destinations...',
  'Finding real places...',
  'Generating descriptions...',
  'Sorting by distance...',
  'Building your route...',
  'Almost ready...',
]

export const LS_KEYS = {
  CURRENT_TRIP: 'roadtrip_current',
  HISTORY: 'roadtrip_history',
  FORM: 'roadtrip_form',
}

export const MAX_HISTORY = 10
export const MAX_WAYPOINTS = 10

export const DEFAULT_FORM_DATA: TripInput = {
  locationName: '',
  lat: null,
  lon: null,
  destination: '',
  duration: 5,
  stopsCount: 5,
  styles: ['culture', 'nature'],
  notes: '',
}
