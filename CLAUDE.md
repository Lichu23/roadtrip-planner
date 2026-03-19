# CLAUDE.md — Roadtrip Planner Project

## Read this file at the start of every session before doing anything else.
## Also read all files inside the .claude/ folder before starting work.

---

## Project overview

A road trip planner web app with two user flows:
- **Flow 1 (GPS):** User shares their location or types a street address → generates a day-trip route sorted nearest to farthest from their position → checklist mode to mark stops as visited.
- **Flow 2 (Destination):** User types a city or country → generates a multi-day trip connecting tourist destinations in a chain (nearest-neighbor between stops, not from a center point) → day-grouped itinerary with Google Maps links.

Full details in `.claude/GOALS.md`, `.claude/ARCHITECTURE.md`, `.claude/TECHSTACK.md`, `.claude/SCHEMA.md`, `.claude/PHASES.md`.

---

## Skills setup

### Check before installing — never reinstall an already-installed skill

```bash
ls ~/.claude/skills/ 2>/dev/null || echo "No skills directory found"
claude skills list 2>/dev/null || echo "Skills CLI not available"
```

### Skills required for this project

| Skill | Purpose |
|---|---|
| `frontend-design` | Production-grade UI, Tailwind patterns, component design |

### Install frontend-design (only if not already installed)

```bash
ls ~/.claude/skills/frontend-design 2>/dev/null && echo "ALREADY INSTALLED - skip" || echo "NOT installed - proceed"
cp -r /mnt/skills/public/frontend-design ~/.claude/skills/frontend-design
```

---

## shadcn/ui — component check rule (CRITICAL)

### Before building ANY UI element — run this check every single time.

**Step 1 — Check what is already installed:**

```bash
ls components/ui/
```

**Step 2 — Check `.claude/SHADCN.md` to see if shadcn has a component for what you need.**

**Step 3 — If listed in SHADCN.md but not in `components/ui/`, install it:**

```bash
npx shadcn@latest add <component-name>
```

**Step 4 — Only build custom if shadcn has nothing suitable.**

### Rule in practice — examples

| Need | Action |
|---|---|
| A button | Check `components/ui/button.tsx` → install if missing |
| A card | Check `components/ui/card.tsx` → install if missing |
| A checkbox | Check `components/ui/checkbox.tsx` → install if missing |
| A slide-in drawer | Check `components/ui/drawer.tsx` → install if missing |
| A text input | Check `components/ui/input.tsx` → install if missing |
| A badge/tag | Check `components/ui/badge.tsx` → install if missing |
| A progress bar | Check `components/ui/progress.tsx` → install if missing |
| A collapsible section | Check `components/ui/collapsible.tsx` → install if missing |
| A stop card (custom layout) | Not in shadcn → build using Card + Badge + Checkbox primitives |
| A chain connector line | Not in shadcn → build with Tailwind only |
| A flow selector card | Not in shadcn → build using Card primitive |

**Never write `<button className="bg-emerald-600 px-4 py-2 rounded...">` when shadcn Button exists.**
**Never write a raw `<div className="border rounded-lg p-4">` card when shadcn Card exists.**

---

## Git workflow — CRITICAL rules

### Branch per phase — never work on main directly

```
main                 → stable, deployed code only
phase/1-shell        → Phase 1 work
phase/2-flow1        → Phase 2 work
phase/3-flow2        → Phase 3 work
phase/4-persistence  → Phase 4 work
phase/5-polish       → Phase 5 work
phase/6-deploy       → Phase 6 work
```

### Create branch before starting each phase

```bash
git checkout main
git pull origin main
git checkout -b phase/N-name
```

### Before ANY commit or push — STOP and ask the user

```
─────────────────────────────────────────
READY TO COMMIT — please review before I proceed:

Branch:  phase/N-name
Files changed:
  [list changed files here]

Commit message:
  "[proposed message]"

Shall I proceed with the commit? (yes / no / edit message)
─────────────────────────────────────────
```

Wait for explicit confirmation. Never auto-commit or auto-push.

### After user confirms commit, also ask before push

```
─────────────────────────────────────────
READY TO PUSH — please review:

Pushing branch: phase/N-name → origin/phase/N-name

Shall I push now? (yes / no)
─────────────────────────────────────────
```

---

## File and folder visibility rules

