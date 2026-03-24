import { useRef, useState } from 'react'
import {
  TripInput,
  TRAVEL_STYLES,
  DURATION_OPTIONS,
  STOPS_COUNT_OPTIONS,
  TravelStyle,
} from '@/lib/constants'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { Navigation, MapPin, AlertCircle, Loader2 } from 'lucide-react'
import { T } from '@/lib/i18n'

type GpsStatus = 'idle' | 'requesting' | 'success' | 'error'

interface NominatimReverseResult {
  address: {
    city?: string
    town?: string
    municipality?: string
    county?: string
    state?: string
  }
}

interface NominatimSearchResult {
  lat: string
  lon: string
  display_name: string
}

interface FlowGPSProps {
  formData: TripInput
  onFormChange: (data: TripInput) => void
  onGenerate: () => void
  t: T
}

export default function FlowGPS({ formData, onFormChange, onGenerate, t }: FlowGPSProps) {
  const [gpsStatus, setGpsStatus] = useState<GpsStatus>('idle')
  const [geocoding, setGeocoding] = useState(false)
  const addressRef = useRef<HTMLInputElement>(null)

  // ─── GPS ───────────────────────────────────────────────────────────────────

  async function reverseGeocode(lat: number, lon: number): Promise<string> {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`,
        { headers: { 'Accept-Language': 'en' } }
      )
      const data: NominatimReverseResult = await res.json()
      const a = data.address
      return a.city ?? a.town ?? a.municipality ?? a.county ?? a.state ?? 'Your location'
    } catch {
      return 'Your location'
    }
  }

  function handleGPS() {
    if (!navigator.geolocation) {
      setGpsStatus('error')
      addressRef.current?.focus()
      return
    }
    setGpsStatus('requesting')
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lon } = pos.coords
        const name = await reverseGeocode(lat, lon)
        setGpsStatus('success')
        onFormChange({ ...formData, lat, lon, locationName: name })
      },
      () => {
        setGpsStatus('error')
        setTimeout(() => addressRef.current?.focus(), 100)
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    )
  }

  // ─── Address geocode ───────────────────────────────────────────────────────

  async function geocodeAddress(address: string) {
    if (!address.trim()) return
    setGeocoding(true)
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1`,
        { headers: { 'Accept-Language': 'en' } }
      )
      const results: NominatimSearchResult[] = await res.json()
      if (results.length > 0) {
        onFormChange({
          ...formData,
          lat: parseFloat(results[0].lat),
          lon: parseFloat(results[0].lon),
          locationName: address,
        })
      }
    } catch {
      // Silent fallback — keep address as-is, generate will use text only
    } finally {
      setGeocoding(false)
    }
  }

  function handleAddressKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') geocodeAddress(formData.locationName)
  }

  function handleAddressBlur() {
    if (formData.locationName.trim() && formData.lat === null) {
      geocodeAddress(formData.locationName)
    }
  }

  // ─── Style / transport toggles ─────────────────────────────────────────────

  function toggleStyle(value: TravelStyle) {
    const updated = formData.styles.includes(value)
      ? formData.styles.filter((s) => s !== value)
      : [...formData.styles, value]
    if (updated.length === 0) return
    onFormChange({ ...formData, styles: updated })
  }

  const canGenerate = formData.locationName.trim().length > 0 || formData.lat !== null

  // ─── GPS button appearance ─────────────────────────────────────────────────

  const gpsButtonContent = {
    idle: (
      <>
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse mr-2 shrink-0" />
        {t.useMyGPS}
      </>
    ),
    requesting: (
      <>
        <Loader2 className="w-4 h-4 mr-2 animate-spin text-orange-500" />
        {t.detecting}
      </>
    ),
    success: (
      <>
        <MapPin className="w-4 h-4 mr-2 text-emerald-600" />
        {formData.locationName}
      </>
    ),
    error: (
      <>
        <AlertCircle className="w-4 h-4 mr-2 text-red-500" />
        {t.locationUnavailable}
      </>
    ),
  }

  return (
    <div className="space-y-5">
      {/* Location */}
      <div className="space-y-2">
        <Label className="text-sm font-medium text-slate-700">{t.yourLocation}</Label>
        <Button
          variant="outline"
          className={cn(
            'w-full justify-start',
            gpsStatus === 'success' && 'border-emerald-400 text-emerald-700 bg-emerald-50',
            gpsStatus === 'error' && 'border-red-300 text-red-600',
            gpsStatus === 'idle' && 'border-emerald-200 text-emerald-700 hover:bg-emerald-50',
            gpsStatus === 'requesting' && 'border-orange-200 text-orange-600'
          )}
          onClick={handleGPS}
          disabled={gpsStatus === 'requesting'}
        >
          {gpsButtonContent[gpsStatus]}
        </Button>

        {gpsStatus === 'success' && formData.lat !== null && (
          <p className="text-xs text-slate-400">
            {formData.lat.toFixed(4)}, {formData.lon?.toFixed(4)}
          </p>
        )}

        <div className="relative">
          <Input
            ref={addressRef}
            placeholder={t.orEnterAddress}
            value={gpsStatus === 'success' ? '' : formData.locationName}
            onChange={(e) => {
              setGpsStatus('idle')
              onFormChange({ ...formData, locationName: e.target.value, lat: null, lon: null })
            }}
            onKeyDown={handleAddressKeyDown}
            onBlur={handleAddressBlur}
            disabled={gpsStatus === 'requesting'}
          />
          {geocoding && (
            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-slate-400" />
          )}
        </div>
      </div>

      {/* Stops count */}
      <div className="space-y-2">
        <Label className="text-sm font-medium text-slate-700">{t.numberOfStops}</Label>
        <div className="flex flex-wrap gap-2">
          {STOPS_COUNT_OPTIONS.map((count) => (
            <Button
              key={count}
              variant={formData.stopsCount === count ? 'default' : 'outline'}
              size="sm"
              onClick={() => onFormChange({ ...formData, stopsCount: count })}
              className={cn(
                'rounded-full',
                formData.stopsCount === count &&
                  'bg-emerald-600 hover:bg-emerald-700 border-emerald-600 text-white'
              )}
            >
              {t.stopsLabel(count)}
            </Button>
          ))}
        </div>
      </div>

      {/* Duration */}
      <div className="space-y-2">
        <Label className="text-sm font-medium text-slate-700">{t.duration}</Label>
        <div className="flex flex-wrap gap-2">
          {DURATION_OPTIONS.gps.map((days) => (
            <Button
              key={days}
              variant={formData.duration === days ? 'default' : 'outline'}
              size="sm"
              onClick={() => onFormChange({ ...formData, duration: days })}
              className={cn(
                'rounded-full',
                formData.duration === days &&
                  'bg-emerald-600 hover:bg-emerald-700 border-emerald-600 text-white'
              )}
            >
              {t.dayLabel(days)}
            </Button>
          ))}
        </div>
      </div>

      {/* Travel styles */}
      <div className="space-y-2">
        <Label className="text-sm font-medium text-slate-700">{t.travelStyle}</Label>
        <div className="flex flex-wrap gap-2">
          {TRAVEL_STYLES.map(({ value }) => (
            <Button
              key={value}
              variant={formData.styles.includes(value) ? 'default' : 'outline'}
              size="sm"
              onClick={() => toggleStyle(value)}
              className={cn(
                'rounded-full',
                formData.styles.includes(value) &&
                  'bg-emerald-600 hover:bg-emerald-700 border-emerald-600 text-white'
              )}
            >
              {t.travelStyles[value]}
            </Button>
          ))}
        </div>
      </div>

      {/* Generate */}
      <Button
        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white h-11"
        onClick={onGenerate}
        disabled={!canGenerate}
      >
        <Navigation className="w-4 h-4 mr-2" />
        {t.generateRoadtrip}
      </Button>
    </div>
  )
}
