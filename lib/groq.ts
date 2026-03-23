import { TripResult, TripInput } from './constants'
import { OTMPlace } from './opentripmap'

const PRIMARY_MODEL = 'llama-3.3-70b-versatile'
const FALLBACK_MODEL = 'llama-3.1-8b-instant'

// ─── Prompts ──────────────────────────────────────────────────────────────────

function bestTimeOptions(lang: string) {
  return lang === 'Spanish' ? 'Mañana, Tarde, Día completo' : 'Morning, Afternoon, Full day'
}

function feeExamples(lang: string) {
  return lang === 'Spanish' ? 'Gratis o Varía' : 'Free or Varies'
}

function typeExamples(lang: string, flow: 'gps' | 'dest') {
  if (lang === 'Spanish') {
    return flow === 'gps'
      ? 'Catedral / Museo / Playa / Pueblo / Parque / etc'
      : 'Ciudad / Pueblo de montaña / Aldea / Playa / Parque / etc'
  }
  return flow === 'gps'
    ? 'Cathedral / Museum / Beach / Village / Park / etc'
    : 'City / Hill Town / Village / Beach / Park / etc'
}

export function buildFlow1Prompt(input: TripInput, lang = 'English'): string {
  const { locationName, lat, lon, duration, stopsCount, styles, transport, notes } = input
  const count = stopsCount ?? 5
  return `You are a travel planning assistant. Generate a road trip itinerary.

User's starting location: ${locationName} (coordinates: ${lat}, ${lon})
Trip duration: ${duration} day${duration > 1 ? 's' : ''}
Number of stops: ${count}
Travel styles: ${styles.join(', ')}
Transport: ${transport}
Notes: ${notes || 'none'}

Return ONLY a valid JSON object. No explanation, no markdown, no extra text.

Rules:
- Generate exactly ${count} stops
- PRIORITY: Fill stops with places INSIDE ${locationName} city/town first (museums, monuments, neighborhoods, parks within the city). Only go outside the city if there are not enough places inside to reach ${count} stops.
- For 1 day: keep all stops within 30km of the start location
- For 2+ days: stops can extend up to 150km from start
- Each stop must have real, accurate GPS coordinates
- Coordinates must match the actual real-world location of each stop
- IMPORTANT: Always use the official local-language name for each stop (e.g. "Catedral de San Salvador" not "Oviedo Cathedral", "Museo del Prado" not "Prado Museum"). This is required for geocoding accuracy.
- Write the title, type, description, highlights, and practical info in ${lang}. Stop names must stay in their official local language.
- suggestedDays MUST be exactly one of: 0.5, 1, 1.5, or 2 — no other values allowed, must sum to approximately ${duration}
- highlights: exactly 2-3 short items
- bestFor: must be one of: culture, nature, food, adventure, beaches, architecture, hidden
- practicalInfo.bestTime: must be one of: ${bestTimeOptions(lang)}
- totalKm: realistic total driving/travel distance in km

JSON structure:
{
  "title": "string — engaging trip title",
  "totalKm": number,
  "stops": [
    {
      "name": "string",
      "type": "string — ${typeExamples(lang, 'gps')}",
      "description": "string — exactly 2 sentences, specific and informative",
      "lat": number,
      "lon": number,
      "suggestedDays": number,
      "highlights": ["string", "string", "string"],
      "bestFor": "string",
      "practicalInfo": {
        "entranceFee": "string — specific if known, otherwise ${feeExamples(lang)}",
        "bestTime": "string",
        "tip": "string — one practical sentence a visitor would appreciate"
      }
    }
  ]
}`
}

export function buildFlow2Prompt(input: TripInput, lang = 'English'): string {
  const { destination, duration, styles, transport, notes } = input
  return `You are a travel planning assistant. Generate a road trip itinerary.

Destination: ${destination}
Trip duration: ${duration} days
Travel styles: ${styles.join(', ')}
Transport: ${transport}
Notes: ${notes || 'none'}

Return ONLY a valid JSON object. No explanation, no markdown, no extra text.

Rules:
- Generate exactly ${Math.min(Math.max(duration, 4), 12)} stops
- Choose the most important tourist destinations in or near ${destination}
- The FIRST stop must be the most logical entry point to the region (major city, transport hub, or geographic starting point). Explain why in entryPointReason.
- Do NOT sort stops — return them in any order. The app will sort them using nearest-neighbor algorithm.
- Each stop must have real, accurate GPS coordinates
- Coordinates must match the actual real-world location of each stop
- IMPORTANT: Always use the official local-language name for each stop (e.g. "Firenze" not "Florence", "Duomo di Milano" not "Milan Cathedral", "Catedral de Sevilla" not "Seville Cathedral"). This is required for geocoding accuracy.
- Write the title, type, description, highlights, and practical info in ${lang}. Stop names must stay in their official local language.
- suggestedDays MUST be exactly one of: 0.5, 1, 1.5, or 2 — no other values allowed, total should approximately equal ${duration}
- highlights: exactly 2-3 short items
- bestFor: must be one of: culture, nature, food, adventure, beaches, architecture, hidden
- practicalInfo.bestTime: must be one of: ${bestTimeOptions(lang)}
- totalKm: realistic total driving distance for the full chain route in km

JSON structure:
{
  "title": "string — engaging trip title",
  "totalKm": number,
  "entryPointReason": "string — one sentence explaining why the first stop is the logical entry point",
  "stops": [
    {
      "name": "string",
      "type": "string — ${typeExamples(lang, 'dest')}",
      "description": "string — exactly 2 sentences, specific and informative",
      "lat": number,
      "lon": number,
      "suggestedDays": number,
      "highlights": ["string", "string", "string"],
      "bestFor": "string",
      "practicalInfo": {
        "entranceFee": "string",
        "bestTime": "string",
        "tip": "string — one practical sentence"
      }
    }
  ]
}`
}