### Hidden from git (in .gitignore) — not committed

```
.claude/          ← all planning docs, internal only
*.md              ← all markdown files EXCEPT README.md and CLAUDE.md
!README.md
!CLAUDE.md
.env
.env.local
node_modules/
.next/
out/
```

### Visible in git — committed normally

```
CLAUDE.md
README.md
pages/
components/
lib/
public/
styles/
package.json
next.config.js
tailwind.config.js
postcss.config.js
vercel.json
components.json        ← shadcn config file
```

---

## Coding conventions

### File structure

```
pages/
  index.tsx              ← only page, full app lives here
  _app.tsx               ← app wrapper with Toaster
  api/
    generate.ts          ← Next.js API route (Groq proxy)

components/
  ui/                    ← shadcn components (auto-generated, do not edit)
  TopBar.tsx
  HistoryDrawer.tsx
  IntakeScreen.tsx
  FlowGPS.tsx
  FlowDestination.tsx
  LoadingScreen.tsx
  ResultsScreen.tsx
  FilterBar.tsx
  StopCardGPS.tsx
  StopCardDest.tsx
  ActionBar.tsx
  TripStats.tsx

lib/
  constants.ts           ← all constants
  storage.ts             ← all localStorage logic
  groq.ts                ← Groq API client
  geo.ts                 ← haversine, sortByNearest
  format.ts              ← formatDays, formatDist
  maps.ts                ← Google Maps URL builder
  sharing.ts             ← base64 encode/decode
  utils.ts               ← cn() and other helpers (shadcn default)
```

### General rules

- One component per file, PascalCase filename matches component name
- No inline styles — Tailwind classes only
- No hardcoded user-visible strings — use constants
- Use `.tsx` extension for all React component files
- Use `.ts` extension for all non-component TypeScript files
- Use `cn()` from `lib/utils.ts` for all conditional class merging

### TypeScript rules

- Always type component props using `interface` — never use untyped props
- Use the interfaces defined in `SCHEMA.md` for all data shapes — do not invent new ones
- Never use `any` — use `unknown` and narrow the type if needed
- Type all function parameters and return values in `lib/` utility files
- Props interfaces are defined at the top of each component file, named `[ComponentName]Props`
- Example:
  ```ts
  interface StopCardGPSProps {
    stop: Stop
    onVisitedChange: (id: number, visited: boolean) => void
  }
  ```

### State management

- `useState` and `useReducer` only — no Redux, no Zustand, no Context for this project
- App-level state lives in `pages/index.jsx`
- `currentState`: `"intake"` | `"loading"` | `"results"`
- `currentFlow`: `"gps"` | `"destination"`
- Never access localStorage directly in components — always through `lib/storage.js`
- All browser APIs (localStorage, geolocation) must be inside `useEffect` — never at module level

### Next.js rules

- Pages Router only — no App Router, no server components, no `"use client"` directives
- `pages/index.tsx` is the entire app (single page application)
- `pages/api/generate.ts` is the only API route
- `GROQ_API_KEY` is server-side only — never use `NEXT_PUBLIC_` prefix for it
- Never import or reference `process.env.GROQ_API_KEY` outside `pages/api/`

### Error handling

- Every API call in try/catch
- Never show a blank screen — always show error state with retry
- Groq errors → error state with Retry button
- Nominatim errors → silent fallback to "Your location"
- GPS denied → auto-show manual address input

### Tailwind + shadcn

- Color palette: `slate` for neutrals, `emerald` for primary/accents
- Mobile-first, `md:` for desktop
- No arbitrary Tailwind values like `w-[347px]`
- Customize shadcn components via `className` prop using `cn()` — never edit `components/ui/` files directly

---

## Scope discipline

- Do not touch code outside the current phase scope
- If something from a previous phase is broken, flag it before fixing
- Never refactor working code from a previous phase

---

## Session start checklist

At the start of every session, before writing any code:

1. Read this file (CLAUDE.md)
2. Read all files in `.claude/`
3. Run `git branch` — confirm which phase is active
4. Run `ls ~/.claude/skills/frontend-design` — confirm skill is installed
5. Run `ls components/ui/` — note which shadcn components are available
6. Ask the user to confirm the session goal
7. Write a one-paragraph summary of what you understand and wait for confirmation before touching any file
