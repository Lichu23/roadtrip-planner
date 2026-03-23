import { Trip } from '@/lib/constants'
import { Badge } from '@/components/ui/badge'
import { MapPin, Calendar, Route } from 'lucide-react'
import { T } from '@/lib/i18n'

interface TripStatsProps {
  trip: Trip
  t: T
}

export default function TripStats({ trip, t }: TripStatsProps) {
  const { result, input } = trip
  const stopCount = result.stops.length

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <Badge variant="outline" className="gap-1 text-slate-600">
        <MapPin className="w-3 h-3" />
        {t.stopsLabel(stopCount)}
      </Badge>
      <Badge variant="outline" className="gap-1 text-slate-600">
        <Calendar className="w-3 h-3" />
        {t.dayLabel(input.duration)}
      </Badge>
      <Badge variant="outline" className="gap-1 text-slate-600">
        <Route className="w-3 h-3" />
        ~{result.totalKm} km
      </Badge>
    </div>
  )
}
