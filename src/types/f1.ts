export interface Driver {
  driver_number: number
  broadcast_name: string
  full_name: string
  name_acronym: string
  team_name: string
  team_colour: string
  first_name: string
  last_name: string
  headshot_url: string | null
  country_code: string
  session_key: number
  meeting_key: number
}

export interface Position {
  driver_number: number
  position: number
  date: string
  session_key: number
  meeting_key: number
}

export interface Interval {
  driver_number: number
  gap_to_leader: number | string
  interval: number | string
  date: string
  session_key: number
  meeting_key: number
}

export interface Lap {
  driver_number: number
  lap_number: number
  lap_duration: number | null
  duration_sector_1: number | null
  duration_sector_2: number | null
  duration_sector_3: number | null
  segments_sector_1: number[] | null
  segments_sector_2: number[] | null
  segments_sector_3: number[] | null
  i1_speed: number | null
  i2_speed: number | null
  st_speed: number | null
  is_pit_out_lap: boolean
  date_start: string
  session_key: number
  meeting_key: number
}

export interface PitStop {
  driver_number: number
  lap_number: number
  pit_duration: number
  date: string
  session_key: number
  meeting_key: number
}

export interface Stint {
  driver_number: number
  stint_number: number
  compound: 'SOFT' | 'MEDIUM' | 'HARD' | 'INTERMEDIATE' | 'WET'
  tyre_set_number: number | null
  lap_start: number
  lap_end: number | null
  session_key: number
  meeting_key: number
}

export interface RaceControlMessage {
  date: string
  category: string
  flag: string | null
  message: string
  scope: string | null
  sector: number | null
  driver_number: number | null
  lap_number: number | null
  session_key: number
  meeting_key: number
}

export interface Location {
  driver_number: number
  x: number
  y: number
  z: number
  date: string
  session_key: number
  meeting_key: number
}

export interface Weather {
  air_temperature: number
  track_temperature: number
  humidity: number
  pressure: number
  rainfall: number
  wind_direction: number
  wind_speed: number
  date: string
  session_key: number
  meeting_key: number
}

export interface Session {
  session_key: number
  session_name: string
  session_type: string
  date_start: string
  date_end: string
  circuit_key: number
  circuit_short_name: string
  country_name: string
  country_code: string
  location: string
  meeting_key: number
  year: number
  gmt_offset: string
}

export interface Meeting {
  meeting_key: number
  meeting_name: string
  meeting_official_name: string
  circuit_short_name: string
  country_name: string
  country_code: string
  location: string
  date_start: string
  year: number
  gmt_offset: string
  circuit_key: number
}

export interface TeamRadio {
  date: string
  driver_number: number
  recording_url: string
  session_key: number
  meeting_key: number
}

export interface CarData {
  driver_number: number
  speed: number
  rpm: number
  n_gear: number
  throttle: number
  brake: number
  drs: number
  date: string
  session_key: number
  meeting_key: number
}

// Aggregated types for the dashboard
export interface DriverTiming {
  driver: Driver
  position: number
  gap_to_leader: string | number
  interval: string | number
  last_lap: Lap | null
  best_lap: Lap | null
  current_stint: Stint | null
  pit_stops: PitStop[]
  stints: Stint[]
}

export interface IncidentSummary {
  penalties: number
  warnings: number
  investigations: number
  safety_cars: number
}
