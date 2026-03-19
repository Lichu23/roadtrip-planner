import { Trip } from '@/lib/constants'
import { Badge } from '@/components/ui/badge'
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
  const stylesLabel = input.styles.slice(0, 2).join(', ')

  return (
    <div className="sticky top-14 z-10 bg-white border-b border-slate-100">
      <div className="max-w-2xl mx-auto px-4 py-2 flex items-center gap-2 flex-wrap">
        <Badge variant="secondary" className="text-xs">{label}</Badge>
        <Badge variant="secondary" className="text-xs">{input.duration} days</Badge>
        <Badge variant="secondary" className="text-xs">{stylesLabel}</Badge>
        <Badge variant="secondary" className="text-xs capitalize">{input.transport}</Badge>
        <div className="ml-auto flex gap-2">
          <Button variant="outline" size="sm" onClick={onEdit}>
            <Pencil className="w-3 h-3 mr-1" />
            Edit
          </Button>
          <Button variant="outline" size="sm" onClick={onRegenerate}>
            <RefreshCw className="w-3 h-3 mr-1" />
            Regenerate
          </Button>
        </div>
      </div>
    </div>
  )
}
