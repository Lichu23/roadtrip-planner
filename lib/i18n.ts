import { TravelStyle, Transport } from './constants'

export type Lang = 'en' | 'es'

const en = {
  // TopBar
  historyAriaLabel: 'Search history',

  // IntakeScreen
  selected: 'Selected',
  flowGPSTitle: 'I know where I am',
  flowGPSDesc: 'Share your GPS location or type an address. Get a day-trip sorted nearest to farthest.',
  flowDestTitle: 'I have a destination',
  flowDestDesc: 'Type a city or country. Get a multi-day chain route with Google Maps links.',
  backToTrip: 'Back to trip',

  // FlowGPS
  yourLocation: 'Your location',
  useMyGPS: 'Use my GPS',
  detecting: 'Detecting...',
  locationUnavailable: 'Location unavailable — enter address below',
  orEnterAddress: 'Or enter a street address',
  numberOfStops: 'Number of stops',
  duration: 'Duration',
  travelStyle: 'Travel style',
  transport: 'Transport',
  generateRoadtrip: 'Generate road trip',
  notesOptional: 'Notes (optional)',
  notesPlaceholder: 'e.g. travelling with kids, vegetarian food only, no hiking...',
  destinationPlaceholder: 'e.g. Tuscany, Italy or Kyoto, Japan',

  // Dynamic labels
  stopsLabel: (n: number) => `${n} ${n === 1 ? 'stop' : 'stops'}`,
  dayLabel: (n: number) => n === 1 ? '1 day' : `${n} days`,
  dayRoadtrip: (n: number) => n === 1 ? '1-day road trip' : `${n}-day road trip`,

  // StopCardGPS
  visited: 'Visited',
  startingPoint: 'Starting point',
  suggestedTime: 'Suggested time',
  practicalInfo: 'Practical info',
  entrance: 'Entrance',
  bestTime: 'Best time',
  navigateHere: 'Navigate here',

  // StopCardDest
  routeStart: 'Route start',
  routeEnd: 'Route end',
  entranceFee: 'Entrance fee',

  // ResultsScreen
  allVisited: 'All stops visited ✓',
  visitedProgress: (n: number, total: number) => `${n} of ${total} visited`,
  stopsRemaining: (n: number) => `${n} ${n === 1 ? 'stop' : 'stops'} remaining`,
  dayHeader: (n: number) => `Day ${n}`,

  // FilterBar / AlertDialog
  reshuffle: 'Reshuffle',
  filters: 'Filters',
  newTrip: 'New trip',
  newTripTitle: 'Start a new trip?',
  newTripDesc: "Your current trip will be cleared from the screen. Don't worry — it's saved in your history and you can reload it anytime.",
  cancel: 'Cancel',
  startNewTrip: 'Start new trip',

  // ActionBar
  openGoogleMaps: 'Open full route in Google Maps',
  openOSM: 'Open in OpenStreetMap',
  copy: 'Copy',
  dayRoute: (label: string) => `${label} route`,

  // HistoryDrawer
  searchHistory: 'Search history',
  noTripsYet: 'No trips yet',
  noTripsDesc: 'Your generated trips will appear here',
  stopsAndDays: (stops: number, days: number) => `${stops} stops · ${days} days`,
  gpsTrip: 'GPS trip',
  destinationTrip: 'Destination trip',
  load: 'Load',
  clearAll: 'Clear all',

  // Loading messages
  loadingMessages: [
    'Finding top destinations...',
    'Finding real places...',
    'Generating descriptions...',
    'Sorting by distance...',
    'Building your route...',
    'Almost ready...',
  ],

  // Travel styles
  travelStyles: {
    culture: 'Culture & history',
    nature: 'Nature',
    food: 'Food & gastronomy',
    adventure: 'Adventure',
    beaches: 'Beaches',
    architecture: 'Architecture',
    hidden: 'Hidden gems',
  } as Record<TravelStyle, string>,

  // Transport modes
  transportModes: {
    car: 'Car',
    motorcycle: 'Motorcycle',
    mixed: 'Mixed',
  } as Record<Transport, string>,

  // bestTime translation map (Groq returns English values; translate for display)
  bestTimeLabels: { Morning: 'Morning', Afternoon: 'Afternoon', 'Full day': 'Full day' } as Record<string, string>,
  entranceFeeLabels: { Free: 'Free', Varies: 'Varies' } as Record<string, string>,
  typeLabels: {} as Record<string, string>,

  // Groq prompt language instruction
  groqLang: 'English',
}

