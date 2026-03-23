import { Stop, DayGroupURL } from './constants'
import { groupStopsByDay } from './format'

export function buildGoogleMapsURL(
  stops: Stop[],
  originLat: number | null,
  originLon: number | null,
  travelMode = 'driving'
): string {
  if (stops.length === 0) return ''
  const origin = originLat != null ? `${originLat},${originLon}` : `${stops[0].lat},${stops[0].lon}`
  const dest = `${stops[stops.length - 1].lat},${stops[stops.length - 1].lon}`
  const middle = stops.slice(originLat != null ? 0 : 1, -1)
  const waypoints = middle.map((s) => `${s.lat},${s.lon}`).join('|')
  let url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${dest}&travelmode=${travelMode}`
  if (waypoints) url += `&waypoints=${waypoints}`
  return url
}

export function buildDayGroupURLs(stops: Stop[], travelMode = 'driving'): DayGroupURL[] {
  const groups = groupStopsByDay(stops)
  return groups.map((group) => {
    const days = [...new Set(group.map((s) => s.day ?? 1))]
    const label = days.length > 1 ? `Day ${days[0]}–${days[days.length - 1]}` : `Day ${days[0]}`
    return { label, url: buildGoogleMapsURL(group, null, null, travelMode) }
  })
}

export function buildSingleStopURL(lat: number, lon: number): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}&travelmode=driving`
}

export function buildOSRMUrl(stops: Stop[], originLat: number | null, originLon: number | null): string {
  if (stops.length === 0) return 'https://www.openstreetmap.org'
  const waypoints: { lat: number; lon: number }[] = []
  if (originLat != null && originLon != null) waypoints.push({ lat: originLat, lon: originLon })
  waypoints.push(...stops.map((s) => ({ lat: s.lat, lon: s.lon })))
  const locParams = waypoints.map((w) => `loc=${w.lat}%2C${w.lon}`).join('&')
  const center = waypoints[Math.floor(waypoints.length / 2)]
  return `https://map.project-osrm.org/?z=8&center=${center.lat}%2C${center.lon}&${locParams}&hl=en&alt=0&srv=0`
}
