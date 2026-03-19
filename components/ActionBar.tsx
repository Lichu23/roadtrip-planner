import { Trip, TRANSPORT_MODES } from '@/lib/constants'
import { buildGoogleMapsURL, buildDayGroupURLs } from '@/lib/maps'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Map, Copy, ExternalLink } from 'lucide-react'
import { useState } from 'react'

interface ActionBarProps {
  trip: Trip
}

export default function ActionBar({ trip }: ActionBarProps) {
  const [copied, setCopied] = useState(false)
  const shareUrl = typeof window !== 'undefined' ? window.location.href : ''

  function handleCopy() {
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const { stops } = trip.result
  const { lat, lon, transport } = trip.input
  const isGPS = trip.flow === 'gps'

  const gmapsMode = TRANSPORT_MODES.find((m) => m.value === transport)?.gmaps ?? 'driving'

  const mapsUrl = isGPS
    ? buildGoogleMapsURL(stops, lat, lon, gmapsMode)
    : buildGoogleMapsURL(stops, null, null, gmapsMode)

  const osmUrl = stops.length > 0
    ? `https://www.openstreetmap.org/#map=10/${stops[0].lat}/${stops[0].lon}`
    : 'https://www.openstreetmap.org'

  const dayGroupUrls = !isGPS && stops.length > 5
    ? buildDayGroupURLs(stops, gmapsMode)
    : []

  return (
    <div className="space-y-3 pt-2">
      {/* Primary: open full route in Google Maps */}
      <Button
        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white h-11"
        onClick={() => window.open(mapsUrl, '_blank')}
        disabled={!mapsUrl}
      >
        <Map className="w-4 h-4 mr-2" />
        Open full route in Google Maps
      </Button>

      {/* Per-day route buttons (destination flow, >5 stops) */}
      {dayGroupUrls.map(({ label, url }) => (
        <Button
          key={label}
          variant="outline"
          className="w-full h-9"
          onClick={() => window.open(url, '_blank')}
        >
          <Map className="w-3.5 h-3.5 mr-2" />
          {label} route
        </Button>
      ))}

      {/* OSM fallback */}
      <Button
        variant="outline"
        className="w-full h-9"
        onClick={() => window.open(osmUrl, '_blank')}
      >
        <ExternalLink className="w-3.5 h-3.5 mr-2" />
        Open in OpenStreetMap
      </Button>

      {/* Share row */}
      <div className="flex gap-2">
        <Input
          readOnly
          value={shareUrl}
          className="text-xs text-slate-500 bg-slate-50"
        />
        <Button variant="outline" size="sm" onClick={handleCopy} className="shrink-0">
          <Copy className="w-3.5 h-3.5 mr-1.5" />
          {copied ? 'Copied!' : 'Copy'}
        </Button>
      </div>
    </div>
  )
}
