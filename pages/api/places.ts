import type { NextApiRequest, NextApiResponse } from 'next'

export interface OTMPlace {
  xid: string
  name: string
  lat: number
  lon: number
  kinds: string
  dist: number
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

    return res.status(200).json(places)
  } catch {
    return res.status(500).json({ error: 'Failed to fetch places' })
  }
}
