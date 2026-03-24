import { Trip } from '@/lib/constants'
import { T } from '@/lib/i18n'
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
  t: T
}

export default function FilterBar({ trip, onEdit, onRegenerate, onNewTrip, t }: FilterBarProps) {
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
          <RefreshCw className="w-3.5 h-3.5 sm:mr-1.5" />
          <span className="hidden sm:inline">{t.reshuffle}</span>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onEdit}
          className="text-slate-600 hover:text-slate-900 font-medium"
        >
          <SlidersHorizontal className="w-3.5 h-3.5 sm:mr-1.5" />
          <span className="hidden sm:inline">{t.filters}</span>
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              size="sm"
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium"
            >
              <Home className="w-3.5 h-3.5 mr-1.5" />
              {t.newTrip}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t.newTripTitle}</AlertDialogTitle>
              <AlertDialogDescription>{t.newTripDesc}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t.cancel}</AlertDialogCancel>
              <AlertDialogAction
                onClick={onNewTrip}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                {t.startNewTrip}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  )
}
