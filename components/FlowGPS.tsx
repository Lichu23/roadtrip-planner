import { TripInput, TRAVEL_STYLES, TRANSPORT_MODES, DURATION_OPTIONS, TravelStyle, Transport } from '@/lib/constants'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { Navigation } from 'lucide-react'

interface FlowGPSProps {
  formData: TripInput
  onFormChange: (data: TripInput) => void
  onGenerate: () => void
}

export default function FlowGPS({ formData, onFormChange, onGenerate }: FlowGPSProps) {
  function toggleStyle(value: TravelStyle) {
    const current = formData.styles
    const updated = current.includes(value)
      ? current.filter((s) => s !== value)
      : [...current, value]
    if (updated.length === 0) return
    onFormChange({ ...formData, styles: updated })
  }

  const canGenerate = formData.locationName.trim().length > 0 || (formData.lat !== null)

  return (
    <div className="space-y-5">
      {/* Location */}
      <div className="space-y-2">
        <Label className="text-sm font-medium text-slate-700">Your location</Label>
        <Button
          variant="outline"
          className="w-full justify-start border-emerald-200 text-emerald-700 hover:bg-emerald-50"
          onClick={() => {
            // Phase 2: real GPS
            onFormChange({ ...formData, locationName: 'Your location (GPS)' })
          }}
        >
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse mr-2 shrink-0" />
          Use my GPS
        </Button>
        <Input
          placeholder="Or enter a street address"
          value={formData.locationName}
          onChange={(e) => onFormChange({ ...formData, locationName: e.target.value })}
        />
      </div>

      {/* Duration */}
      <div className="space-y-2">
        <Label className="text-sm font-medium text-slate-700">Duration</Label>
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
              {days === 1 ? '1 day' : `${days} days`}
            </Button>
          ))}
        </div>
      </div>

      {/* Travel styles */}
      <div className="space-y-2">
        <Label className="text-sm font-medium text-slate-700">Travel style</Label>
        <div className="flex flex-wrap gap-2">
          {TRAVEL_STYLES.map(({ value, label }) => (
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
              {label}
            </Button>
          ))}
        </div>
      </div>

      {/* Transport */}
      <div className="space-y-2">
        <Label className="text-sm font-medium text-slate-700">Transport</Label>
        <div className="flex flex-wrap gap-2">
          {TRANSPORT_MODES.map(({ value, label }) => (
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
              {label}
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
        Generate road trip
      </Button>
    </div>
  )
}
