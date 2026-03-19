import { Trip } from '@/lib/constants'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Map, Copy, ExternalLink } from 'lucide-react'
import { useState } from 'react'

interface ActionBarProps {
  trip: Trip
}

export default function ActionBar({ trip }: ActionBarProps) {
  const [copied, setCopied] = useState(false)
  const shareUrl = typeof window !== 'undefined' ? window.location.href : ''

  function handleCopy() {
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  // Phase 1: placeholder URLs — real URLs built in Phase 2/3
  const isDestination = trip.flow === 'destination'

  return (
    <div className="space-y-3 pt-2">
      {/* Primary: open full route */}
      <Button
        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white h-11"
        onClick={() => {
          // Phase 2/3: real Google Maps URL
          alert('Google Maps integration coming in Phase 2/3')
        }}
      >
        <Map className="w-4 h-4 mr-2" />
        Open in Google Maps
      </Button>

      {/* Destination flow: per-day buttons */}
      {isDestination && trip.result.stops.length > 5 && (
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => alert('Day split URLs coming in Phase 3')}
          >
            <ExternalLink className="w-3 h-3 mr-1.5" />
            Day 1–3 route
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => alert('Day split URLs coming in Phase 3')}
          >
            <ExternalLink className="w-3 h-3 mr-1.5" />
            Day 4–7 route
          </Button>
        </div>
      )}

      {/* Share row */}
      <div className="flex gap-2">
        <Input
          readOnly
          value={shareUrl}
          className="text-xs text-slate-500 bg-slate-50"
        />
        <Button variant="outline" size="sm" onClick={handleCopy} className="shrink-0">
          <Copy className="w-3.5 h-3.5 mr-1.5" />
          {copied ? 'Copied!' : 'Copy'}
        </Button>
      </div>
    </div>
  )
}
