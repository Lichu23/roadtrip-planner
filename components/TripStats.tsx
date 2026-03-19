import { Trip } from '@/lib/constants'
import { Badge } from '@/components/ui/badge'
import { MapPin, Calendar, Route } from 'lucide-react'

interface TripStatsProps {
  trip: Trip
}

export default function TripStats({ trip }: TripStatsProps) {
  const { result, input } = trip
  const stopCount = result.stops.length

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <Badge variant="outline" className="gap-1 text-slate-600">
        <MapPin className="w-3 h-3" />
        {stopCount} {stopCount === 1 ? 'stop' : 'stops'}
      </Badge>
      <Badge variant="outline" className="gap-1 text-slate-600">
        <Calendar className="w-3 h-3" />
        {input.duration} {input.duration === 1 ? 'day' : 'days'}
      </Badge>
      <Badge variant="outline" className="gap-1 text-slate-600">
        <Route className="w-3 h-3" />
        ~{result.totalKm} km
      </Badge>
    </div>
  )
}
