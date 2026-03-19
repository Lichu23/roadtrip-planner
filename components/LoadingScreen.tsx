import { Skeleton } from '@/components/ui/skeleton'

interface LoadingScreenProps {
  label: string
  duration: number
  message: string
}

export default function LoadingScreen({ label, duration, message }: LoadingScreenProps) {
  return (
    <main className="max-w-2xl mx-auto px-4 py-10 space-y-6">
      <div className="text-center space-y-1">
        <h2 className="text-xl font-semibold text-slate-900">{label}</h2>
        <p className="text-sm text-slate-500">
          {duration === 1 ? '1-day' : `${duration}-day`} road trip
        </p>
      </div>

      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="rounded-xl border border-slate-100 bg-white p-4 space-y-3">
            <div className="flex items-center gap-3">
              <Skeleton className="w-7 h-7 rounded-full" />
              <Skeleton className="h-4 w-40" />
            </div>
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-3/4" />
            <div className="flex gap-2">
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="h-5 w-20 rounded-full" />
              <Skeleton className="h-5 w-14 rounded-full" />
            </div>
          </div>
        ))}
      </div>

      <p className="text-center text-sm text-slate-400 animate-pulse">{message}</p>
    </main>
  )
}
