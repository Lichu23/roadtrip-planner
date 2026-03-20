import { Trip } from '@/lib/constants'
import { groupStopsByDay } from '@/lib/format'
import FilterBar from './FilterBar'
import TripStats from './TripStats'
import StopCardGPS from './StopCardGPS'
import StopCardDest from './StopCardDest'
import ActionBar from './ActionBar'
import { Progress } from '@/components/ui/progress'

interface ResultsScreenProps {
  trip: Trip
  onEdit: () => void
  onRegenerate: () => void
  onNewTrip: () => void
  onVisitedChange: (id: number, visited: boolean) => void
}

export default function ResultsScreen({
  trip,
  onEdit,
  onRegenerate,
  onNewTrip,
  onVisitedChange,
}: ResultsScreenProps) {
  const { result, flow } = trip
  const stops = result.stops
  const isGPS = flow === 'gps'

  const visitedCount = isGPS ? stops.filter((s) => s.visited).length : 0
  const allVisited = isGPS && visitedCount === stops.length

  const remaining = stops.length - visitedCount

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="max-w-2xl mx-auto px-4 py-4">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
          {/* Filter bar */}
          <FilterBar trip={trip} onEdit={onEdit} onRegenerate={onRegenerate} onNewTrip={onNewTrip} />

          {/* Trip title */}
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{result.title}</h1>
          </div>

          {/* Stats */}
          <TripStats trip={trip} />

          {/* GPS progress */}
          {isGPS && (
            <div className="space-y-2">
              {allVisited ? (
                <p className="text-sm text-emerald-600 font-semibold">All stops visited ✓</p>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-500">
                      {visitedCount} of {stops.length} visited
                    </span>
                    <span className="text-sm font-medium text-emerald-600">
                      {remaining} {remaining === 1 ? 'stop' : 'stops'} remaining
                    </span>
                  </div>
                  <Progress
                    value={(visitedCount / stops.length) * 100}
                    className="h-2.5 bg-slate-100 [&>div]:bg-emerald-500 [&>div]:rounded-full rounded-full"
                  />
                </>
              )}
            </div>
          )}

          {/* Entry point note for destination flow */}
          {!isGPS && result.entryPointReason && (
            <p className="text-xs text-slate-400 italic">{result.entryPointReason}</p>
          )}

          {/* Stop cards */}
          {isGPS ? (
            <div className="space-y-2">
              {stops.map((stop, index) => (
                <StopCardGPS
                  key={stop.id}
                  stop={stop}
                  isFirst={index === 0}
                  onVisitedChange={onVisitedChange}
                />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {groupStopsByDay(stops).map((group) => (
                <div key={group[0].day}>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Day {group[0].day}
                  </p>
                  <div className="space-y-2">
                    {group.map((stop) => (
                      <StopCardDest
                        key={stop.id}
                        stop={stop}
                        isFirst={stop.id === 1}
                        isLast={stop.id === stops.length}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Action bar */}
          <ActionBar trip={trip} />
        </div>
      </div>
    </div>
  )
}
