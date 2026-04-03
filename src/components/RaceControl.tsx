import type { RaceControlMessage } from '../types/f1'

interface RaceControlProps {
  messages: RaceControlMessage[]
}

const FLAG_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  GREEN: { bg: '#00d200', text: '#fff', label: 'GREEN' },
  YELLOW: { bg: '#ffd700', text: '#000', label: 'YEL' },
  'DOUBLE YELLOW': { bg: '#ffd700', text: '#000', label: 'DBL YEL' },
  RED: { bg: '#e10600', text: '#fff', label: 'RED' },
  BLUE: { bg: '#3b82f6', text: '#fff', label: 'BLUE' },
  CHEQUERED: { bg: '#888', text: '#fff', label: 'CHEQUERED' },
  'BLACK AND WHITE': { bg: '#333', text: '#fff', label: 'B&W' },
  CLEAR: { bg: '#00d200', text: '#fff', label: 'CLEAR' },
}

function getCategoryBadge(msg: RaceControlMessage) {
  if (msg.flag && FLAG_STYLES[msg.flag]) {
    const style = FLAG_STYLES[msg.flag]
    return (
      <span
        className="px-1.5 py-0.5 rounded text-[8px] font-bold uppercase"
        style={{ backgroundColor: style.bg, color: style.text }}
      >
        {style.label}
      </span>
    )
  }

  const catStyles: Record<string, { bg: string; label: string }> = {
    SafetyCar: { bg: '#ffd700', label: 'SC' },
    Drs: { bg: '#00d200', label: 'DRS' },
    CarEvent: { bg: '#3b82f6', label: 'CAR' },
  }

  if (msg.category && catStyles[msg.category]) {
    const style = catStyles[msg.category]
    return (
      <span
        className="px-1.5 py-0.5 rounded text-[8px] font-bold uppercase"
        style={{ backgroundColor: style.bg, color: '#000' }}
      >
        {style.label}
      </span>
    )
  }

  // Check message content for pit lane
  if (msg.message?.toLowerCase().includes('pit lane') || msg.message?.toLowerCase().includes('pit')) {
    return (
      <span className="px-1.5 py-0.5 rounded text-[8px] font-bold uppercase bg-f1-accent text-black">
        PIT
      </span>
    )
  }

  if (msg.message?.toLowerCase().includes('deleted') || msg.message?.toLowerCase().includes('delete')) {
    return (
      <span className="px-1.5 py-0.5 rounded text-[8px] font-bold uppercase bg-red-700 text-white">
        DEL
      </span>
    )
  }

  return (
    <span className="px-1.5 py-0.5 rounded text-[8px] font-bold uppercase bg-f1-panel-light text-f1-text-dim border border-f1-border">
      RC
    </span>
  )
}

export function RaceControl({ messages }: RaceControlProps) {
  return (
    <div className="bg-f1-panel border border-f1-border rounded-lg flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-f1-border">
        <div className="flex items-center gap-2">
          <span className="text-xs text-f1-text-muted">&#128227;</span>
          <span className="text-xs font-bold uppercase tracking-wider text-white">Race Control</span>
        </div>
        <span className="text-[10px] text-f1-text-muted font-mono">{messages.length}</span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1.5 max-h-[250px]">
        {messages.slice(0, 15).map((msg, i) => (
          <div key={i} className="flex items-start gap-2 animate-slide-in">
            {getCategoryBadge(msg)}
            <div className="flex-1 min-w-0">
              <p className="text-[10px] text-f1-text leading-tight truncate" title={msg.message}>
                {msg.message}
              </p>
            </div>
            <span className="text-[9px] text-f1-text-muted font-mono shrink-0">
              {formatTime(msg.date)}
            </span>
          </div>
        ))}
        {messages.length === 0 && (
          <p className="text-[11px] text-f1-text-muted text-center py-4">
            No race control messages
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
