import { Stop } from '@/lib/constants'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible'
import { ChevronDown, Navigation, MapPin, Clock } from 'lucide-react'
import { T } from '@/lib/i18n'
import { cn } from '@/lib/utils'
import { useState } from 'react'

interface StopCardGPSProps {
  stop: Stop
  isFirst: boolean
  onVisitedChange: (id: number, visited: boolean) => void
  t: T
}

export default function StopCardGPS({ stop, isFirst, onVisitedChange, t }: StopCardGPSProps) {
  const [open, setOpen] = useState(false)

  function openMaps() {
    window.open(
      `https://www.google.com/maps/dir/?api=1&destination=${stop.lat},${stop.lon}&travelmode=driving`,
      '_blank'
    )
  }

  return (
    <div className={cn(
      'bg-white rounded-xl border border-slate-200 overflow-hidden transition-opacity duration-200',
      stop.visited && 'opacity-70'
    )}>
      {/* Collapsed content */}
      <div className="p-4">
        {/* Top row: number + name + visited + chevron */}
        <div className="flex items-start gap-3">
          {/* Number circle */}
          <span className={cn(
            'flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold mt-0.5',
            stop.visited
              ? 'border-2 border-slate-200 text-slate-300'
              : 'bg-emerald-700 text-white'
          )}>
            {stop.id}
          </span>

          {/* Name + type */}
          <div className="flex-1 min-w-0">
            <p className={cn(
              'font-bold text-base text-slate-900 leading-snug',
              stop.visited && 'line-through text-slate-400'
            )}>
              {stop.name}
            </p>
            <p className="text-sm text-emerald-600 font-medium mt-0.5">{t.typeLabels[stop.type] ?? stop.type}</p>
          </div>

          {/* Visited + chevron */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="flex items-center gap-1.5">
              <Checkbox
                id={`visited-${stop.id}`}
                checked={stop.visited ?? false}
                onCheckedChange={(checked) => onVisitedChange(stop.id, checked as boolean)}
                className="data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
              />
              <Label
                htmlFor={`visited-${stop.id}`}
                className="text-xs text-slate-500 cursor-pointer select-none hidden sm:inline"
              >
                {t.visited}
              </Label>
            </div>

            <Collapsible open={open} onOpenChange={setOpen}>
              <CollapsibleTrigger asChild>
                <button className="p-1 text-slate-400 hover:text-slate-600 transition-colors">
                  <ChevronDown className={cn('w-4 h-4 transition-transform duration-200', open && 'rotate-180')} />
                </button>
              </CollapsibleTrigger>
            </Collapsible>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-slate-600 leading-relaxed mt-3 ml-12">
          {stop.description}
        </p>

        {/* Footer: start label + time */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-3 ml-12">
          {isFirst && (
            <span className="flex items-center gap-1 text-xs text-emerald-600 font-medium whitespace-nowrap">
              <MapPin className="w-3.5 h-3.5" />
              {t.startingPoint}
            </span>
          )}
          <span className="flex items-center gap-1 text-xs text-slate-400 whitespace-nowrap">
            <Clock className="w-3.5 h-3.5" />
            {t.suggestedTime}: {stop.suggestedDaysLabel}
          </span>
        </div>
      </div>

      {/* Expanded practical info */}
      <Collapsible open={open} onOpenChange={setOpen}>
        <CollapsibleContent>
          <div className="border-t border-slate-100 px-4 py-4 bg-slate-50/60">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
              {t.practicalInfo}
            </p>
            <div className="flex items-center gap-6 text-sm mb-3">
              <span className="text-slate-600">
                {t.entrance}: <span className="font-semibold text-slate-800">{t.entranceFeeLabels[stop.practicalInfo.entranceFee] ?? stop.practicalInfo.entranceFee}</span>
              </span>
              <span className="text-slate-600">
                {t.bestTime}: <span className="font-semibold text-slate-800">{t.bestTimeLabels[stop.practicalInfo.bestTime] ?? stop.practicalInfo.bestTime}</span>
              </span>
            </div>
            <p className="text-sm text-slate-500 italic leading-relaxed mb-4">
              {stop.practicalInfo.tip}
            </p>
            <Button
              variant="outline"
              size="sm"
              className="h-9 px-4 text-slate-700 border-slate-200 hover:bg-white"
              onClick={openMaps}
            >
              <Navigation className="w-3.5 h-3.5 mr-2" />
              {t.navigateHere}
            </Button>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  )
}
