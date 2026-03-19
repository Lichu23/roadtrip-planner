import { Stop } from '@/lib/constants'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible'
import { ChevronDown, Navigation } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useState } from 'react'

interface StopCardGPSProps {
  stop: Stop
  isFirst: boolean
  onVisitedChange: (id: number, visited: boolean) => void
}

export default function StopCardGPS({ stop, isFirst, onVisitedChange }: StopCardGPSProps) {
  const [open, setOpen] = useState(false)

  function openMaps() {
    window.open(
      `https://www.google.com/maps/dir/?api=1&destination=${stop.lat},${stop.lon}&travelmode=driving`,
      '_blank'
    )
  }

  return (
    <Card
      className={cn(
        'transition-opacity duration-200',
        stop.visited && 'opacity-60'
      )}
    >
      <CardContent className="p-4 space-y-3">
        {/* Header row */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <span
              className={cn(
                'flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold',
                stop.visited
                  ? 'border-2 border-slate-300 text-slate-300'
                  : 'bg-emerald-600 text-white'
              )}
            >
              {stop.id}
            </span>
            <div className="min-w-0">
              <p
                className={cn(
                  'font-semibold text-sm text-slate-900 leading-tight',
                  stop.visited && 'line-through text-slate-400'
                )}
              >
                {stop.name}
              </p>
              {isFirst && (
                <span className="text-xs text-emerald-600 font-medium">Start here</span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Checkbox
              id={`visited-${stop.id}`}
              checked={stop.visited ?? false}
              onCheckedChange={(checked) => onVisitedChange(stop.id, checked as boolean)}
              className="data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
            />
            <Label
              htmlFor={`visited-${stop.id}`}
              className="text-xs text-slate-500 cursor-pointer"
            >
              Visited
            </Label>
          </div>
        </div>

        {/* Type + time */}
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs">{stop.type}</Badge>
          <span className="text-xs text-slate-400">{stop.suggestedDaysLabel}</span>
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
                <span className="text-slate-500">Entrance fee</span>
                <span className="text-slate-700 font-medium">{stop.practicalInfo.entranceFee}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Best time</span>
                <span className="text-slate-700 font-medium">{stop.practicalInfo.bestTime}</span>
              </div>
              <p className="text-slate-400 italic mt-2 leading-relaxed">{stop.practicalInfo.tip}</p>
              <Button
                variant="outline"
                size="sm"
                className="w-full mt-2 h-8"
                onClick={openMaps}
              >
                <Navigation className="w-3 h-3 mr-1.5" />
                Navigate here
              </Button>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  )
}
