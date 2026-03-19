import { useState, useEffect } from 'react'
import TopBar from '@/components/TopBar'
import HistoryDrawer from '@/components/HistoryDrawer'
import IntakeScreen from '@/components/IntakeScreen'
import LoadingScreen from '@/components/LoadingScreen'
import ResultsScreen from '@/components/ResultsScreen'
import {
  AppState,
  Flow,
  Trip,
  TripInput,
  HistoryEntry,
  Stop,
  DEFAULT_FORM_DATA,
  LOADING_MESSAGES,
} from '@/lib/constants'
import { generateTrip, buildFlow1Prompt } from '@/lib/groq'
import { sortByNearest } from '@/lib/geo'
import { formatDays } from '@/lib/format'
import { AlertCircle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'

// ─── Dummy destination trip — kept for Phase 3 (destination flow not wired yet) ──

const DUMMY_DEST_TRIP: Trip = {
  id: 'dummy-dest-001',
  createdAt: new Date().toISOString(),
  flow: 'destination',
  input: {
    locationName: '',
    lat: null,
    lon: null,
    destination: 'Tuscany, Italy',
    duration: 7,
    styles: ['culture', 'architecture'],
    transport: 'car',
    notes: '',
  },
  result: {
    title: 'Your 7-Day Tuscany Road Trip',
    totalKm: 365,
    entryPointReason:
      'Florence is the logical entry point as it has the main international airport and is the cultural heart of Tuscany.',
    stops: [
      {
        id: 1,
        name: 'Florence',
        type: 'City',
        description:
          'The cradle of the Renaissance, packed with world-class art and architecture. A single day barely scratches the surface of this extraordinary city.',
        lat: 43.7696,
        lon: 11.2558,
        distFromPrev: 0,
        suggestedDays: 2,
        suggestedDaysLabel: '2 days',
        highlights: ['Uffizi Gallery', 'Duomo', 'Ponte Vecchio'],
        bestFor: 'culture',
        practicalInfo: {
          entranceFee: '€20 (Uffizi)',
          bestTime: 'Full day',
          tip: 'Book Uffizi tickets online at least 2 days in advance to skip the queue.',
        },
        day: 1,
        dayLabel: 'Day 1',
      },
      {
        id: 2,
        name: 'Siena',
        type: 'Hill Town',
        description:
          'A perfectly preserved medieval city centred on the magnificent shell-shaped Piazza del Campo. The city rivals Florence in artistic heritage.',
        lat: 43.3186,
        lon: 11.3307,
        distFromPrev: 85,
        suggestedDays: 1,
        suggestedDaysLabel: '1 day',
        highlights: ['Piazza del Campo', 'Duomo di Siena', 'Contrada districts'],
        bestFor: 'architecture',
        practicalInfo: {
          entranceFee: '€4 (Duomo)',
          bestTime: 'Morning',
          tip: 'The city is entirely pedestrianized — park outside the walls.',
        },
        day: 3,
        dayLabel: 'Day 3',
      },
      {
        id: 3,
        name: 'San Gimignano',
        type: 'Village',
        description:
          'The medieval Manhattan of Tuscany, famous for its 14 surviving stone towers. A UNESCO World Heritage site that rewards early-morning visits.',
        lat: 43.4678,
        lon: 11.0423,
        distFromPrev: 40,
        suggestedDays: 0.5,
        suggestedDaysLabel: 'Half a day',
        highlights: ['Medieval towers', 'Piazza della Cisterna', 'Vernaccia wine'],
        bestFor: 'architecture',
        practicalInfo: {
          entranceFee: 'Free (towers extra)',
          bestTime: 'Morning',
          tip: 'Visit early morning or late afternoon — midday crowds are intense.',
        },
        day: 4,
        dayLabel: 'Day 4',
      },
    ],
  },
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function normalizeStops(raw: Stop[], fromLat: number, fromLon: number): Stop[] {
  const sorted = sortByNearest(raw, fromLat, fromLon)
  return sorted.map((s, i) => ({
    ...s,
    id: i + 1,
    suggestedDaysLabel: formatDays(s.suggestedDays),
    visited: false,
  }))
}

// ─── Page component ───────────────────────────────────────────────────────────

export default function Home() {
  const [currentState, setCurrentState] = useState<AppState>('intake')
  const [currentFlow, setCurrentFlow] = useState<Flow>('gps')
  const [formData, setFormData] = useState<TripInput>(DEFAULT_FORM_DATA)
  const [trip, setTrip] = useState<Trip | null>(null)
  const [historyOpen, setHistoryOpen] = useState(false)
  const [loadingMessage, setLoadingMessage] = useState(LOADING_MESSAGES[0])
  const [error, setError] = useState<string | null>(null)
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [lastPrompt, setLastPrompt] = useState<string>('')

  // Cycle loading messages while generating
  useEffect(() => {
    if (currentState !== 'loading') return
    let i = 0
    const interval = setInterval(() => {
      i = (i + 1) % LOADING_MESSAGES.length
      setLoadingMessage(LOADING_MESSAGES[i])
    }, 1500)
    return () => clearInterval(interval)
  }, [currentState])

  // ─── GPS flow generate ───────────────────────────────────────────────────

  async function handleGenerateGPS(input: TripInput) {
    // Need at least a location name or coordinates
    if (!input.locationName.trim() && input.lat === null) return

    // If we have a name but no coords, use 0,0 as fallback — Groq will still
    // generate based on the name text in the prompt
    const lat = input.lat ?? 0
    const lon = input.lon ?? 0

    const prompt = buildFlow1Prompt({ ...input, lat, lon })
    setLastPrompt(prompt)
    setCurrentState('loading')
    setLoadingMessage(LOADING_MESSAGES[0])
    setError(null)

    try {
      const result = await generateTrip(prompt)
      const stops = normalizeStops(result.stops as Stop[], lat, lon)

      const newTrip: Trip = {
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        flow: 'gps',
        input,
        result: { ...result, stops },
      }

      setTrip(newTrip)
      setCurrentState('results')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
      setCurrentState('intake')
    }
  }

  // ─── Destination flow generate (Phase 3) ────────────────────────────────

  function handleGenerateDest(input: TripInput) {
    // Phase 3: wire up real Groq call
    const dummy = { ...DUMMY_DEST_TRIP, input }
    setTrip(dummy)
    setCurrentState('results')
  }

  // ─── Unified generate ────────────────────────────────────────────────────

  async function handleGenerate() {
    if (currentFlow === 'gps') {
      await handleGenerateGPS(formData)
    } else {
      handleGenerateDest(formData)
    }
  }

  async function handleRegenerate() {
    if (currentFlow === 'gps') {
      await handleGenerateGPS(formData)
    } else {
      handleGenerateDest(formData)
    }
  }

  async function handleRetry() {
    if (!lastPrompt) return
    setCurrentState('loading')
    setError(null)
    try {
      const result = await generateTrip(lastPrompt)
      const lat = formData.lat ?? 0
      const lon = formData.lon ?? 0
      const stops = normalizeStops(result.stops as Stop[], lat, lon)
      const newTrip: Trip = {
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        flow: 'gps',
        input: formData,
        result: { ...result, stops },
      }
      setTrip(newTrip)
      setCurrentState('results')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
      setCurrentState('intake')
    }
  }

  function handleEdit() {
    setCurrentState('intake')
    setError(null)
  }

  function handleVisitedChange(id: number, visited: boolean) {
    if (!trip) return
    setTrip({
      ...trip,
      result: {
        ...trip.result,
        stops: trip.result.stops.map((s) => (s.id === id ? { ...s, visited } : s)),
      },
    })
  }

  function handleLoadHistory(entry: HistoryEntry) {
    setTrip(entry.trip)
    setCurrentFlow(entry.flow)
    setCurrentState('results')
    setHistoryOpen(false)
  }

  function handleClearHistory() {
    setHistory([])
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <TopBar onHistoryOpen={() => setHistoryOpen(true)} />

      <HistoryDrawer
        open={historyOpen}
        onOpenChange={setHistoryOpen}
        history={history}
        onLoad={handleLoadHistory}
        onClear={handleClearHistory}
      />

      {currentState === 'intake' && (
        <>
          <IntakeScreen
            currentFlow={currentFlow}
            onFlowChange={setCurrentFlow}
            formData={formData}
            onFormChange={setFormData}
            onGenerate={handleGenerate}
          />
          {error && (
            <div className="max-w-2xl mx-auto px-4 pb-6">
              <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-lg p-4">
                <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-red-700">Generation failed</p>
                  <p className="text-xs text-red-600 mt-0.5">{error}</p>
                </div>
                {lastPrompt && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRetry}
                    className="shrink-0 border-red-300 text-red-600 hover:bg-red-50"
                  >
                    <RefreshCw className="w-3 h-3 mr-1.5" />
                    Retry
                  </Button>
                )}
              </div>
            </div>
          )}
        </>
      )}

      {currentState === 'loading' && (
        <LoadingScreen
          label={
            currentFlow === 'gps'
              ? formData.locationName || 'Your location'
              : formData.destination || 'Your destination'
          }
          duration={formData.duration}
          message={loadingMessage}
        />
      )}

      {currentState === 'results' && trip && (
        <ResultsScreen
          trip={trip}
          onEdit={handleEdit}
          onRegenerate={handleRegenerate}
          onVisitedChange={handleVisitedChange}
        />
      )}
    </div>
  )
}
