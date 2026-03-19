import { Stop } from './constants'

export function formatDays(days: number): string {
  if (days <= 0.25) return '~1–2 hrs'
  if (days <= 0.5) return '~3–4 hrs'
  if (days <= 0.75) return '~5–6 hrs'
  if (days <= 1) return 'Full day'
  if (days <= 1.5) return '1–2 days'
  if (days <= 2) return '2 days'
  return `${Math.round(days)} days`
}

export function formatDist(km: number): string {
  return `~${km} km`
}

export function groupStopsByDay(stops: Stop[]): Stop[][] {
  const groups: Record<number, Stop[]> = {}
  for (const stop of stops) {
    const day = stop.day ?? 1
    if (!groups[day]) groups[day] = []
    groups[day].push(stop)
  }
  return Object.values(groups)
}
