import { Trip, TripInput, HistoryEntry, MAX_HISTORY, LS_KEYS } from './constants'

export function saveCurrentTrip(trip: Trip): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(LS_KEYS.CURRENT_TRIP, JSON.stringify(trip))
}

export function loadCurrentTrip(): Trip | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(LS_KEYS.CURRENT_TRIP)
    return raw ? (JSON.parse(raw) as Trip) : null
  } catch {
    return null
  }
}

export function saveFormData(form: TripInput): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(LS_KEYS.FORM, JSON.stringify(form))
}

export function loadFormData(): TripInput | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(LS_KEYS.FORM)
    return raw ? (JSON.parse(raw) as TripInput) : null
  } catch {
    return null
  }
}

export function addToHistory(trip: Trip): void {
  if (typeof window === 'undefined') return
  const history = loadHistory()
  const entry: HistoryEntry = {
    id: trip.id,
    createdAt: trip.createdAt,
    flow: trip.flow,
    title: trip.result.title,
    locationLabel: trip.flow === 'gps' ? trip.input.locationName : trip.input.destination,
    stopsCount: trip.result.stops.length,
    duration: trip.input.duration,
    trip,
  }
  const updated = [entry, ...history.filter((h) => h.id !== trip.id)].slice(0, MAX_HISTORY)
  localStorage.setItem(LS_KEYS.HISTORY, JSON.stringify(updated))
}

export function loadHistory(): HistoryEntry[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(LS_KEYS.HISTORY)
    return raw ? (JSON.parse(raw) as HistoryEntry[]) : []
  } catch {
    return []
  }
}

export function clearHistory(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(LS_KEYS.HISTORY)
}
