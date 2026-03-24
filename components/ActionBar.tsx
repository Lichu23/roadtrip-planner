import { Trip } from '@/lib/constants'
import { T } from '@/lib/i18n'
import { buildGoogleMapsURL, buildDayGroupURLs, buildOSRMUrl } from '@/lib/maps'
import { encodeTripToURL } from '@/lib/sharing'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Map, Copy, ExternalLink } from 'lucide-react'
import { toast } from 'sonner'

interface ActionBarProps {
  trip: Trip
  t: T
}

export default function ActionBar({ trip, t }: ActionBarProps) {
  const shareUrl = encodeTripToURL(trip)

  function handleCopy() {
    navigator.clipboard.writeText(shareUrl).then(() => {
      toast('Link copied!')
    })
  }

  const { stops } = trip.result
  const { lat, lon } = trip.input
  const isGPS = trip.flow === 'gps'

  const mapsUrl = isGPS
    ? buildGoogleMapsURL(stops, lat, lon, 'driving')
    : buildGoogleMapsURL(stops, null, null, 'driving')

  const osmUrl = buildOSRMUrl(stops, isGPS ? lat : null, isGPS ? lon : null)

  const dayGroupUrls = !isGPS && stops.length > 5
    ? buildDayGroupURLs(stops, 'driving')
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
        {t.openGoogleMaps}
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
          {t.dayRoute(label)}
        </Button>
      ))}

      {/* OSM fallback */}
      <Button
        variant="outline"
        className="w-full h-9"
        onClick={() => window.open(osmUrl, '_blank')}
      >
        <ExternalLink className="w-3.5 h-3.5 mr-2" />
        {t.openOSM}
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
          {t.copy}
        </Button>
      </div>
    </div>
  )
}
