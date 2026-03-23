import { Stop } from '@/lib/constants'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible'
import { ChevronDown, Navigation } from 'lucide-react'
import { T } from '@/lib/i18n'
import { cn } from '@/lib/utils'
import { useState } from 'react'

interface StopCardDestProps {
  stop: Stop
  isFirst: boolean
  isLast: boolean
  t: T
}

export default function StopCardDest({ stop, isFirst, isLast, t }: StopCardDestProps) {
  const [open, setOpen] = useState(false)

  function openMaps() {
    window.open(
      `https://www.google.com/maps/dir/?api=1&destination=${stop.lat},${stop.lon}&travelmode=driving`,
      '_blank'
    )
  }

  return (
    <div>
      <Card>
        <CardContent className="p-4 space-y-3">
          {/* Header */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <span className="flex-shrink-0 w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold">
                {stop.id}
              </span>
              <div className="min-w-0">
                <p className="font-semibold text-sm text-slate-900 leading-tight">{stop.name}</p>
                {isFirst && (
                  <span className="text-xs text-emerald-600 font-medium">{t.routeStart}</span>
                )}
                {isLast && (
                  <span className="text-xs text-slate-400">{t.routeEnd}</span>
                )}
              </div>
            </div>
            {stop.dayLabel && (
              <Badge className="bg-emerald-600 text-white text-xs shrink-0">
                {stop.dayLabel}
              </Badge>
            )}
          </div>

          {/* Type + time */}
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">{t.typeLabels[stop.type] ?? stop.type}</Badge>
            <span className="text-xs text-slate-400">{t.suggestedTime}: {stop.suggestedDaysLabel}</span>
          </div>

          {/* Description */}
          <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">{stop.description}</p>

          {/* Highlights */}
          <div className="flex flex-wrap gap-1">
            {stop.highlights.map((h) => (
              <Badge key={h} variant="outline" className="text-xs text-slate-500">
                {h}
              </Badge>
            ))}
          </div>

          {/* Collapsible practical info */}
          <Collapsible open={open} onOpenChange={setOpen}>
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="w-full h-7 text-slate-400 hover:text-slate-600"
              >
                <ChevronDown className={cn('w-4 h-4 transition-transform', open && 'rotate-180')} />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <Separator className="mb-3" />
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">{t.entranceFee}</span>
                  <span className="text-slate-700 font-medium">{t.entranceFeeLabels[stop.practicalInfo.entranceFee] ?? stop.practicalInfo.entranceFee}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">{t.bestTime}</span>
                  <span className="text-slate-700 font-medium">{t.bestTimeLabels[stop.practicalInfo.bestTime] ?? stop.practicalInfo.bestTime}</span>
                </div>
                <p className="text-slate-400 italic mt-2 leading-relaxed">{stop.practicalInfo.tip}</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full mt-2 h-8"
                  onClick={openMaps}
                >
                  <Navigation className="w-3 h-3 mr-1.5" />
                  {t.navigateHere}
                </Button>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </CardContent>
      </Card>

      {/* Chain connector */}
      {!isLast && stop.distFromPrev > 0 && (
        <div className="flex items-center gap-2 py-1 pl-5 ml-3">
          <div className="w-px h-5 bg-slate-200" />
          <span className="text-xs text-slate-400">↓ {stop.distFromPrev} km</span>
        </div>
      )}
    </div>
  )
}
