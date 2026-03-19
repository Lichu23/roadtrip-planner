import { Stop } from './constants'

export function formatDays(days: number): string {
  if (days === 0.5) return 'Half a day'
  if (days === 1) return '1 day'
  if (days === 1.5) return '1–2 days'
  return `${days} days`
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
