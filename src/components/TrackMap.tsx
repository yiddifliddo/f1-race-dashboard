import { useMemo } from 'react'
import type { Location, Driver } from '../types/f1'

interface TrackMapProps {
  locations: Map<number, Location>
  drivers: Driver[]
}

export function TrackMap({ locations, drivers }: TrackMapProps) {
  // Build driver lookup
  const driverMap = useMemo(() => {
    const map = new Map<number, Driver>()
    drivers.forEach((d) => map.set(d.driver_number, d))
    return map
  }, [drivers])

  // Compute bounds for scaling
  const points = Array.from(locations.values())

  const { minX, minY, rangeX, rangeY } = useMemo(() => {
    if (points.length === 0) return { minX: 0, minY: 0, rangeX: 1, rangeY: 1 }
    const xs = points.map((p) => p.x)
    const ys = points.map((p) => p.y)
    const mx = Math.min(...xs)
    const my = Math.min(...ys)
    const rx = Math.max(...xs) - mx || 1
    const ry = Math.max(...ys) - my || 1
    return { minX: mx, minY: my, rangeX: rx, rangeY: ry }
  }, [points])

  const svgWidth = 600
  const svgHeight = 350
  const padding = 40

  function scaleX(x: number) {
    return padding + ((x - minX) / rangeX) * (svgWidth - 2 * padding)
  }

  function scaleY(y: number) {
    return padding + ((y - minY) / rangeY) * (svgHeight - 2 * padding)
  }

  return (
    <div className="bg-f1-panel border border-f1-border rounded-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-f1-border">
        <div className="flex items-center gap-2">
          <span className="text-xs text-f1-text-muted">&#9873;</span>
          <span className="text-xs font-bold text-white">3D</span>
          <span className="text-xs text-f1-text-dim ml-2">Expand</span>
        </div>
      </div>

      {/* Track SVG */}
      <div className="relative">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-auto"
          style={{ minHeight: '280px' }}
        >
          {/* Track path - connect all points with a smooth line */}
          {points.length > 2 && (
            <path
              d={buildTrackPath(points, scaleX, scaleY)}
              fill="none"
              stroke="#333"
              strokeWidth="8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* DRS zones placeholder markers */}
          {points.length > 2 && (
            <path
              d={buildTrackPath(points, scaleX, scaleY)}
              fill="none"
              stroke="#00d200"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="4 12"
              opacity="0.4"
            />
          )}

          {/* Driver dots */}
          {Array.from(locations.entries()).map(([driverNum, loc]) => {
            const driver = driverMap.get(driverNum)
            if (!driver) return null
            const cx = scaleX(loc.x)
            const cy = scaleY(loc.y)
            const color = `#${driver.team_colour || '888888'}`

            return (
              <g key={driverNum}>
                {/* Glow effect */}
                <circle cx={cx} cy={cy} r="8" fill={color} opacity="0.2" />
                {/* Driver dot */}
                <circle cx={cx} cy={cy} r="5" fill={color} stroke="#000" strokeWidth="1" />
                {/* Driver number label */}
                <text
                  x={cx}
                  y={cy - 9}
                  textAnchor="middle"
                  fill="#fff"
                  fontSize="7"
                  fontWeight="bold"
                  fontFamily="Inter"
                >
                  {driverNum}
                </text>
              </g>
            )
          })}

          {/* "No live session" fallback */}
          {points.length === 0 && (
            <text
              x={svgWidth / 2}
              y={svgHeight / 2}
              textAnchor="middle"
              fill="#555"
              fontSize="14"
              fontFamily="Inter"
            >
              No live session
            </text>
          )}
        </svg>

        {/* Legend */}
        {points.length > 0 && (
          <div className="absolute bottom-2 right-2 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-f1-red" />
            <span className="w-2 h-2 rounded-full bg-f1-blue" />
            <span className="w-2 h-2 rounded-full bg-f1-green" />
            <span className="text-[9px] text-f1-text-muted">S3</span>
          </div>
        )}
      </div>
    </div>
  )
}

function buildTrackPath(
  points: Location[],
  scaleX: (x: number) => number,
  scaleY: (y: number) => number
): string {
  if (points.length === 0) return ''

  // Sort by date to get proper order
  const sorted = [...points].sort((a, b) => a.date.localeCompare(b.date))

  const parts = [`M ${scaleX(sorted[0].x)} ${scaleY(sorted[0].y)}`]
  for (let i = 1; i < sorted.length; i++) {
    parts.push(`L ${scaleX(sorted[i].x)} ${scaleY(sorted[i].y)}`)
  }

  return parts.join(' ')
}
