interface TyreIndicatorProps {
  compound: string
  age?: number
  size?: 'sm' | 'md'
}

const TYRE_COLORS: Record<string, string> = {
  SOFT: '#e10600',
  MEDIUM: '#ffd700',
  HARD: '#f0f0f0',
  INTERMEDIATE: '#00d200',
  WET: '#3b82f6',
}

const TYRE_LABELS: Record<string, string> = {
  SOFT: 'S',
  MEDIUM: 'M',
  HARD: 'H',
  INTERMEDIATE: 'I',
  WET: 'W',
}

export function TyreIndicator({ compound, age, size = 'sm' }: TyreIndicatorProps) {
  const color = TYRE_COLORS[compound] || '#888'
  const label = TYRE_LABELS[compound] || '?'
  const dim = size === 'sm'

  return (
    <div className="flex items-center gap-0.5 shrink-0">
      <div
        className={`${dim ? 'w-4 h-4 text-[8px]' : 'w-5 h-5 text-[10px]'} rounded-full flex items-center justify-center font-bold border-2`}
        style={{
          borderColor: color,
          color: color,
          backgroundColor: `${color}20`,
        }}
      >
        {label}
      </div>
      {age !== undefined && (
        <span className="text-[8px] text-f1-text-muted font-mono">{age}L</span>
      )}
    </div>
  )
}
