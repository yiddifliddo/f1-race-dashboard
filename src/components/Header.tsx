import type { Session, Meeting, Weather } from '../types/f1'

interface HeaderProps {
  session: Session | null
  meeting: Meeting | null
  weather: Weather | null
  trackStatus: string
  isLive: boolean
  currentLap: number
  totalLaps: number
}

export function Header({
  session,
  meeting,
  weather,
  trackStatus,
  isLive,
  currentLap,
  totalLaps,
}: HeaderProps) {
  const flagColor = getFlagColor(trackStatus)

  const raceTitle = meeting?.meeting_official_name || meeting?.meeting_name || session?.circuit_short_name || 'F1 Live Dashboard'

  return (
    <div className="bg-f1-panel border-b border-f1-border px-4 py-2 shrink-0">
      {/* Top row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Session indicator */}
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-f1-red animate-pulse-glow" />
            <div className="text-[10px] text-f1-text-muted">
              <span className="font-bold text-white">{session?.year || '2026'}</span>
              <div className="text-f1-text-muted">{session?.session_name || 'Race'}</div>
            </div>
          </div>

          {/* Race title */}
          <h1 className="text-sm md:text-lg font-black tracking-wide uppercase text-white">
            {raceTitle}
          </h1>
        </div>

        {/* Race Progress */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-f1-text-muted uppercase tracking-wider">Delay</span>
            <button className="px-2 py-0.5 text-[10px] bg-f1-panel-light border border-f1-border rounded text-f1-text-dim">
              0ms
            </button>
          </div>
          <div className="bg-f1-panel-light border border-f1-border rounded-md px-3 py-1 flex items-center gap-2">
            <span className="text-[10px] text-f1-text-muted uppercase tracking-wider">Race Progress</span>
            <span className="font-mono text-sm font-bold text-white">
              {currentLap} <span className="text-f1-text-muted">/</span> {totalLaps || '??'}
            </span>
          </div>
        </div>
      </div>

      {/* Status badges & Weather row */}
      <div className="flex items-center justify-between mt-2">
        <div className="flex items-center gap-2">
          {/* Flag status */}
          <span
            className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider"
            style={{ backgroundColor: flagColor, color: flagColor === '#ffd700' ? '#000' : '#fff' }}
          >
            {trackStatus || 'GREEN'}
          </span>
          {/* Live badge */}
          {isLive ? (
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-f1-red text-white uppercase tracking-wider flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse-glow" />
              Live
            </span>
          ) : (
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-f1-text-muted text-white uppercase tracking-wider">
              Replay
            </span>
          )}
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-f1-panel-light text-f1-text-dim border border-f1-border uppercase tracking-wider">
            Muted
          </span>
        </div>

        {/* Weather */}
        {weather && (
          <div className="flex items-center gap-4 text-[11px]">
            <WeatherStat label="Air" value={`${weather.air_temperature.toFixed(1)}°C`} />
            <WeatherStat label="Track" value={`${weather.track_temperature.toFixed(1)}°C`} />
            <WeatherStat label="Humidity" value={`${weather.humidity.toFixed(0)}%`} />
            <WeatherStat label="Wind" value={`${weather.wind_speed.toFixed(1)} km/h`} />
            <WeatherStat label="Rain" value={weather.rainfall ? 'Yes' : 'No'} />
          </div>
        )}
      </div>
    </div>
  )
}

function WeatherStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col items-center">
      <span className="text-f1-text-muted text-[9px] uppercase tracking-wider">{label}</span>
      <span className="font-medium text-white">{value}</span>
    </div>
  )
}

function getFlagColor(flag: string): string {
  switch (flag?.toUpperCase()) {
    case 'GREEN': return '#00d200'
    case 'YELLOW': case 'DOUBLE YELLOW': return '#ffd700'
    case 'RED': return '#e10600'
    case 'CHEQUERED': return '#888888'
    default: return '#00d200'
  }
}
