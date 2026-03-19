import { Trip } from '@/lib/constants'
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
  onVisitedChange: (id: number, visited: boolean) => void
}

export default function ResultsScreen({
  trip,
  onEdit,
  onRegenerate,
  onVisitedChange,
}: ResultsScreenProps) {
  const { result, flow } = trip
  const stops = result.stops
  const isGPS = flow === 'gps'

  const visitedCount = isGPS ? stops.filter((s) => s.visited).length : 0
  const allVisited = isGPS && visitedCount === stops.length

  return (
    <div>
      <FilterBar trip={trip} onEdit={onEdit} onRegenerate={onRegenerate} />

      <main className="max-w-2xl mx-auto px-4 py-4 space-y-4">
        {/* Trip title */}
        <h1 className="text-lg font-bold text-slate-900">{result.title}</h1>

        {/* Stats */}
        <TripStats trip={trip} />

        {/* GPS progress bar */}
        {isGPS && (
          <div className="space-y-1">
            {allVisited ? (
              <p className="text-sm text-emerald-600 font-medium">All stops visited ✓</p>
            ) : (
              <>
                <p className="text-xs text-slate-500">
                  {visitedCount} of {stops.length} visited
                </p>
                <Progress
                  value={(visitedCount / stops.length) * 100}
                  className="h-1.5 [&>div]:bg-emerald-500"
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
        <div className="space-y-2">
          {stops.map((stop, index) =>
            isGPS ? (
              <StopCardGPS
                key={stop.id}
                stop={stop}
                isFirst={index === 0}
                onVisitedChange={onVisitedChange}
              />
            ) : (
              <StopCardDest
                key={stop.id}
                stop={stop}
                isFirst={index === 0}
                isLast={index === stops.length - 1}
              />
            )
          )}
        </div>

        {/* Action bar */}
        <ActionBar trip={trip} />
      </main>
    </div>
  )
}
