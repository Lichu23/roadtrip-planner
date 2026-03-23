import { Stop } from './constants'

const NOMINATIM_DELAY_MS = 1100

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function geocodeStopName(
  name: string,
  contextHint: string
): Promise<{ lat: number; lon: number } | null> {
  try {
    const query = encodeURIComponent(`${name} ${contextHint}`.trim())
    const url = `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1`
    const res = await fetch(url, {
      headers: { 'User-Agent': 'RoadtripPlanner/1.0' },
    })
    if (!res.ok) return null
    const data = await res.json()
    if (!data.length) return null
    return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) }
  } catch {
    return null
  }
}

const MAX_GEOCODE_DRIFT_KM = 50

export async function geocodeAllStops(stops: Stop[], contextHint: string): Promise<Stop[]> {
  const result: Stop[] = []
  const usedCoords = new Set<string>()

  for (let i = 0; i < stops.length; i++) {
    if (i > 0) await sleep(NOMINATIM_DELAY_MS)
    const stop = stops[i]
    const coords = await geocodeStopName(stop.name, contextHint)

    const isClose =
      coords !== null &&
      haversine(stop.lat, stop.lon, coords.lat, coords.lon) <= MAX_GEOCODE_DRIFT_KM

    const chosen = isClose ? coords : { lat: stop.lat, lon: stop.lon }
    const key = `${chosen.lat.toFixed(4)},${chosen.lon.toFixed(4)}`

    if (!usedCoords.has(key)) {
      usedCoords.add(key)
      result.push({ ...stop, lat: chosen.lat, lon: chosen.lon })
    } else {
      // Duplicate coords — keep original Groq coords as-is
      result.push(stop)
    }
  }
  return result
}

export function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371
  const toRad = (x: number) => (x * Math.PI) / 180
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export function sortByNearest(stops: Stop[], fromLat: number, fromLon: number): Stop[] {
  const remaining = [...stops]
  const sorted: Stop[] = []
  let lat = fromLat
  let lon = fromLon

  while (remaining.length) {
    let nearestIdx = 0
    let minDist = Infinity
    remaining.forEach((s, i) => {
      const d = haversine(lat, lon, s.lat, s.lon)
      if (d < minDist) {
        minDist = d
        nearestIdx = i
      }
    })
    sorted.push({ ...remaining[nearestIdx], distFromPrev: Math.round(minDist) })
    lat = remaining[nearestIdx].lat
    lon = remaining[nearestIdx].lon
    remaining.splice(nearestIdx, 1)
  }

  return sorted
}
