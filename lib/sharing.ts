import LZString from 'lz-string'
import { Trip } from './constants'

export function encodeTripToURL(trip: Trip): string {
  if (typeof window === 'undefined') return ''
  // Omit `results` (both-lang data) to keep the URL short — shared trips use `result` only
  const { results: _omit, ...tripToShare } = trip
  const json = JSON.stringify(tripToShare)
  const compressed = LZString.compressToEncodedURIComponent(json)
  return `${window.location.origin}${window.location.pathname}#data=${compressed}`
}

export function decodeTripFromURL(): Trip | null {
  if (typeof window === 'undefined') return null
  const hash = window.location.hash
  if (!hash.startsWith('#data=')) return null
  try {
    const compressed = hash.replace('#data=', '')
    // Support both lz-string compressed and legacy base64 URLs
    const json = LZString.decompressFromEncodedURIComponent(compressed)
      ?? decodeURIComponent(escape(atob(compressed)))
    return JSON.parse(json) as Trip
  } catch {
    return null
  }
}
