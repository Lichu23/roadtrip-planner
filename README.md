# Roadtrip Planner

AI-powered road trip generator. Tell it where you are or where you want to go — it builds a smart route sorted by proximity and opens it directly in Google Maps.

## Two flows

**Flow 1 — I know where I am**
Share your GPS location or type a street address. Get a day-trip route with stops sorted nearest to farthest. Check off stops as you visit them.

**Flow 2 — I know the destination**
Type a city or country. Get a multi-day itinerary with stops connected in a logical chain route. Open each day's route in Google Maps.

## Tech stack

- Next.js 14 (Pages Router) + Tailwind CSS
- shadcn/ui for components
- Groq API (llama-3.3-70b-versatile) for trip generation
- Nominatim (OpenStreetMap) for geocoding — no API key needed
- Google Maps `maps/dir` URL for route opening — no API key needed
- localStorage for state persistence — no backend needed
- Vercel for hosting and API route proxy

## Local development

```bash
git clone <repo>
cd roadtrip-planner
npm install

cp .env.example .env.local
# Add your GROQ_API_KEY to .env.local

npm run dev
# Open http://localhost:3000
```

Get a free Groq API key at https://console.groq.com

## Deploy to Vercel

```bash
npm run build     # verify build passes
npm install -g vercel
vercel
# In Vercel dashboard: Project Settings → Environment Variables → add GROQ_API_KEY
vercel --prod
```

## Project structure

```
pages/
  index.jsx          Single page app — entire UI
  _app.jsx           App wrapper with Toaster
  api/
    generate.js      Groq API proxy (keeps API key server-side)

components/
  ui/                shadcn components (do not edit directly)
  TopBar.jsx
  HistoryDrawer.jsx
  IntakeScreen.jsx
  FlowGPS.jsx
  FlowDestination.jsx
  LoadingScreen.jsx
  ResultsScreen.jsx
  FilterBar.jsx
  StopCardGPS.jsx
  StopCardDest.jsx
  ActionBar.jsx
  TripStats.jsx

lib/
  constants.js       All constants and config values
  storage.js         localStorage read/write
  groq.js            Groq API client
  geo.js             Haversine distance, nearest-neighbor sort
  format.js          formatDays, formatDist, groupStopsByDay
  maps.js            Google Maps URL builder
  sharing.js         Base64 trip encode/decode for URL sharing
  utils.js           cn() helper (shadcn default)

.claude/             Internal planning docs (not committed)
CLAUDE.md            Claude instructions (committed)
```
