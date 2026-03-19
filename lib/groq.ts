import { TripResult } from './constants'

const PRIMARY_MODEL = 'llama-3.3-70b-versatile'
const FALLBACK_MODEL = 'llama-3.1-8b-instant'

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
