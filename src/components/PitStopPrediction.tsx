import { useMemo } from 'react'
import type { DriverTiming } from '../types/f1'
import { TyreIndicator } from './TyreIndicator'

interface PitStopPredictionProps {
  timings: DriverTiming[]
  currentLap: number
  totalLaps: number
}

// Average stint lengths by compound
const AVG_STINT: Record<string, number> = {
  SOFT: 18,
  MEDIUM: 28,
  HARD: 38,
  INTERMEDIATE: 25,
  WET: 20,
}

interface Prediction {
  driver: DriverTiming
  predictedLap: number | null
  lapsRemaining: number | null
  urgency: 'high' | 'medium' | 'low'
  reason: string
}

export function PitStopPrediction({ timings, currentLap, totalLaps }: PitStopPredictionProps) {
  const predictions = useMemo(() => {
    return timings
      .map((t): Prediction => {
        const stint = t.current_stint
        if (!stint) {
          return {
            driver: t,
            predictedLap: null,
            lapsRemaining: null,
            urgency: 'low',
            reason: 'No stint data',
          }
        }

        const stintLength = (stint.lap_end || currentLap) - stint.lap_start + 1
        const avgLife = AVG_STINT[stint.compound] || 25
        const degradationPct = (stintLength / avgLife) * 100
        const predictedPitLap = stint.lap_start + avgLife
        const lapsUntilPit = predictedPitLap - currentLap

        let urgency: 'high' | 'medium' | 'low' = 'low'
        let reason = `${stint.compound} stint, lap ${stintLength}/${avgLife}`

        if (lapsUntilPit <= 0) {
          urgency = 'high'
          reason = `Overdue! ${stintLength} laps on ${stint.compound}`
        } else if (lapsUntilPit <= 3) {
          urgency = 'high'
          reason = `Pit window OPEN - ${lapsUntilPit} laps remaining`
        } else if (degradationPct > 70) {
          urgency = 'medium'
          reason = `Tyres degrading - ${lapsUntilPit} laps to window`
        }

        // Check if this is the last stint (might go to end)
        const raceLapsRemaining = totalLaps - currentLap
        if (raceLapsRemaining <= lapsUntilPit && t.stints.length >= 2) {
          urgency = 'low'
          reason = `Final stint - ${raceLapsRemaining} laps to finish`
        }

        return {
          driver: t,
          predictedLap: predictedPitLap,
          lapsRemaining: Math.max(0, lapsUntilPit),
          urgency,
          reason,
        }
      })
      .filter((p) => p.urgency !== 'low' || p.predictedLap !== null)
      .sort((a, b) => {
        const urgencyOrder = { high: 0, medium: 1, low: 2 }
        if (urgencyOrder[a.urgency] !== urgencyOrder[b.urgency]) {
          return urgencyOrder[a.urgency] - urgencyOrder[b.urgency]
        }
        return (a.lapsRemaining ?? 99) - (b.lapsRemaining ?? 99)
      })
  }, [timings, currentLap, totalLaps])

  return (
    <div className="bg-f1-panel border border-f1-border rounded-lg flex flex-col">
      <div className="flex items-center justify-between px-3 py-2 border-b border-f1-border">
        <div className="flex items-center gap-2">
          <span className="text-xs text-f1-text-muted">&#9881;</span>
          <span className="text-xs font-bold uppercase tracking-wider text-white">Pit Stop Prediction</span>
        </div>
        <span className="text-[9px] text-f1-text-muted">Lap {currentLap}/{totalLaps || '??'}</span>
      </div>

      <div className="overflow-y-auto max-h-[200px] p-2 space-y-1">
        {predictions.slice(0, 10).map((pred) => {
          const teamColor = `#${pred.driver.driver.team_colour || '666'}`
          const urgencyColor = pred.urgency === 'high' ? '#e10600' : pred.urgency === 'medium' ? '#ffd700' : '#555'

          return (
            <div
              key={pred.driver.driver.driver_number}
              className="flex items-center gap-2 px-2 py-1.5 rounded bg-f1-panel-light/50 border-l-2"
              style={{ borderLeftColor: urgencyColor }}
            >
              {/* Driver */}
              <span
                className="text-[10px] font-bold px-1 py-0.5 rounded shrink-0"
                style={{ backgroundColor: teamColor, color: '#fff' }}
              >
                {pred.driver.driver.name_acronym}
              </span>

              {/* Tyre */}
              {pred.driver.current_stint && (
                <TyreIndicator compound={pred.driver.current_stint.compound} />
              )}

              {/* Prediction info */}
              <div className="flex-1 min-w-0">
                <p className="text-[9px] text-f1-text-dim truncate">{pred.reason}</p>
              </div>

              {/* Predicted lap */}
              {pred.predictedLap && (
                <span className="text-[10px] font-mono font-bold shrink-0" style={{ color: urgencyColor }}>
                  L{pred.predictedLap}
                </span>
              )}
            </div>
          )
        })}
        {predictions.length === 0 && (
          <p className="text-[11px] text-f1-text-muted text-center py-4">
            No pit predictions available
          </p>
        )}
      </div>
    </div>
  )
}
