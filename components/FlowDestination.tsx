import { TripInput, TRAVEL_STYLES, TRANSPORT_MODES, DURATION_OPTIONS, TravelStyle, Transport } from '@/lib/constants'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { Map } from 'lucide-react'

interface FlowDestinationProps {
  formData: TripInput
  onFormChange: (data: TripInput) => void
  onGenerate: () => void
}

export default function FlowDestination({ formData, onFormChange, onGenerate }: FlowDestinationProps) {
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
        <Label className="text-sm font-medium text-slate-700">Destination</Label>
        <Input
          placeholder="e.g. Tuscany, Italy or Kyoto, Japan"
          value={formData.destination}
          onChange={(e) => onFormChange({ ...formData, destination: e.target.value })}
        />
      </div>

      {/* Duration */}
      <div className="space-y-2">
        <Label className="text-sm font-medium text-slate-700">Duration</Label>
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
              {days} days
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

      {/* Notes */}
      <div className="space-y-2">
        <Label className="text-sm font-medium text-slate-700">
          Notes <span className="text-slate-400 font-normal">(optional)</span>
        </Label>
        <Textarea
          placeholder="e.g. travelling with kids, vegetarian food only, no hiking..."
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
        Generate road trip
      </Button>
    </div>
  )
}
