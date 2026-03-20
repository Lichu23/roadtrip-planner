import { Trip } from '@/lib/constants'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { SlidersHorizontal, RefreshCw, Home } from 'lucide-react'

interface FilterBarProps {
  trip: Trip
  onEdit: () => void
  onRegenerate: () => void
  onNewTrip: () => void
}

export default function FilterBar({ trip, onEdit, onRegenerate, onNewTrip }: FilterBarProps) {
  const { input, flow } = trip
  const label = flow === 'gps' ? input.locationName || 'Your location' : input.destination

  return (
    <div className="flex items-center justify-between pb-4 border-b border-slate-100">
      {/* Location label — left side */}
      <span className="text-sm font-medium text-slate-500 truncate mr-4">{label}</span>

      {/* Actions — right side */}
      <div className="flex items-center gap-1 shrink-0">
        <Button
          variant="ghost"
          size="sm"
          onClick={onRegenerate}
          className="text-slate-600 hover:text-slate-900 font-medium"
        >
          <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
          Reshuffle
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onEdit}
          className="text-slate-600 hover:text-slate-900 font-medium"
        >
          <SlidersHorizontal className="w-3.5 h-3.5 mr-1.5" />
          Filters
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              size="sm"
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium"
            >
              <Home className="w-3.5 h-3.5 mr-1.5" />
              New trip
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Start a new trip?</AlertDialogTitle>
              <AlertDialogDescription>
                Your current trip will be cleared from the screen. Don&apos;t worry — it&apos;s
                saved in your history and you can reload it anytime.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={onNewTrip}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                Start new trip
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  )
}
