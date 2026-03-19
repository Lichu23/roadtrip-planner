import { MapPin } from 'lucide-react'
import { HistoryEntry } from '@/lib/constants'
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerClose,
  DrawerFooter,
} from '@/components/ui/drawer'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

interface HistoryDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  history: HistoryEntry[]
  onLoad: (entry: HistoryEntry) => void
  onClear: () => void
}

export default function HistoryDrawer({
  open,
  onOpenChange,
  history,
  onLoad,
  onClear,
}: HistoryDrawerProps) {
  return (
    <Drawer open={open} onOpenChange={onOpenChange} direction="right">
      <DrawerContent className="flex flex-col h-full max-w-sm">
        <DrawerHeader className="flex items-center justify-between border-b border-slate-100 pb-3">
          <DrawerTitle>Search history</DrawerTitle>
          <DrawerClose asChild>
            <Button variant="ghost" size="icon-sm" className="text-slate-400 hover:text-slate-700">
              ✕
            </Button>
          </DrawerClose>
        </DrawerHeader>

        {history.length === 0 ? (
          <div className="flex-1 flex items-center justify-center px-4">
            <div className="text-center">
              <MapPin className="w-10 h-10 text-slate-200 mx-auto mb-3" />
              <p className="text-sm font-medium text-slate-500">No trips yet</p>
              <p className="text-xs text-slate-400 mt-1">
                Your generated trips will appear here
              </p>
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto">
            {history.map((entry) => (
              <div key={entry.id}>
                <div className="flex items-center justify-between px-4 py-3">
                  <div className="flex-1 min-w-0 mr-3">
                    <p className="font-medium text-sm text-slate-900 truncate">
                      {entry.locationLabel}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {entry.stopsCount} stops · {entry.duration} days
                    </p>
                    <Badge variant="outline" className="text-xs mt-1">
                      {entry.flow === 'gps' ? 'GPS trip' : 'Destination trip'}
                    </Badge>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => onLoad(entry)}>
                    Load
                  </Button>
                </div>
                <Separator />
              </div>
            ))}
          </div>
        )}

        {history.length > 0 && (
          <DrawerFooter className="border-t border-slate-100">
            <Button
              variant="ghost"
              size="sm"
              className="text-slate-400 hover:text-red-500"
              onClick={onClear}
            >
              Clear all
            </Button>
          </DrawerFooter>
        )}
      </DrawerContent>
    </Drawer>
  )
}
