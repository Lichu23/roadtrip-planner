import { useState, useEffect, useMemo, startTransition } from 'react'
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
  TripResult,
  HistoryEntry,
  Stop,
  DEFAULT_FORM_DATA,
} from '@/lib/constants'
import { Lang, translations } from '@/lib/i18n'
import { generateTrip, translateTitle, buildFlow1Prompt, buildFlow2Prompt, buildOTMFlow1Prompt, buildOTMFlow2Prompt } from '@/lib/groq'
import { sortByNearest, geocodeAllStops } from '@/lib/geo'
import { fetchPOIs, styleToKinds, radiusByDuration, deduplicatePOIs } from '@/lib/opentripmap'
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
  // Simple defaults — must match SSR output to avoid hydration mismatch
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

  // ─── After hydration: restore all persisted state ─────────────────────────
  // startTransition defers these updates so they don't block the initial paint
  useEffect(() => {
    startTransition(() => {
      const savedLang = localStorage.getItem('roadtrip_lang') as Lang | null
      if (savedLang === 'en' || savedLang === 'es') setLang(savedLang)

      setHistory(loadHistory())

      const tripFromURL = decodeTripFromURL()
      if (tripFromURL) {
        setTrip(tripFromURL)
        setCurrentFlow(tripFromURL.flow)
        setCurrentState('results')
        return
      }

      const savedTrip = loadCurrentTrip()
      const savedForm = loadFormData()
      if (savedTrip) {
        setTrip(savedTrip)
        setCurrentFlow(savedTrip.flow)
        setCurrentState('results')
      }
      if (savedForm) {
        setFormData(savedForm)
        if (!savedTrip) setCurrentFlow(savedForm.destination ? 'destination' : 'gps')
      }
    })
  }, [])

  function handleLangChange(next: Lang) {
    setLang(next)
    localStorage.setItem('roadtrip_lang', next)
  }

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

    const lat = input.lat ?? 0
    const lon = input.lon ?? 0

    setCurrentState('loading')
    setLoadingMessage(t.loadingMessages[0])
    setError(null)

    try {
      let promptEn: string, promptEs: string
      let poisForOverride: { lat: number; lon: number }[] = []

      if (input.lat !== null && input.lon !== null) {
        // OTM path: fetch real POIs
        setLoadingMessage(t.loadingMessages[1]) // "Finding real places..."
        const kinds = styleToKinds(input.styles)
        const radius = radiusByDuration(input.duration)
        const rate = input.duration <= 3 ? 3 : 2
        const raw = await fetchPOIs(lat, lon, radius, kinds, input.stopsCount * 2, rate)
        const pois = deduplicatePOIs(raw).slice(0, input.stopsCount)

        if (pois.length > 0) {
          poisForOverride = pois.map((p) => ({ lat: p.lat, lon: p.lon }))
          setLoadingMessage(t.loadingMessages[2]) // "Generating descriptions..."
          promptEn = buildOTMFlow1Prompt({ ...input, lat, lon }, pois, 'English')
          promptEs = buildOTMFlow1Prompt({ ...input, lat, lon }, pois, 'Spanish')
        } else {
          // OTM returned nothing — fall back to Groq-only
          promptEn = buildFlow1Prompt({ ...input, lat, lon }, 'English')
          promptEs = buildFlow1Prompt({ ...input, lat, lon }, 'Spanish')
        }
      } else {
        // No coords — Groq-only path
        promptEn = buildFlow1Prompt({ ...input, lat, lon }, 'English')
        promptEs = buildFlow1Prompt({ ...input, lat, lon }, 'Spanish')
      }

      setLastPrompt(lang === 'es' ? promptEs : promptEn)
      // Generate EN first to get the canonical title, then translate + generate ES in parallel
      const resultEn = await generateTrip(promptEn)
      const [resultEs, esTitle] = await Promise.all([
        generateTrip(promptEs),
        translateTitle(resultEn.title, 'Spanish'),
      ])

      // Normalize EN stops as the canonical source (coords, ids, distances)
      let enStops: Stop[]
      if (poisForOverride.length > 0) {
        const overridden = (resultEn.stops as Stop[]).map((s, i) =>
          poisForOverride[i] ? { ...s, lat: poisForOverride[i].lat, lon: poisForOverride[i].lon } : s
        )
        enStops = normalizeStops(overridden, lat, lon)
      } else {
        const geocoded = await geocodeAllStops(resultEn.stops as Stop[], input.locationName)
        enStops = normalizeStops(geocoded, lat, lon)
      }

      // ES stops: same geo as EN, overlay ES text-only fields
      const esStops: Stop[] = enStops.map((enStop, i) => {
        const esRaw = resultEs.stops[i] as Stop | undefined
        if (!esRaw) return enStop
        return { ...enStop, type: esRaw.type, description: esRaw.description,
          highlights: esRaw.highlights, bestFor: esRaw.bestFor, practicalInfo: esRaw.practicalInfo }
      })

      const results = {
        en: { ...resultEn, stops: enStops } as TripResult,
        es: { ...resultEs, title: esTitle, stops: esStops } as TripResult,
      }

      const newTrip: Trip = {
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        flow: 'gps',
        input,
        result: results[lang] ?? results.en,
        results,
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

    setCurrentState('loading')
    setLoadingMessage(t.loadingMessages[0])
    setError(null)

    try {
      let promptEn: string, promptEs: string
      let poisForOverride: { lat: number; lon: number }[] = []

      if (input.lat !== null && input.lon !== null) {
        // OTM path: fetch real POIs
        setLoadingMessage(t.loadingMessages[1]) // "Finding real places..."
        const kinds = styleToKinds(input.styles)
        const radius = radiusByDuration(input.duration)
        const rate = input.duration <= 3 ? 3 : 2
        const stopsCount = Math.min(Math.max(input.duration, 4), 12)
        const rawPois = await fetchPOIs(input.lat, input.lon, radius, kinds, stopsCount * 3, rate)
        const pois = deduplicatePOIs(rawPois).slice(0, stopsCount)

        if (pois.length > 0) {
          poisForOverride = pois.map((p) => ({ lat: p.lat, lon: p.lon }))
          setLoadingMessage(t.loadingMessages[2]) // "Generating descriptions..."
          promptEn = buildOTMFlow2Prompt(input, pois, 'English')
          promptEs = buildOTMFlow2Prompt(input, pois, 'Spanish')
        } else {
          // OTM returned nothing — fall back to Groq-only
          promptEn = buildFlow2Prompt(input, 'English')
          promptEs = buildFlow2Prompt(input, 'Spanish')
        }
      } else {
        // No coords — Groq-only path
        promptEn = buildFlow2Prompt(input, 'English')
        promptEs = buildFlow2Prompt(input, 'Spanish')
      }

      setLastPrompt(lang === 'es' ? promptEs : promptEn)
      const resultEn = await generateTrip(promptEn)
      const [resultEs, esTitle] = await Promise.all([
        generateTrip(promptEs),
        translateTitle(resultEn.title, 'Spanish'),
      ])

      // Normalize EN stops as canonical source (coords, ids, day assignments)
      let enStops: Stop[]
      if (poisForOverride.length > 0) {
        const overridden = (resultEn.stops as Stop[]).map((s, i) =>
          poisForOverride[i] ? { ...s, lat: poisForOverride[i].lat, lon: poisForOverride[i].lon } : s
        )
        enStops = normalizeDestStops(overridden)
      } else {
        const geocoded = await geocodeAllStops(resultEn.stops as Stop[], input.destination)
        enStops = normalizeDestStops(geocoded)
      }

      // ES stops: same geo as EN, overlay ES text-only fields
      const esStops: Stop[] = enStops.map((enStop, i) => {
        const esRaw = resultEs.stops[i] as Stop | undefined
        if (!esRaw) return enStop
        return { ...enStop, type: esRaw.type, description: esRaw.description,
          highlights: esRaw.highlights, bestFor: esRaw.bestFor, practicalInfo: esRaw.practicalInfo }
      })

      const results = {
        en: { ...resultEn, stops: enStops } as TripResult,
        es: { ...resultEs, title: esTitle, stops: esStops, entryPointReason: resultEs.entryPointReason } as TripResult,
      }

      const newTrip: Trip = {
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        flow: 'destination',
        input,
        result: results[lang] ?? results.en,
        results,
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
    const markVisited = (stops: Stop[]) => stops.map((s) => (s.id === id ? { ...s, visited } : s))
    setTrip({
      ...trip,
      result: { ...trip.result, stops: markVisited(trip.result.stops) },
      results: trip.results
        ? {
            en: { ...trip.results.en, stops: markVisited(trip.results.en.stops) },
            es: { ...trip.results.es, stops: markVisited(trip.results.es.stops) },
          }
        : undefined,
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
          trip={{ ...trip, result: trip.results?.[lang] ?? trip.result }}
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
