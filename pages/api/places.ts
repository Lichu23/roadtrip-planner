import type { NextApiRequest, NextApiResponse } from 'next'

export interface OTMPlace {
  xid: string
  name: string
  lat: number
  lon: number
  kinds: string
  dist: number
  wikiExtract?: string
}

// ─── Wikipedia enrichment ─────────────────────────────────────────────────────

async function fetchWikiExtract(name: string, lat: number, lon: number): Promise<string | null> {
  try {
    // Primary: geosearch within 500m of coordinates
    const geoRes = await fetch(
      `https://en.wikipedia.org/w/api.php?action=query&list=geosearch` +
      `&gsradius=500&gscoord=${lat}|${lon}&gslimit=1&format=json`
    )
    const geoData = await geoRes.json() as { query?: { geosearch?: { pageid: number }[] } }
    const pageId = geoData.query?.geosearch?.[0]?.pageid

    const targetId = pageId ?? await searchWikiByName(name)
    if (!targetId) return null

    const extRes = await fetch(
      `https://en.wikipedia.org/w/api.php?action=query&pageids=${targetId}` +
      `&prop=extracts&exintro=1&explaintext=1&exsentences=3&format=json`
    )
    const extData = await extRes.json() as { query?: { pages?: Record<string, { extract?: string }> } }
    const extract = extData.query?.pages?.[String(targetId)]?.extract ?? ''
    return extract.trim() || null
  } catch {
    return null
  }
}

async function searchWikiByName(name: string): Promise<number | null> {
  try {
    const res = await fetch(
      `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(name)}` +
      `&prop=extracts&exintro=1&explaintext=1&exsentences=3&format=json`
    )
    const data = await res.json() as { query?: { pages?: Record<string, { pageid?: number }> } }
    const pages = data.query?.pages ?? {}
    const page = Object.values(pages)[0]
    return page?.pageid && page.pageid !== -1 ? page.pageid : null
  } catch {
    return null
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { lat, lon, radius, kinds, limit, rate } = req.query

  if (!lat || !lon) {
    return res.status(400).json({ error: 'lat and lon are required' })
  }

  const apiKey = process.env.OPENTRIPMAP_API_KEY
  if (!apiKey) {
    return res.status(500).json({ error: 'OPENTRIPMAP_API_KEY not configured' })
  }

  const params = new URLSearchParams({
    apikey: apiKey,
    lat: String(lat),
    lon: String(lon),
    radius: String(radius ?? 15000),
    kinds: String(kinds ?? 'interesting_places'),
    limit: String(limit ?? 10),
    rate: String(rate ?? 2),
    format: 'json',
  })

  try {
    const response = await fetch(
      `https://api.opentripmap.com/0.1/en/places/radius?${params.toString()}`
    )

    if (!response.ok) {
      return res.status(response.status).json({ error: 'OTM request failed' })
    }

    const data = await response.json() as {
      features?: {
        geometry: { coordinates: [number, number] }
        properties: { xid: string; name: string; kinds: string; dist: number }
      }[]
    }

    const features = data.features ?? []

    const places: OTMPlace[] = features
      .map((f) => ({
        xid: f.properties.xid,
        name: f.properties.name,
        lat: f.geometry.coordinates[1],
        lon: f.geometry.coordinates[0],
        kinds: f.properties.kinds,
        dist: f.properties.dist,
      }))
      .filter((p) => p.name && p.name.trim() !== '' && p.lat !== 0 && p.lon !== 0)

    // Enrich each POI with a Wikipedia extract in parallel
    const enriched = await Promise.all(
      places.map(async (p) => ({
        ...p,
        wikiExtract: (await fetchWikiExtract(p.name, p.lat, p.lon)) ?? undefined,
      }))
    )

    return res.status(200).json(enriched)
  } catch {
    return res.status(500).json({ error: 'Failed to fetch places' })
  }
}
