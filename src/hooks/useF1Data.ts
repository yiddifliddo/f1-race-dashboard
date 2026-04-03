import { useState, useEffect, useCallback, useRef } from 'react'
import { api } from '../services/api'
import type {
  Driver, Position, Interval, Lap, PitStop, Stint,
  RaceControlMessage, Weather, Session, Meeting, TeamRadio, Location,
  DriverTiming, IncidentSummary,
} from '../types/f1'

const POLL_INTERVAL = 5000 // 5 seconds

export interface F1DashboardData {
  session: Session | null
  meeting: Meeting | null
  drivers: Driver[]
  timings: DriverTiming[]
  raceControl: RaceControlMessage[]
  weather: Weather | null
  teamRadio: TeamRadioEntry[]
  incidents: IncidentSummary
  trackLocations: Map<number, Location>
  currentLap: number
  totalLaps: number
  isLive: boolean
  trackStatus: string
  fastestLapDriver: number | null
  loading: boolean
  error: string | null
}

export interface TeamRadioEntry {
  date: string
  driver_number: number
  recording_url: string
  driver?: Driver
}

export function useF1Data(): F1DashboardData {
  const [session, setSession] = useState<Session | null>(null)
  const [meeting, setMeeting] = useState<Meeting | null>(null)
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [positions, setPositions] = useState<Position[]>([])
  const [intervals, setIntervals] = useState<Interval[]>([])
  const [laps, setLaps] = useState<Lap[]>([])
  const [pitStops, setPitStops] = useState<PitStop[]>([])
  const [stints, setStints] = useState<Stint[]>([])
  const [raceControl, setRaceControl] = useState<RaceControlMessage[]>([])
  const [weather, setWeather] = useState<Weather | null>(null)
  const [teamRadioRaw, setTeamRadioRaw] = useState<TeamRadio[]>([])
  const [locations, setLocations] = useState<Location[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const sessionKeyRef = useRef<string | number>('latest')

  const fetchData = useCallback(async (initial = false) => {
    try {
      if (initial) setLoading(true)

      // Get session info
      const sessions = await api.getLatestSession()
      const currentSession = sessions[0]
      if (!currentSession) {
        setError('No active session found')
        setLoading(false)
        return
      }
      setSession(currentSession)
      sessionKeyRef.current = currentSession.session_key

      const sk = currentSession.session_key

      // Fetch meeting info once
      if (initial && currentSession.meeting_key) {
        const meetings = await api.getMeeting(currentSession.meeting_key)
        if (meetings[0]) setMeeting(meetings[0])
      }

      // Fetch all data in parallel
      const [
        driversData,
        positionsData,
        intervalsData,
        lapsData,
        pitStopsData,
        stintsData,
        raceControlData,
        weatherData,
        teamRadioData,
        locationsData,
      ] = await Promise.all([
        initial ? api.getDrivers(sk) : Promise.resolve(drivers),
        api.getPositions(sk),
        api.getIntervals(sk),
        api.getLaps(sk),
        api.getPitStops(sk),
        api.getStints(sk),
        api.getRaceControl(sk),
        api.getWeather(sk),
        api.getTeamRadio(sk),
        api.getLocations(sk).catch(() => [] as Location[]),
      ])

      if (initial) setDrivers(driversData)
      setPositions(positionsData)
      setIntervals(intervalsData)
      setLaps(lapsData)
      setPitStops(pitStopsData)
      setStints(stintsData)
      setRaceControl(raceControlData)
      if (weatherData.length > 0) setWeather(weatherData[weatherData.length - 1])
      setTeamRadioRaw(teamRadioData)
      setLocations(locationsData)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data')
    } finally {
      setLoading(false)
    }
  }, [drivers])

  useEffect(() => {
    fetchData(true)
    const interval = setInterval(() => fetchData(false), POLL_INTERVAL)
    return () => clearInterval(interval)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Compute latest positions per driver
  const latestPositions = getLatestPerDriver(positions, 'driver_number', 'date')
  const latestIntervals = getLatestPerDriver(intervals, 'driver_number', 'date')

  // Get latest laps per driver
  const latestLaps = new Map<number, Lap>()
  const bestLaps = new Map<number, Lap>()
  for (const lap of laps) {
    const existing = latestLaps.get(lap.driver_number)
    if (!existing || lap.lap_number > existing.lap_number) {
      latestLaps.set(lap.driver_number, lap)
    }
    if (lap.lap_duration != null) {
      const best = bestLaps.get(lap.driver_number)
      if (!best || !best.lap_duration || lap.lap_duration < best.lap_duration) {
        bestLaps.set(lap.driver_number, lap)
      }
    }
  }

  // Get current stint per driver
  const currentStints = new Map<number, Stint>()
  for (const stint of stints) {
    const existing = currentStints.get(stint.driver_number)
    if (!existing || stint.stint_number > existing.stint_number) {
      currentStints.set(stint.driver_number, stint)
    }
  }

  // Get pit stops per driver
  const pitStopsPerDriver = new Map<number, PitStop[]>()
  for (const pit of pitStops) {
    const arr = pitStopsPerDriver.get(pit.driver_number) || []
    arr.push(pit)
    pitStopsPerDriver.set(pit.driver_number, arr)
  }

  // Get stints per driver
  const stintsPerDriver = new Map<number, Stint[]>()
  for (const stint of stints) {
    const arr = stintsPerDriver.get(stint.driver_number) || []
    arr.push(stint)
    stintsPerDriver.set(stint.driver_number, arr)
  }

  // Build timing data
  const timings: DriverTiming[] = drivers
    .map((driver) => {
      const pos = latestPositions.get(driver.driver_number)
      const intv = latestIntervals.get(driver.driver_number)
      return {
        driver,
        position: pos?.position ?? 99,
        gap_to_leader: intv?.gap_to_leader ?? '',
        interval: intv?.interval ?? '',
        last_lap: latestLaps.get(driver.driver_number) ?? null,
        best_lap: bestLaps.get(driver.driver_number) ?? null,
        current_stint: currentStints.get(driver.driver_number) ?? null,
        pit_stops: pitStopsPerDriver.get(driver.driver_number) ?? [],
        stints: stintsPerDriver.get(driver.driver_number) ?? [],
      }
    })
    .sort((a, b) => a.position - b.position)

  // Track locations - latest per driver
  const trackLocations = new Map<number, Location>()
  for (const loc of locations) {
    const existing = trackLocations.get(loc.driver_number)
    if (!existing || loc.date > existing.date) {
      trackLocations.set(loc.driver_number, loc)
    }
  }

  // Current lap & total laps
  const maxLap = laps.reduce((max, l) => Math.max(max, l.lap_number), 0)
  const totalLaps = guessTotalLaps(session)

  // Fastest lap
  let fastestLapDriver: number | null = null
  let fastestTime = Infinity
  bestLaps.forEach((lap, driverNum) => {
    if (lap.lap_duration && lap.lap_duration < fastestTime) {
      fastestTime = lap.lap_duration
      fastestLapDriver = driverNum
    }
  })

  // Track status from race control
  const flagMessages = raceControl.filter((m) => m.category === 'Flag')
  const lastFlag = flagMessages[flagMessages.length - 1]
  const trackStatus = lastFlag?.flag || 'GREEN'

  // Is live?
  const isLive = session
    ? new Date(session.date_end) > new Date() && new Date(session.date_start) <= new Date()
    : false

  // Incidents
  const incidents: IncidentSummary = {
    penalties: raceControl.filter((m) => m.message?.toLowerCase().includes('penalty')).length,
    warnings: raceControl.filter(
      (m) => m.message?.toLowerCase().includes('warning') || m.message?.toLowerCase().includes('noted')
    ).length,
    investigations: raceControl.filter(
      (m) => m.message?.toLowerCase().includes('investigation') || m.message?.toLowerCase().includes('under investigation')
    ).length,
    safety_cars: raceControl.filter((m) => m.category === 'SafetyCar').length,
  }

  // Team radio entries
  const teamRadio: TeamRadioEntry[] = teamRadioRaw
    .slice(-20)
    .reverse()
    .map((r) => ({
      ...r,
      driver: drivers.find((d) => d.driver_number === r.driver_number),
    }))

  return {
    session,
    meeting,
    drivers,
    timings,
    raceControl: [...raceControl].reverse().slice(0, 30),
    weather,
    teamRadio,
    incidents,
    trackLocations,
    currentLap: maxLap,
    totalLaps,
    isLive,
    trackStatus,
    fastestLapDriver,
    loading,
    error,
  }
}

function getLatestPerDriver<T extends { driver_number: number }>(
  items: T[],
  _keyField: string,
  dateField: keyof T
): Map<number, T> {
  const map = new Map<number, T>()
  for (const item of items) {
    const existing = map.get(item.driver_number)
    if (!existing || (item[dateField] as string) > (existing[dateField] as string)) {
      map.set(item.driver_number, item)
    }
  }
  return map
}

function guessTotalLaps(session: Session | null): number {
  // Common race lap counts by circuit
  const lapsByCircuit: Record<string, number> = {
    'Bahrain': 57, 'Jeddah': 50, 'Melbourne': 58, 'Suzuka': 53,
    'Shanghai': 56, 'Miami': 57, 'Imola': 63, 'Monaco': 78,
    'Montreal': 70, 'Barcelona': 66, 'Spielberg': 71, 'Silverstone': 52,
    'Hungaroring': 70, 'Spa-Francorchamps': 44, 'Zandvoort': 72,
    'Monza': 53, 'Baku': 51, 'Singapore': 62, 'Austin': 56,
    'Mexico': 71, 'Interlagos': 71, 'Las Vegas': 50, 'Lusail': 57,
    'Yas Marina': 58,
  }
  if (session) {
    for (const [circuit, totalLaps] of Object.entries(lapsByCircuit)) {
      if (session.circuit_short_name?.includes(circuit)) return totalLaps
    }
  }
  return 0
}
