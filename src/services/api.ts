import type {
  Driver, Position, Interval, Lap, PitStop, Stint,
  RaceControlMessage, Location, Weather, Session, Meeting,
  TeamRadio,
} from '../types/f1'

const BASE_URL = 'https://api.openf1.org/v1'

// Simple in-memory cache to reduce API calls
const cache = new Map<string, { data: unknown; timestamp: number }>()
const CACHE_TTL = 8000 // 8 seconds

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

  // Handle rate limiting - wait and retry once
  if (response.status === 429) {
    await new Promise((r) => setTimeout(r, 3000))
    const retry = await fetch(url.toString())
    if (!retry.ok) {
      throw new Error(`API error: ${retry.status} ${retry.statusText}`)
    }
    const data = await retry.json()
    cache.set(cacheKey, { data, timestamp: Date.now() })
    return data
  }

  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`)
  }

  const data = await response.json()
  cache.set(cacheKey, { data, timestamp: Date.now() })
  return data
}

// Stagger requests to avoid hitting rate limits
function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms))
}

export const api = {
  // Sessions & Meetings
  getLatestSession: () => fetchAPI<Session[]>('sessions', { session_key: 'latest' }),
  getSessions: (year?: number) => fetchAPI<Session[]>('sessions', year ? { year } : {}),
  getMeetings: (year?: number) => fetchAPI<Meeting[]>('meetings', year ? { year } : {}),
  getMeeting: (meetingKey: number) => fetchAPI<Meeting[]>('meetings', { meeting_key: meetingKey }),

  // Drivers
  getDrivers: (sessionKey: string | number) =>
    fetchAPI<Driver[]>('drivers', { session_key: sessionKey }),

  // Positions
  getPositions: (sessionKey: string | number) =>
    fetchAPI<Position[]>('position', { session_key: sessionKey }),

  // Intervals
  getIntervals: (sessionKey: string | number) =>
    fetchAPI<Interval[]>('intervals', { session_key: sessionKey }),

  // Laps
  getLaps: (sessionKey: string | number, driverNumber?: number) => {
    const params: Record<string, string | number> = { session_key: sessionKey }
    if (driverNumber) params.driver_number = driverNumber
    return fetchAPI<Lap[]>('laps', params)
  },

  // Pit Stops
  getPitStops: (sessionKey: string | number) =>
    fetchAPI<PitStop[]>('pit', { session_key: sessionKey }),

  // Stints
  getStints: (sessionKey: string | number) =>
    fetchAPI<Stint[]>('stints', { session_key: sessionKey }),

  // Race Control
  getRaceControl: (sessionKey: string | number) =>
    fetchAPI<RaceControlMessage[]>('race_control', { session_key: sessionKey }),

  // Locations (car positions on track)
  getLocations: (sessionKey: string | number) =>
    fetchAPI<Location[]>('location', { session_key: sessionKey }),

  // Weather
  getWeather: (sessionKey: string | number) =>
    fetchAPI<Weather[]>('weather', { session_key: sessionKey }),

  // Team Radio
  getTeamRadio: (sessionKey: string | number) =>
    fetchAPI<TeamRadio[]>('team_radio', { session_key: sessionKey }),

  delay,
}
