import type {
  Driver, Position, Interval, Lap, PitStop, Stint,
  RaceControlMessage, Location, Weather, Session, Meeting,
  TeamRadio,
} from '../types/f1'

const BASE_URL = 'https://api.openf1.org/v1'

// Simple in-memory cache to reduce API calls
const cache = new Map<string, { data: unknown; timestamp: number }>()
const CACHE_TTL = 15000 // 15 seconds

async function fetchAPI<T>(endpoint: string, params: Record<string, string | number> = {}): Promise<T> {
  const url = new URL(`${BASE_URL}/${endpoint}`)
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.set(key, String(value))
  })

  const cacheKey = url.toString()
  const cached = cache.get(cacheKey)
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data as T
  }

  const response = await fetch(url.toString())

  // Return empty array for missing data (404, 422, etc)
  if (response.status === 404 || response.status === 422) {
    const empty = [] as unknown as T
    cache.set(cacheKey, { data: empty, timestamp: Date.now() })
    return empty
  }

  // On rate limit, DON'T retry - just return cached or empty
  if (response.status === 429) {
    if (cached) return cached.data as T
    throw new Error(`API error: ${response.status} Too Many Requests`)
  }

  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`)
  }

  const data = await response.json()
  cache.set(cacheKey, { data, timestamp: Date.now() })
  return data
}

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms))
}

// Safe wrapper - returns empty array on any error
async function safeFetch<T>(endpoint: string, params: Record<string, string | number> = {}): Promise<T> {
  try {
    return await fetchAPI<T>(endpoint, params)
  } catch {
    return [] as unknown as T
  }
}

export const api = {
  // Sessions - this one must succeed, so use fetchAPI
  getLatestSession: () => fetchAPI<Session[]>('sessions', { session_key: 'latest' }),
  getMeeting: (meetingKey: number) => safeFetch<Meeting[]>('meetings', { meeting_key: meetingKey }),

  // Everything else uses safeFetch - returns [] on failure
  getDrivers: (sk: string | number) => safeFetch<Driver[]>('drivers', { session_key: sk }),
  getPositions: (sk: string | number) => safeFetch<Position[]>('position', { session_key: sk }),
  getIntervals: (sk: string | number) => safeFetch<Interval[]>('intervals', { session_key: sk }),
  getLaps: (sk: string | number) => safeFetch<Lap[]>('laps', { session_key: sk }),
  getPitStops: (sk: string | number) => safeFetch<PitStop[]>('pit', { session_key: sk }),
  getStints: (sk: string | number) => safeFetch<Stint[]>('stints', { session_key: sk }),
  getRaceControl: (sk: string | number) => safeFetch<RaceControlMessage[]>('race_control', { session_key: sk }),
  getLocations: (sk: string | number) => safeFetch<Location[]>('location', { session_key: sk }),
  getWeather: (sk: string | number) => safeFetch<Weather[]>('weather', { session_key: sk }),
  getTeamRadio: (sk: string | number) => safeFetch<TeamRadio[]>('team_radio', { session_key: sk }),

  delay,
}