export function buildOTMFlow1Prompt(input: TripInput, pois: OTMPlace[], lang = 'English'): string {
  const { locationName, duration, stopsCount, styles, transport, notes } = input
  const count = pois.length
  const poiList = pois.map((p, i) => `${i + 1}. ${p.name} (lat: ${p.lat}, lon: ${p.lon})`).join('\n')
  return `You are a travel writing assistant. You have been given a list of real verified tourist attractions near ${locationName}. Your job is to write engaging descriptions for each place.

User's starting location: ${locationName}
Trip duration: ${duration} day${duration > 1 ? 's' : ''}
Number of stops: ${stopsCount}
Travel styles: ${styles.join(', ')}
Transport: ${transport}
Notes: ${notes || 'none'}

Here are the ${count} confirmed real places (with verified GPS coordinates):
${poiList}

Return ONLY a valid JSON object. No explanation, no markdown, no extra text.

CRITICAL RULES:
- Return EXACTLY ${count} stops, one per POI above, in the SAME ORDER
- Copy the lat and lon values EXACTLY as given above — do NOT change or invent coordinates
- Write the title, type, description, highlights, and practical info in ${lang}
- Stop names must stay in their official local language
- suggestedDays MUST be exactly one of: 0.5, 1, 1.5, or 2 — total should approximately equal ${duration}
- highlights: exactly 2-3 short items
- bestFor: must be one of: culture, nature, food, adventure, beaches, architecture, hidden
- practicalInfo.bestTime: must be one of: ${bestTimeOptions(lang)}
- totalKm: realistic total driving/travel distance in km

JSON structure:
{
  "title": "string — engaging trip title",
  "totalKm": number,
  "stops": [
    {
      "name": "string — official local-language name",
      "type": "string — ${typeExamples(lang, 'gps')}",
      "description": "string — exactly 2 sentences, specific and informative",
      "lat": number,
      "lon": number,
      "suggestedDays": number,
      "highlights": ["string", "string", "string"],
      "bestFor": "string",
      "practicalInfo": {
        "entranceFee": "string — specific if known, otherwise ${feeExamples(lang)}",
        "bestTime": "string",
        "tip": "string — one practical sentence a visitor would appreciate"
      }
    }
  ]
}`
}

export function buildOTMFlow2Prompt(input: TripInput, pois: OTMPlace[], lang = 'English'): string {
  const { destination, duration, styles, transport, notes } = input
  const count = pois.length
  const poiList = pois.map((p, i) => `${i + 1}. ${p.name} (lat: ${p.lat}, lon: ${p.lon})`).join('\n')
  return `You are a travel writing assistant. You have been given a list of real verified tourist destinations in/near ${destination}. Your job is to write engaging descriptions for each place.

Destination: ${destination}
Trip duration: ${duration} days
Travel styles: ${styles.join(', ')}
Transport: ${transport}
Notes: ${notes || 'none'}

Here are the ${count} confirmed real places (with verified GPS coordinates):
${poiList}

Return ONLY a valid JSON object. No explanation, no markdown, no extra text.

CRITICAL RULES:
- Return EXACTLY ${count} stops, one per POI above, in the SAME ORDER
- Copy the lat and lon values EXACTLY as given above — do NOT change or invent coordinates
- The first stop in the list is treated as the entry point — write entryPointReason explaining why it's a logical starting point
- Write the title, type, description, highlights, and practical info in ${lang}
- Stop names must stay in their official local language
- suggestedDays MUST be exactly one of: 0.5, 1, 1.5, or 2 — total should approximately equal ${duration}
- highlights: exactly 2-3 short items
- bestFor: must be one of: culture, nature, food, adventure, beaches, architecture, hidden
- practicalInfo.bestTime: must be one of: ${bestTimeOptions(lang)}
- totalKm: realistic total driving distance for the full chain route in km

JSON structure:
{
  "title": "string — engaging trip title",
  "totalKm": number,
  "entryPointReason": "string — one sentence explaining why the first stop is a logical entry point",
  "stops": [
    {
      "name": "string — official local-language name",
      "type": "string — ${typeExamples(lang, 'dest')}",
      "description": "string — exactly 2 sentences, specific and informative",
      "lat": number,
      "lon": number,
      "suggestedDays": number,
      "highlights": ["string", "string", "string"],
      "bestFor": "string",
      "practicalInfo": {
        "entranceFee": "string",
        "bestTime": "string",
        "tip": "string — one practical sentence"
      }
    }
  ]
}`
}

// ─── API call ─────────────────────────────────────────────────────────────────

export async function generateTrip(prompt: string, useFallback = false): Promise<TripResult> {
  const model = useFallback ? FALLBACK_MODEL : PRIMARY_MODEL

  const response = await fetch('/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      max_tokens: 2000,
      response_format: { type: 'json_object' },
      messages: [{ role: 'user', content: prompt }],
    }),
  })

  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    if (response.status === 429 && !useFallback) {
      return generateTrip(prompt, true)
    }
    const errMsg = (err as { error?: { message?: string } }).error?.message
    throw new Error(errMsg ?? `API error ${response.status}`)
  }

  const data = await response.json() as { choices?: { message?: { content?: string } }[] }
  const text = data.choices?.[0]?.message?.content

  if (!text) throw new Error('Empty response from AI')

  let parsed: unknown
  try {
    parsed = JSON.parse(text)
  } catch {
    throw new Error('AI returned invalid JSON')
  }

  const result = parsed as TripResult
  if (!result.stops || !Array.isArray(result.stops) || result.stops.length === 0) {
    throw new Error('No stops in AI response')
  }

  return result
}
