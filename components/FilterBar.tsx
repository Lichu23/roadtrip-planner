import { Trip } from '@/lib/constants'
import { Button } from '@/components/ui/button'
import { Pencil, RefreshCw } from 'lucide-react'

interface FilterBarProps {
  trip: Trip
  onEdit: () => void
  onRegenerate: () => void
}

export default function FilterBar({ trip, onEdit, onRegenerate }: FilterBarProps) {
  const { input, flow } = trip
  const label = flow === 'gps' ? input.locationName || 'Your location' : input.destination
  const durationLabel = input.duration === 1 ? '1 day' : `${input.duration} days`
  const stylesLabel = input.styles
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1).replace('-', ' & '))
    .slice(0, 2)
    .join(', ')
  const transportLabel = input.transport.charAt(0).toUpperCase() + input.transport.slice(1)

  return (
    <div className="flex items-center gap-2 flex-wrap pb-4 border-b border-slate-100">
      {/* Location pill — highlighted */}
      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
        {label}
      </span>

      {/* Other pills — outline */}
      {[durationLabel, stylesLabel, transportLabel].map((pill) => (
        <span
          key={pill}
          className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium text-slate-600 border border-slate-200 bg-white"
        >
          {pill}
        </span>
      ))}

      {/* Actions */}
      <div className="ml-auto flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={onRegenerate}
          className="text-slate-600 hover:text-slate-900 font-medium"
        >
          <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
          Regenerate
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onEdit}
          className="text-slate-600 hover:text-slate-900 font-medium"
        >
          <Pencil className="w-3.5 h-3.5 mr-1.5" />
          Edit
        </Button>
      </div>
    </div>
  )
}
