import type { TeamRadioEntry } from '../hooks/useF1Data'

interface TeamRadioProps {
  messages: TeamRadioEntry[]
}

export function TeamRadio({ messages }: TeamRadioProps) {
  return (
    <div className="bg-f1-panel border border-f1-border rounded-lg flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-f1-border">
        <div className="flex items-center gap-2">
          <span className="text-xs text-f1-text-muted">&#127908;</span>
          <span className="text-xs font-bold uppercase tracking-wider text-white">Team Radio</span>
        </div>
      </div>

      {/* Radio entries */}
      <div className="flex-1 overflow-y-auto p-2 space-y-2 max-h-[250px]">
        {messages.slice(0, 10).map((msg, i) => {
          const teamColor = msg.driver ? `#${msg.driver.team_colour || '666'}` : '#666'
          return (
            <div key={i} className="flex items-center gap-2 animate-slide-in">
              {/* Driver badge */}
              <span
                className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase shrink-0"
                style={{ backgroundColor: teamColor, color: '#fff' }}
              >
                {msg.driver?.name_acronym || `#${msg.driver_number}`}
              </span>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="text-[10px] text-white font-medium">
                  {msg.driver?.full_name || `Driver #${msg.driver_number}`}
                </div>
                <div className="text-[9px] text-f1-text-muted font-mono">
                  {formatTime(msg.date)}
                </div>
              </div>

              {/* Play button */}
              <a
                href={msg.recording_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 px-2 py-1 rounded bg-f1-panel-light border border-f1-border text-f1-text-dim hover:text-white hover:border-f1-accent/50 transition-colors"
              >
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
                <span className="text-[9px]">---</span>
              </a>
            </div>
          )
        })}
        {messages.length === 0 && (
          <p className="text-[11px] text-f1-text-muted text-center py-4">
            No team radio available
          </p>
        )}
      </div>
    </div>
  )
}

function formatTime(dateStr: string): string {
  try {
    const d = new Date(dateStr)
    return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  } catch {
    return ''
  }
}
