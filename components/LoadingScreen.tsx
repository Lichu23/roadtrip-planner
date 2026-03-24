import { useState, useEffect } from 'react'
import { Car, Flag, MapPin, Compass, Camera } from 'lucide-react'
import { T } from '@/lib/i18n'
import { cn } from '@/lib/utils'

interface LoadingScreenProps {
  label: string
  duration: number
  message: string
  t: T
}

const ICONS = [Car, MapPin, Flag, Compass, Camera]

export default function LoadingScreen({ label, duration, message, t }: LoadingScreenProps) {
  const [activeIdx, setActiveIdx] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIdx((i) => (i + 1) % ICONS.length)
    }, 1200)
    return () => clearInterval(interval)
  }, [])

  return (
    <main className="max-w-2xl mx-auto px-4 py-20 flex flex-col items-center gap-12">
      {/* Title */}
      <div className="text-center space-y-1">
        <h2 className="text-xl font-semibold text-slate-900">{label}</h2>
        <p className="text-sm text-slate-500">{t.dayRoadtrip(duration)}</p>
      </div>

      {/* Icon path */}
      <div className="flex items-center gap-2">
        {ICONS.map((Icon, i) => (
          <div key={i} className="flex items-center gap-2">
            {/* Icon — fixed outer size keeps the row height stable */}
            <div className="w-14 h-14 flex items-center justify-center">
              <div className={cn(
                'transition-all duration-700 flex items-center justify-center rounded-full',
                i === activeIdx
                  ? 'w-14 h-14 bg-emerald-600 text-white shadow-lg shadow-emerald-200'
                  : i < activeIdx
                    ? 'w-10 h-10 bg-emerald-100 text-emerald-500'
                    : 'w-10 h-10 bg-slate-100 text-slate-300'
              )}>
                <Icon className={cn('transition-all duration-700', i === activeIdx ? 'w-7 h-7' : 'w-5 h-5')} />
              </div>
            </div>

            {/* Connector dots */}
            {i < ICONS.length - 1 && (
              <div className="flex gap-1 items-center">
                {[0, 1, 2].map((d) => (
                  <div
                    key={d}
                    className={cn(
                      'w-1.5 h-1.5 rounded-full transition-colors duration-700',
                      i < activeIdx ? 'bg-emerald-300' : 'bg-slate-200'
                    )}
                  />
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Cycling message */}
      <p className="text-sm text-slate-400 animate-pulse">{message}</p>
    </main>
  )
}
