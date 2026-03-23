import { useState } from 'react'
import { TripInput, TRAVEL_STYLES, TRANSPORT_MODES, DURATION_OPTIONS, TravelStyle, Transport } from '@/lib/constants'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { Map, Loader2 } from 'lucide-react'
import { T } from '@/lib/i18n'

interface NominatimSearchResult {
  lat: string
  lon: string
}

interface FlowDestinationProps {
  formData: TripInput
  onFormChange: (data: TripInput) => void
  onGenerate: () => void
  t: T
}

export default function FlowDestination({ formData, onFormChange, onGenerate, t }: FlowDestinationProps) {
  const [geocoding, setGeocoding] = useState(false)

  async function geocodeDestination(destination: string) {
    if (!destination.trim()) return
    setGeocoding(true)
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(destination)}&format=json&limit=1`,
        { headers: { 'Accept-Language': 'en' } }
      )
      const results: NominatimSearchResult[] = await res.json()
      if (results.length > 0) {
        onFormChange({
          ...formData,
          destination,
          lat: parseFloat(results[0].lat),
          lon: parseFloat(results[0].lon),
        })
      }
    } catch {
      // Silent fallback — Groq will still generate from destination name
    } finally {
      setGeocoding(false)
    }
  }

  function toggleStyle(value: TravelStyle) {
    const current = formData.styles
    const updated = current.includes(value)
      ? current.filter((s) => s !== value)
      : [...current, value]
    if (updated.length === 0) return
    onFormChange({ ...formData, styles: updated })
  }

  const canGenerate = formData.destination.trim().length > 0

  return (
    <div className="space-y-5">
      {/* Destination */}
      <div className="space-y-2">
        <Label className="text-sm font-medium text-slate-700">{t.flowDestTitle}</Label>
        <div className="relative">
          <Input
            placeholder={t.destinationPlaceholder}
            value={formData.destination}
            onChange={(e) => onFormChange({ ...formData, destination: e.target.value, lat: null, lon: null })}
            onBlur={(e) => geocodeDestination(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') geocodeDestination(formData.destination) }}
          />
          {geocoding && (
            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-slate-400" />
          )}
        </div>
      </div>

      {/* Duration */}
      <div className="space-y-2">
        <Label className="text-sm font-medium text-slate-700">{t.duration}</Label>
        <div className="flex flex-wrap gap-2">
          {DURATION_OPTIONS.destination.map((days) => (
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

      {/* Transport */}
      <div className="space-y-2">
        <Label className="text-sm font-medium text-slate-700">{t.transport}</Label>
        <div className="flex flex-wrap gap-2">
          {TRANSPORT_MODES.map(({ value }) => (
            <Button
              key={value}
              variant={formData.transport === value ? 'default' : 'outline'}
              size="sm"
              onClick={() => onFormChange({ ...formData, transport: value as Transport })}
              className={cn(
                'rounded-full',
                formData.transport === value &&
                  'bg-emerald-600 hover:bg-emerald-700 border-emerald-600 text-white'
              )}
            >
              {t.transportModes[value]}
            </Button>
          ))}
        </div>
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <Label className="text-sm font-medium text-slate-700">{t.notesOptional}</Label>
        <Textarea
          placeholder={t.notesPlaceholder}
          value={formData.notes}
          onChange={(e) => onFormChange({ ...formData, notes: e.target.value })}
          rows={3}
        />
      </div>

      {/* Generate */}
      <Button
        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white h-11"
        onClick={onGenerate}
        disabled={!canGenerate}
      >
        <Map className="w-4 h-4 mr-2" />
        {t.generateRoadtrip}
      </Button>
    </div>
  )
}
