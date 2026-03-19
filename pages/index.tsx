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
  DEFAULT_FORM_DATA,
  LOADING_MESSAGES,
} from '@/lib/constants'

// ─── Dummy data for Phase 1 ───────────────────────────────────────────────────

const DUMMY_GPS_TRIP: Trip = {
  id: 'dummy-gps-001',
  createdAt: new Date().toISOString(),
  flow: 'gps',
  input: {
    locationName: 'Oviedo, Asturias',
    lat: 43.3532321,
    lon: -5.8427411,
    destination: '',
    duration: 1,
    styles: ['culture', 'nature'],
    transport: 'car',
    notes: '',
  },
  result: {
    title: 'Your 1-Day Asturias Adventure',
    totalKm: 82,
    stops: [
      {
        id: 1,
        name: 'Oviedo Cathedral',
        type: 'Cathedral',
        description:
          'A stunning Gothic masterpiece rising above the old town of Oviedo. The cathedral houses the famous Holy Chamber with its collection of pre-Romanesque art and relics.',
        lat: 43.3619,
        lon: -5.8459,
        distFromPrev: 0,
        suggestedDays: 0.5,
        suggestedDaysLabel: 'Half a day',
        highlights: ['Gothic architecture', 'Holy Chamber', 'Cloister garden'],
        bestFor: 'culture',
        practicalInfo: {
          entranceFee: '€4 (Holy Chamber)',
          bestTime: 'Morning',
          tip: 'Arrive early to avoid tour groups and get the best light through the stained glass.',
        },
        visited: false,
      },
      {
        id: 2,
        name: 'Covadonga Sanctuary',
        type: 'Sanctuary',
        description:
          'A sacred pilgrimage site set dramatically into a mountain cliff in the Picos de Europa. The site marks the origin of the Christian Reconquista with its iconic pink basilica.',
        lat: 43.3456,
        lon: -5.045,
        distFromPrev: 68,
        suggestedDays: 0.5,
        suggestedDaysLabel: 'Half a day',
        highlights: ['Pink basilica', 'Mountain views', 'Holy Cave'],
        bestFor: 'culture',
        practicalInfo: {
          entranceFee: 'Free',
          bestTime: 'Morning',
          tip: 'Go early — the mountain road gets very crowded by midday in summer.',
        },
        visited: false,
      },
      {
        id: 3,
        name: 'Playa de San Lorenzo',
        type: 'Beach',
        description:
          'A stunning 1.5km urban beach backed by the lively promenade of Gijón. Crystal-clear Atlantic waters and great surf make it a favourite with locals year-round.',
        lat: 43.5493,
        lon: -5.6615,
        distFromPrev: 82,
        suggestedDays: 0.5,
        suggestedDaysLabel: 'Half a day',
        highlights: ['Surf waves', 'Promenade walk', 'Sunset views'],
        bestFor: 'nature',
        practicalInfo: {
          entranceFee: 'Free',
          bestTime: 'Afternoon',
          tip: 'The western end near Cimadevilla is less crowded and has great views of the headland.',
        },
        visited: false,
      },
    ],
  },
}

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

  // Cycle loading messages while in loading state
  useEffect(() => {
    if (currentState !== 'loading') return
    let i = 0
    const interval = setInterval(() => {
      i = (i + 1) % LOADING_MESSAGES.length
      setLoadingMessage(LOADING_MESSAGES[i])
    }, 1500)
    return () => clearInterval(interval)
  }, [currentState])

  function handleGenerate() {
    setError(null)
    setCurrentState('loading')
    setLoadingMessage(LOADING_MESSAGES[0])
    // Phase 1: fake delay, show dummy data
    setTimeout(() => {
      const dummy = currentFlow === 'gps' ? DUMMY_GPS_TRIP : DUMMY_DEST_TRIP
      setTrip({ ...dummy, input: { ...dummy.input, ...formData } })
      setCurrentState('results')
    }, 2000)
  }

  function handleEdit() {
    setCurrentState('intake')
  }

  function handleRegenerate() {
    handleGenerate()
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
        <IntakeScreen
          currentFlow={currentFlow}
          onFlowChange={setCurrentFlow}
          formData={formData}
          onFormChange={setFormData}
          onGenerate={handleGenerate}
        />
      )}

      {currentState === 'loading' && (
        <LoadingScreen
          label={currentFlow === 'gps' ? formData.locationName || 'Your location' : formData.destination || 'Your destination'}
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

      {error && (
        <div className="fixed bottom-4 left-4 right-4 bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
          {error}
        </div>
      )}
    </div>
  )
}
