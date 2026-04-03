interface SectorSegmentsProps {
  segments: number[] | null | undefined
}

// Mini-sector color codes from OpenF1
// 0 = not available, 2048 = yellow, 2049 = green, 2051 = purple, 2064 = red (PB), etc.
function getSegmentColor(value: number): string {
  switch (value) {
    case 2049: return '#00d200'   // Green - sector improvement
    case 2051: return '#a855f7'   // Purple - overall best
    case 2048: return '#ffd700'   // Yellow - slower
    case 2064: return '#00d200'   // Green PB
    case 2068: return '#a855f7'   // Purple
    default: return '#333333'     // Unknown/not available
  }
}

export function SectorSegments({ segments }: SectorSegmentsProps) {
  if (!segments || segments.length === 0) {
    return (
      <div className="flex gap-[1px]">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="w-1.5 h-2 rounded-[1px] bg-f1-border" />
        ))}
      </div>
    )
  }

  return (
    <div className="flex gap-[1px]">
      {segments.slice(0, 8).map((seg, i) => (
        <div
          key={i}
          className="w-1.5 h-2 rounded-[1px]"
          style={{ backgroundColor: getSegmentColor(seg) }}
        />
      ))}
    </div>
  )
}
