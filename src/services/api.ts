import type {
  Driver, Position, Interval, Lap, PitStop, Stint,
  RaceControlMessage, Location, Weather, Session, Meeting,
  TeamRadio,
} from '../types/f1'

const BASE_URL = 'https://api.openf1.org/v1'

async function fetchAPI<T>(endpoint: string, params: Record<string, string | number> = {}): Promise<T> {
  const url = new URL(`${BASE_URL}/${endpoint}`)
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.set(key, String(value))
  })

  const response = await fetch(url.toString())
  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`)
  }
  return response.json()
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

  getLatestLocations: (sessionKey: string | number) => {
    // Get the latest position for all drivers
    const now = new Date()
    const fiveSecsAgo = new Date(now.getTime() - 5000).toISOString()
    return fetchAPI<Location[]>('location', {
      session_key: sessionKey,
      'date>': fiveSecsAgo,
    })
  },

  // Weather
  getWeather: (sessionKey: string | number) =>
    fetchAPI<Weather[]>('weather', { session_key: sessionKey }),

  // Team Radio
  getTeamRadio: (sessionKey: string | number) =>
    fetchAPI<TeamRadio[]>('team_radio', { session_key: sessionKey }),
}
