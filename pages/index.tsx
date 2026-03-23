import { useState, useEffect, useMemo } from 'react'
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
} from '@/lib/constants'
import { Lang, translations } from '@/lib/i18n'
import { generateTrip, buildFlow1Prompt, buildFlow2Prompt } from '@/lib/groq'
import { sortByNearest, geocodeAllStops } from '@/lib/geo'
import { formatDays } from '@/lib/format'
import {
  saveCurrentTrip,
  loadCurrentTrip,
  saveFormData,
  loadFormData,
  addToHistory,
  loadHistory,
  clearHistory,
  clearCurrentTrip,
} from '@/lib/storage'
import { decodeTripFromURL } from '@/lib/sharing'
import { AlertCircle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'

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

function normalizeDestStops(raw: Stop[]): Stop[] {
  if (raw.length === 0) return []
  const sorted = sortByNearest(raw, raw[0].lat, raw[0].lon)
  let cumDays = 0
  return sorted.map((s, i) => {
    const day = Math.floor(cumDays) + 1
    cumDays += s.suggestedDays
    return {
      ...s,
      id: i + 1,
      suggestedDaysLabel: formatDays(s.suggestedDays),
      day,
      dayLabel: `Day ${day}`,
      visited: false,
    }
  })
}

// ─── Page component ───────────────────────────────────────────────────────────

export default function Home() {
  const [currentState, setCurrentState] = useState<AppState>('intake')
  const [currentFlow, setCurrentFlow] = useState<Flow>('gps')
  const [formData, setFormData] = useState<TripInput>(DEFAULT_FORM_DATA)
  const [trip, setTrip] = useState<Trip | null>(null)
  const [historyOpen, setHistoryOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [lastPrompt, setLastPrompt] = useState<string>('')
  const [lang, setLang] = useState<Lang>('en')
  const [screenVisible, setScreenVisible] = useState(true)

  const t = useMemo(() => translations[lang], [lang])
  const [loadingMessage, setLoadingMessage] = useState(t.loadingMessages[0])

  async function fadeToState(fn: () => void) {
    setScreenVisible(false)
    await new Promise((r) => setTimeout(r, 350))
    fn()
    setScreenVisible(true)
  }

  // ─── On mount: restore language ───────────────────────────────────────────
  useEffect(() => {
    const saved = localStorage.getItem('roadtrip_lang') as Lang | null
    if (saved === 'en' || saved === 'es') setLang(saved)
  }, [])

  function handleLangChange(next: Lang) {
    setLang(next)
    localStorage.setItem('roadtrip_lang', next)
  }

  // ─── On mount: restore from URL hash or localStorage ─────────────────────
  useEffect(() => {
    // URL hash takes priority
    const tripFromURL = decodeTripFromURL()
    if (tripFromURL) {
      setTrip(tripFromURL)
      setCurrentFlow(tripFromURL.flow)
      setCurrentState('results')
      return
    }

    // Fall back to saved current trip
    const savedTrip = loadCurrentTrip()
    if (savedTrip) {
      setTrip(savedTrip)
      setCurrentFlow(savedTrip.flow)
      setCurrentState('results')
    }

    // Restore form data
    const savedForm = loadFormData()
    if (savedForm) {
      setFormData(savedForm)
      setCurrentFlow(savedForm.destination ? 'destination' : 'gps')
    }
  }, [])

  // ─── On mount: load history ───────────────────────────────────────────────
  useEffect(() => {
    setHistory(loadHistory())
  }, [])

  // ─── Persist trip on every change ────────────────────────────────────────
  useEffect(() => {
    if (trip) saveCurrentTrip(trip)
  }, [trip])

  // ─── Persist form data on every change ───────────────────────────────────
  useEffect(() => {
    saveFormData(formData)
  }, [formData])

  // ─── Cycle loading messages while generating ─────────────────────────────
  useEffect(() => {
    if (currentState !== 'loading') return
    let i = 0
    const messages = t.loadingMessages
    setLoadingMessage(messages[0])
    const interval = setInterval(() => {
      i = (i + 1) % messages.length
      setLoadingMessage(messages[i])
    }, 1500)
    return () => clearInterval(interval)
  }, [currentState, t])

  // ─── GPS flow generate ───────────────────────────────────────────────────

  async function handleGenerateGPS(input: TripInput) {
    // Need at least a location name or coordinates
    if (!input.locationName.trim() && input.lat === null) return

    // If we have a name but no coords, use 0,0 as fallback — Groq will still
    // generate based on the name text in the prompt
    const lat = input.lat ?? 0
    const lon = input.lon ?? 0

    const prompt = buildFlow1Prompt({ ...input, lat, lon }, t.groqLang)
    setLastPrompt(prompt)
    setCurrentState('loading')
    setLoadingMessage(t.loadingMessages[0])
    setError(null)

    try {
      const result = await generateTrip(prompt)
      const geocoded = await geocodeAllStops(result.stops as Stop[], input.locationName)
      const stops = normalizeStops(geocoded, lat, lon)

      const newTrip: Trip = {
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        flow: 'gps',
        input,
        result: { ...result, stops },
      }

      addToHistory(newTrip)
      setHistory(loadHistory())
      await fadeToState(() => {
        setTrip(newTrip)
        setCurrentState('results')
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
      setCurrentState('intake')
    }
  }

  // ─── Destination flow generate ───────────────────────────────────────────

  async function handleGenerateDest(input: TripInput) {
    if (!input.destination.trim()) return

    const prompt = buildFlow2Prompt(input, t.groqLang)
    setLastPrompt(prompt)
    setCurrentState('loading')
    setLoadingMessage(t.loadingMessages[0])
    setError(null)

    try {
      const result = await generateTrip(prompt)
      const geocoded = await geocodeAllStops(result.stops as Stop[], input.destination)
      const stops = normalizeDestStops(geocoded)

      const newTrip: Trip = {
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        flow: 'destination',
        input,
        result: { ...result, stops },
      }

      addToHistory(newTrip)
      setHistory(loadHistory())
      await fadeToState(() => {
        setTrip(newTrip)
        setCurrentState('results')
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
      setCurrentState('intake')
    }
  }

  // ─── Unified generate ────────────────────────────────────────────────────

  async function handleGenerate() {
    if (currentFlow === 'gps') {
      await handleGenerateGPS(formData)
    } else {
      await handleGenerateDest(formData)
    }
  }

  async function handleRegenerate() {
    if (currentFlow === 'gps') {
      await handleGenerateGPS(formData)
    } else {
      await handleGenerateDest(formData)
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
      addToHistory(newTrip)
      setHistory(loadHistory())
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

  function handleNewTrip() {
    clearCurrentTrip()
    setTrip(null)
    setFormData(DEFAULT_FORM_DATA)
    setCurrentFlow('gps')
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
    clearHistory()
    setHistory([])
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <TopBar onHistoryOpen={() => setHistoryOpen(true)} lang={lang} onLangChange={handleLangChange} t={t} />

      <HistoryDrawer
        open={historyOpen}
        onOpenChange={setHistoryOpen}
        history={history}
        onLoad={handleLoadHistory}
        onClear={handleClearHistory}
        t={t}
      />

      <div className={`transition-opacity duration-300 ${screenVisible ? 'opacity-100' : 'opacity-0'}`}>

      {currentState === 'intake' && (
        <>
          <IntakeScreen
            currentFlow={currentFlow}
            onFlowChange={setCurrentFlow}
            formData={formData}
            onFormChange={setFormData}
            onGenerate={handleGenerate}
            onCancel={trip ? () => setCurrentState('results') : undefined}
            t={t}
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
              ? formData.locationName || t.yourLocation
              : formData.destination || t.yourLocation
          }
          duration={formData.duration}
          message={loadingMessage}
          t={t}
        />
      )}

      {currentState === 'results' && trip && (
        <ResultsScreen
          trip={trip}
          onEdit={handleEdit}
          onRegenerate={handleRegenerate}
          onNewTrip={handleNewTrip}
          onVisitedChange={handleVisitedChange}
          t={t}
        />
      )}

      </div>
    </div>
  )
}
