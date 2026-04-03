import type { DriverTiming } from '../types/f1'
import { TyreIndicator } from './TyreIndicator'
import { SectorSegments } from './SectorSegments'

interface LiveTimingProps {
  timings: DriverTiming[]
  fastestLapDriver: number | null
  currentLap: number
}

export function LiveTiming({ timings, fastestLapDriver, currentLap }: LiveTimingProps) {
  // Find overall fastest lap time
  let overallFastestTime = Infinity
  let overallFastestAcronym = ''
  for (const t of timings) {
    if (t.best_lap?.lap_duration && t.best_lap.lap_duration < overallFastestTime) {
      overallFastestTime = t.best_lap.lap_duration
      overallFastestAcronym = t.driver.name_acronym
    }
  }

  return (
    <div className="bg-f1-panel border-l border-f1-border flex flex-col h-full w-[420px] shrink-0">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-f1-border">
        <div className="flex items-center gap-2">
          <span className="text-f1-accent text-xs font-bold">&#9654;</span>
          <span className="text-xs font-bold uppercase tracking-wider text-white">Live Timing</span>
        </div>
        <span className="px-2 py-0.5 bg-f1-panel-light rounded text-[10px] text-f1-text-dim border border-f1-border">
          {timings.length} drivers
        </span>
      </div>

      {/* Fastest lap indicator */}
      {overallFastestAcronym && (
        <div className="flex items-center gap-2 px-3 py-1 border-b border-f1-border text-[10px]">
          <span className="text-f1-purple font-bold">&#9201; FASTEST LAP</span>
          <span className="text-white font-mono font-bold">{overallFastestAcronym}</span>
          <span className="text-f1-purple font-mono">{formatTime(overallFastestTime)}</span>
        </div>
      )}

      {/* Column headers */}
      <div className="grid grid-cols-[28px_1fr_60px_60px_100px_70px] gap-0 px-2 py-1 border-b border-f1-border text-[9px] text-f1-text-muted uppercase tracking-wider">
        <span></span>
        <span>Driver</span>
        <span className="text-right">Gap</span>
        <span className="text-right">Int</span>
        <span className="text-center">Sectors</span>
        <span className="text-right">Lap</span>
      </div>

      {/* Driver rows */}
      <div className="flex-1 overflow-y-auto">
        {timings.map((timing, index) => (
          <DriverRow
            key={timing.driver.driver_number}
            timing={timing}
            index={index}
            isFastestLap={timing.driver.driver_number === fastestLapDriver}
            currentLap={currentLap}
          />
        ))}
      </div>
    </div>
  )
}

function DriverRow({
  timing,
  index,
  isFastestLap,
  currentLap,
}: {
  timing: DriverTiming
  index: number
  isFastestLap: boolean
  currentLap: number
}) {
  const { driver, position, gap_to_leader, interval, last_lap, current_stint } = timing
  const teamColor = `#${driver.team_colour || '666666'}`

  // Determine position change indicator
  const isLeader = index === 0

  // Format gap
  const gapStr = isLeader ? '' : formatGap(gap_to_leader)
  const intStr = isLeader ? '' : formatGap(interval)

  // Last lap time
  const lapTime = last_lap?.lap_duration ? formatTime(last_lap.lap_duration) : ''

  // Stint info for tyre badge
  const tyreAge = current_stint
    ? (current_stint.lap_end || currentLap) - current_stint.lap_start + 1
    : 0

  return (
    <div
      className={`grid grid-cols-[28px_1fr_60px_60px_100px_70px] gap-0 px-2 py-1 items-center border-b border-f1-border/50 hover:bg-f1-panel-light/50 transition-colors ${
        isLeader ? 'bg-f1-accent/10' : ''
      }`}
    >
      {/* Position */}
      <div className="flex items-center">
        <span
          className="w-6 h-6 flex items-center justify-center text-[11px] font-bold rounded-sm text-white"
          style={{ backgroundColor: isLeader ? teamColor : 'transparent', borderLeft: `3px solid ${teamColor}` }}
        >
          {position}
        </span>
      </div>

      {/* Driver info */}
      <div className="flex items-center gap-1.5 min-w-0">
        <div className="min-w-0">
          <div className="flex items-center gap-1">
            <span className="text-[11px] font-bold text-white">{driver.name_acronym}</span>
            <span className="text-[9px] text-f1-text-muted font-mono">#{driver.driver_number}</span>
            {isFastestLap && (
              <span className="text-[8px] text-f1-purple font-bold px-1 bg-f1-purple/20 rounded">FL</span>
            )}
          </div>
          <div className="text-[9px] text-f1-text-muted truncate">{driver.full_name}</div>
        </div>
        {/* Tyre indicator */}
        {current_stint && (
          <TyreIndicator compound={current_stint.compound} age={tyreAge} />
        )}
      </div>

      {/* Gap to leader */}
      <div className="text-right">
        <span className="text-[10px] font-mono text-f1-text-dim">
          {gapStr && `+${gapStr}`}
        </span>
      </div>

      {/* Interval */}
      <div className="text-right">
        <span className="text-[10px] font-mono text-f1-text-dim">
          {intStr && (typeof interval === 'string' && interval === 'LAP' ? 'LAP' : `+${intStr}`)}
        </span>
      </div>

      {/* Sector segments */}
      <div className="flex items-center justify-center gap-0.5">
        <SectorSegments segments={last_lap?.segments_sector_1} />
        <SectorSegments segments={last_lap?.segments_sector_2} />
        <SectorSegments segments={last_lap?.segments_sector_3} />
      </div>

      {/* Lap time */}
      <div className="text-right">
        <span className={`text-[10px] font-mono font-medium ${isFastestLap ? 'text-f1-purple' : 'text-white'}`}>
          {lapTime}
        </span>
      </div>
    </div>
  )
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toFixed(3).padStart(6, '0')}`
}

function formatGap(gap: string | number): string {
  if (typeof gap === 'string') return gap
  if (typeof gap === 'number') return gap.toFixed(3)
  return ''
}
