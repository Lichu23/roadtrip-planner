import { Trip } from './constants'

export function encodeTripToURL(trip: Trip): string {
  if (typeof window === 'undefined') return ''
  const json = JSON.stringify(trip)
  const b64 = btoa(unescape(encodeURIComponent(json)))
  return `${window.location.origin}${window.location.pathname}#data=${b64}`
}

export function decodeTripFromURL(): Trip | null {
  if (typeof window === 'undefined') return null
  const hash = window.location.hash
  if (!hash.startsWith('#data=')) return null
  try {
    const b64 = hash.replace('#data=', '')
    return JSON.parse(decodeURIComponent(escape(atob(b64)))) as Trip
  } catch {
    return null
  }
}