const es: typeof en = {
  // TopBar
  historyAriaLabel: 'Historial de búsqueda',

  // IntakeScreen
  selected: 'Seleccionado',
  flowGPSTitle: 'Sé dónde estoy',
  flowGPSDesc: 'Comparte tu ubicación GPS o escribe una dirección. Obtén una excursión ordenada de más cerca a más lejos.',
  flowDestTitle: 'Tengo un destino',
  flowDestDesc: 'Escribe una ciudad o país. Obtén una ruta en cadena con enlaces a Google Maps.',
  backToTrip: 'Volver al viaje',

  // FlowGPS
  yourLocation: 'Tu ubicación',
  useMyGPS: 'Usar mi GPS',
  detecting: 'Detectando...',
  locationUnavailable: 'Ubicación no disponible — escribe una dirección',
  orEnterAddress: 'O escribe una dirección',
  numberOfStops: 'Número de paradas',
  duration: 'Duración',
  travelStyle: 'Estilo de viaje',
  transport: 'Transporte',
  generateRoadtrip: 'Generar road trip',
  notesOptional: 'Notas (opcional)',
  notesPlaceholder: 'p.ej. viajando con niños, solo comida vegetariana, sin senderismo...',
  destinationPlaceholder: 'p.ej. Toscana, Italia o Kioto, Japón',

  // Dynamic labels
  stopsLabel: (n: number) => `${n} ${n === 1 ? 'parada' : 'paradas'}`,
  dayLabel: (n: number) => n === 1 ? '1 día' : `${n} días`,
  dayRoadtrip: (n: number) => n === 1 ? 'road trip de 1 día' : `road trip de ${n} días`,

  // StopCardGPS
  visited: 'Visitado',
  startingPoint: 'Punto de inicio',
  suggestedTime: 'Tiempo sugerido',
  practicalInfo: 'Info práctica',
  entrance: 'Entrada',
  bestTime: 'Mejor hora',
  navigateHere: 'Navegar aquí',

  // StopCardDest
  routeStart: 'Inicio de ruta',
  routeEnd: 'Fin de ruta',
  entranceFee: 'Precio entrada',

  // ResultsScreen
  allVisited: 'Todas las paradas visitadas ✓',
  visitedProgress: (n: number, total: number) => `${n} de ${total} visitadas`,
  stopsRemaining: (n: number) => `${n} ${n === 1 ? 'parada' : 'paradas'} restante${n === 1 ? '' : 's'}`,
  dayHeader: (n: number) => `Día ${n}`,

  // FilterBar / AlertDialog
  reshuffle: 'Regenerar',
  filters: 'Filtros',
  newTrip: 'Nuevo viaje',
  newTripTitle: '¿Iniciar un nuevo viaje?',
  newTripDesc: 'Tu viaje actual se borrará de la pantalla. No te preocupes — está guardado en tu historial y puedes cargarlo en cualquier momento.',
  cancel: 'Cancelar',
  startNewTrip: 'Iniciar nuevo viaje',

  // ActionBar
  openGoogleMaps: 'Abrir ruta completa en Google Maps',
  openOSM: 'Abrir en OpenStreetMap',
  copy: 'Copiar',
  dayRoute: (label: string) => `Ruta ${label}`,

  // HistoryDrawer
  searchHistory: 'Historial de búsqueda',
  noTripsYet: 'Sin viajes aún',
  noTripsDesc: 'Tus viajes generados aparecerán aquí',
  stopsAndDays: (stops: number, days: number) => `${stops} paradas · ${days} días`,
  gpsTrip: 'Viaje GPS',
  destinationTrip: 'Viaje a destino',
  load: 'Cargar',
  clearAll: 'Borrar todo',

  // Loading messages
  loadingMessages: [
    'Encontrando los mejores destinos...',
    'Buscando lugares reales...',
    'Generando descripciones...',
    'Ordenando por distancia...',
    'Construyendo tu ruta...',
    'Casi listo...',
  ],

  // Travel styles
  travelStyles: {
    culture: 'Cultura & historia',
    nature: 'Naturaleza',
    food: 'Gastronomía',
    adventure: 'Aventura',
    beaches: 'Playas',
    architecture: 'Arquitectura',
    hidden: 'Joyas ocultas',
  } as Record<TravelStyle, string>,

  // Transport modes
  transportModes: {
    car: 'Coche',
    motorcycle: 'Moto',
    mixed: 'Mixto',
  } as Record<Transport, string>,

  // bestTime translation map
  bestTimeLabels: { Morning: 'Mañana', Afternoon: 'Tarde', 'Full day': 'Día completo' } as Record<string, string>,
  entranceFeeLabels: { Free: 'Gratis', Varies: 'Varía' } as Record<string, string>,
  typeLabels: {
    Cathedral: 'Catedral', Museum: 'Museo', Beach: 'Playa', Park: 'Parque',
    Garden: 'Jardín', Plaza: 'Plaza', Square: 'Plaza', Village: 'Pueblo',
    City: 'Ciudad', Market: 'Mercado', Palace: 'Palacio', Castle: 'Castillo',
    Church: 'Iglesia', Monument: 'Monumento', Viewpoint: 'Mirador',
    Bridge: 'Puente', Tower: 'Torre', Ruins: 'Ruinas', Harbor: 'Puerto',
    Valley: 'Valle', Lake: 'Lago', Waterfall: 'Cascada', Forest: 'Bosque',
    Mountain: 'Montaña', 'Hill Town': 'Pueblo de montaña', 'Nature Reserve': 'Reserva Natural',
    'Old Town': 'Casco Antiguo', 'Historic Site': 'Sitio Histórico', Neighborhood: 'Barrio',
  } as Record<string, string>,

  // Groq prompt language instruction
  groqLang: 'Spanish',
}

export const translations: Record<Lang, typeof en> = { en, es }
export type T = typeof en
