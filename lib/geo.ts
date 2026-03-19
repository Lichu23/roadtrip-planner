import { Stop } from './constants'

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
