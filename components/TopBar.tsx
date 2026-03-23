import { MapPin, History } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Lang, T } from '@/lib/i18n'

interface TopBarProps {
  onHistoryOpen: () => void
  lang: Lang
  onLangChange: (lang: Lang) => void
  t: T
}

export default function TopBar({ onHistoryOpen, lang, onLangChange, t }: TopBarProps) {
  return (
    <header className="sticky top-0 z-10 bg-white border-b border-slate-100">
      <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-emerald-600" />
          <span className="font-semibold text-slate-900 tracking-tight">Roadtrip</span>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onLangChange(lang === 'en' ? 'es' : 'en')}
            className="text-xs font-semibold text-slate-400 hover:text-slate-700 px-2"
          >
            {lang.toUpperCase()}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onHistoryOpen}
            aria-label={t.historyAriaLabel}
            className="text-slate-500 hover:text-slate-900"
          >
            <History className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </header>
  )
}
