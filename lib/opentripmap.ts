import { TravelStyle } from './constants'

export interface OTMPlace {
  xid: string
  name: string
  lat: number
  lon: number
  kinds: string
  dist: number
}

const KINDS_MAP: Record<TravelStyle, string> = {
  culture: 'cultural,museums,historic',
  nature: 'natural,gardens_and_parks',
  food: 'foods',
  adventure: 'sport',
  beaches: 'beaches',
  architecture: 'architecture',
  hidden: 'interesting_places',
}

function distMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6_371_000
  const toRad = (x: number) => (x * Math.PI) / 180
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

const MIN_DIST_BETWEEN_POIS_M = 300

export function deduplicatePOIs(pois: OTMPlace[]): OTMPlace[] {
  const kept: OTMPlace[] = []
  for (const poi of pois) {
    const tooClose = kept.some(
      (k) => distMeters(k.lat, k.lon, poi.lat, poi.lon) < MIN_DIST_BETWEEN_POIS_M
    )
    if (!tooClose) kept.push(poi)
  }
  return kept
}

export function styleToKinds(styles: TravelStyle[]): string {
  const all = styles.flatMap((s) => KINDS_MAP[s].split(','))
  return [...new Set(all)].join(',')
}

export function radiusByDuration(duration: number): number {
  if (duration <= 1) return 15_000
  if (duration <= 5) return 50_000
  if (duration <= 7) return 100_000
  return 200_000
}

export async function fetchPOIs(
  lat: number,
  lon: number,
  radius: number,
  kinds: string,
  limit: number,
  rate: number
): Promise<OTMPlace[]> {
  try {
    const params = new URLSearchParams({
      lat: String(lat),
      lon: String(lon),
      radius: String(radius),
      kinds,
      limit: String(limit),
      rate: String(rate),
    })
    const res = await fetch(`/api/places?${params.toString()}`)
    if (!res.ok) return []
    const data = await res.json() as OTMPlace[]
    return Array.isArray(data) ? data : []
  } catch {
    return []
  }
}
