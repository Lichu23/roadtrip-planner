import { MapPin, History } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface TopBarProps {
  onHistoryOpen: () => void
}

export default function TopBar({ onHistoryOpen }: TopBarProps) {
  return (
    <header className="sticky top-0 z-10 bg-white border-b border-slate-100">
      <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-emerald-600" />
          <span className="font-semibold text-slate-900 tracking-tight">Roadtrip</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onHistoryOpen}
          aria-label="Search history"
          className="text-slate-500 hover:text-slate-900"
        >
          <History className="w-5 h-5" />
        </Button>
      </div>
    </header>
  )
}
