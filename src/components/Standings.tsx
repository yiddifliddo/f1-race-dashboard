import type { DriverTiming } from '../types/f1'

interface StandingsProps {
  timings: DriverTiming[]
}

// Projected points based on position
const POINTS = [25, 18, 15, 12, 10, 8, 6, 4, 2, 1]

export function DriverStandings({ timings }: StandingsProps) {
  const standings = timings.map((t, i) => ({
    acronym: t.driver.name_acronym,
    points: POINTS[i] || 0,
    position: i + 1,
    teamColor: `#${t.driver.team_colour || '666'}`,
  }))

  return (
    <div className="bg-f1-panel border border-f1-border rounded-lg flex flex-col">
      <div className="flex items-center justify-between px-3 py-2 border-b border-f1-border">
        <div className="flex items-center gap-2">
          <span className="text-xs text-f1-text-muted">&#127942;</span>
          <span className="text-xs font-bold uppercase tracking-wider text-white">Driver Standings</span>
        </div>
      </div>

      <div className="overflow-y-auto max-h-[220px]">
        <table className="w-full text-[11px]">
          <thead>
            <tr className="text-f1-text-muted text-[9px] uppercase tracking-wider">
              <th className="text-left px-3 py-1 font-medium">P</th>
              <th className="text-left px-2 py-1 font-medium">Driver</th>
              <th className="text-right px-3 py-1 font-medium">Pts</th>
              <th className="text-right px-3 py-1 font-medium">+/-</th>
            </tr>
          </thead>
          <tbody>
            {standings.map((s) => (
              <tr key={s.acronym} className="border-t border-f1-border/30 hover:bg-f1-panel-light/50">
                <td className="px-3 py-1 font-mono font-bold text-f1-text-dim">{s.position}</td>
                <td className="px-2 py-1">
                  <div className="flex items-center gap-1.5">
                    <span className="w-0.5 h-3 rounded-full" style={{ backgroundColor: s.teamColor }} />
                    <span className="font-semibold text-white">{s.acronym}</span>
                  </div>
                </td>
                <td className="px-3 py-1 text-right font-mono font-bold text-white">{s.points}</td>
                <td className="px-3 py-1 text-right font-mono text-f1-green text-[10px]">
                  {s.points > 0 ? `+${s.points}` : ''}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="px-3 py-1 border-t border-f1-border">
        <span className="text-[9px] text-f1-text-muted italic">* Projected standings</span>
      </div>
    </div>
  )
}

export function ConstructorStandings({ timings }: StandingsProps) {
  // Aggregate points by team
  const teamPoints = new Map<string, { team: string; color: string; points: number }>()

  timings.forEach((t, i) => {
    const team = t.driver.team_name
    const existing = teamPoints.get(team) || { team, color: `#${t.driver.team_colour || '666'}`, points: 0 }
    existing.points += POINTS[i] || 0
    teamPoints.set(team, existing)
  })

  const sorted = [...teamPoints.values()].sort((a, b) => b.points - a.points)

  return (
    <div className="bg-f1-panel border border-f1-border rounded-lg flex flex-col">
      <div className="flex items-center justify-between px-3 py-2 border-b border-f1-border">
        <div className="flex items-center gap-2">
          <span className="text-xs text-f1-text-muted">&#127942;</span>
          <span className="text-xs font-bold uppercase tracking-wider text-white">Constructor Standings</span>
        </div>
      </div>

      <div className="overflow-y-auto max-h-[220px]">
        <table className="w-full text-[11px]">
          <thead>
            <tr className="text-f1-text-muted text-[9px] uppercase tracking-wider">
              <th className="text-left px-3 py-1 font-medium">P</th>
              <th className="text-left px-2 py-1 font-medium">Team</th>
              <th className="text-right px-3 py-1 font-medium">Pts</th>
              <th className="text-right px-3 py-1 font-medium">+/-</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((team, i) => (
              <tr key={team.team} className="border-t border-f1-border/30 hover:bg-f1-panel-light/50">
                <td className="px-3 py-1 font-mono font-bold text-f1-text-dim">{i + 1}</td>
                <td className="px-2 py-1">
                  <div className="flex items-center gap-1.5">
                    <span className="w-0.5 h-3 rounded-full" style={{ backgroundColor: team.color }} />
                    <span className="font-semibold text-white truncate">{team.team}</span>
                  </div>
                </td>
                <td className="px-3 py-1 text-right font-mono font-bold text-white">{team.points}</td>
                <td className="px-3 py-1 text-right font-mono text-f1-green text-[10px]">
                  {team.points > 0 ? `+${team.points}` : ''}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="px-3 py-1 border-t border-f1-border">
        <span className="text-[9px] text-f1-text-muted italic">* Projected standings</span>
      </div>
    </div>
  )
}
