import { useState } from 'react'
import type { RaceControlMessage } from '../types/f1'
import type { IncidentSummary } from '../types/f1'
import type { Driver } from '../types/f1'

interface IncidentsProps {
  incidents: IncidentSummary
  messages: RaceControlMessage[]
  drivers: Driver[]
}

// Emoji reaction types
type ReactionType = '👍' | '👎' | '😊' | '😢' | '😂' | '😭'
const REACTION_EMOJIS: ReactionType[] = ['👍', '👎', '😊', '😢', '😂', '😭']

export function Incidents({ incidents, messages, drivers }: IncidentsProps) {
  // Track reactions per incident (keyed by index in filtered list)
  const [reactions, setReactions] = useState<Record<number, Record<ReactionType, number>>>({})

  const driverMap = new Map(drivers.map((d) => [d.driver_number, d]))

  // Filter to incident-related messages
  const incidentMessages = messages.filter(
    (m) =>
      m.message?.toLowerCase().includes('investigation') ||
      m.message?.toLowerCase().includes('penalty') ||
      m.message?.toLowerCase().includes('warning') ||
      m.message?.toLowerCase().includes('noted') ||
      m.message?.toLowerCase().includes('deleted') ||
      m.message?.toLowerCase().includes('track limits') ||
      m.message?.toLowerCase().includes('incident')
  )

  const handleReaction = (msgIndex: number, emoji: ReactionType) => {
    setReactions((prev) => {
      const msgReactions = { ...(prev[msgIndex] || {}) }
      msgReactions[emoji] = (msgReactions[emoji] || 0) + 1
      return { ...prev, [msgIndex]: msgReactions }
    })
  }

  return (
    <div className="bg-f1-panel border border-f1-border rounded-lg flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-f1-border">
        <div className="flex items-center gap-2">
          <span className="text-xs text-f1-text-muted">&#9888;</span>
          <span className="text-xs font-bold uppercase tracking-wider text-white">Incidents</span>
        </div>
      </div>

      {/* Summary counters */}
      <div className="grid grid-cols-4 gap-1 p-2 border-b border-f1-border">
        <CounterBox label="PEN" count={incidents.penalties} color="#e10600" />
        <CounterBox label="WARN" count={incidents.warnings} color="#ffd700" />
        <CounterBox label="INV" count={incidents.investigations} color="#3b82f6" />
        <CounterBox label="SC" count={incidents.safety_cars} color="#ffd700" />
      </div>

      {/* Incident messages with reactions */}
      <div className="flex-1 overflow-y-auto p-2 space-y-2 max-h-[180px]">
        {incidentMessages.slice(0, 10).map((msg, i) => {
          const driver = msg.driver_number ? driverMap.get(msg.driver_number) : null
          const teamColor = driver ? `#${driver.team_colour || '666'}` : null
          const msgReactions = reactions[i] || {}

          // Determine severity badge
          let badge = { bg: '#ffd700', text: '#000', label: 'WARNING' }
          if (msg.message?.toLowerCase().includes('investigation') || msg.message?.toLowerCase().includes('under investigation')) {
            badge = { bg: '#3b82f6', text: '#fff', label: 'UNDER INVESTIGATION' }
          } else if (msg.message?.toLowerCase().includes('penalty')) {
            badge = { bg: '#e10600', text: '#fff', label: 'PENALTY' }
          } else if (msg.message?.toLowerCase().includes('deleted')) {
            badge = { bg: '#e10600', text: '#fff', label: 'WARNING' }
          }

          return (
            <div key={i} className="animate-slide-in">
              <div className="flex items-start gap-2">
                {/* Driver badge */}
                {driver && (
                  <span
                    className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase shrink-0"
                    style={{ backgroundColor: teamColor || '#666', color: '#fff' }}
                  >
                    {driver.name_acronym}
                  </span>
                )}
                <div className="flex-1 min-w-0">
                  {/* Severity badge */}
                  <span
                    className="inline-block px-1.5 py-0.5 rounded text-[8px] font-bold uppercase mb-0.5"
                    style={{ backgroundColor: badge.bg, color: badge.text }}
                  >
                    {badge.label}
                  </span>
                  <p className="text-[10px] text-f1-text leading-tight">{msg.message}</p>
                  <span className="text-[9px] text-f1-text-muted font-mono">{formatTime(msg.date)}</span>
                </div>
              </div>

              {/* Emoji reactions */}
              <div className="flex items-center gap-1 mt-1 ml-7">
                {REACTION_EMOJIS.map((emoji) => {
                  const count = msgReactions[emoji] || 0
                  return (
                    <button
                      key={emoji}
                      onClick={() => handleReaction(i, emoji)}
                      className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] transition-all hover:scale-110 ${
                        count > 0
                          ? 'bg-f1-accent/20 border border-f1-accent/40'
                          : 'bg-f1-panel-light border border-f1-border hover:border-f1-accent/30'
                      }`}
                    >
                      <span>{emoji}</span>
                      {count > 0 && (
                        <span className="text-[9px] font-mono text-f1-accent font-bold">{count}</span>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          )
        })}
        {incidentMessages.length === 0 && (
          <p className="text-[11px] text-f1-text-muted text-center py-4">No incidents reported</p>
        )}
      </div>
    </div>
  )
}

function CounterBox({ label, count, color }: { label: string; count: number; color: string }) {
  return (
    <div className="flex flex-col items-center py-1 bg-f1-panel-light rounded border border-f1-border">
      <span className="text-lg font-bold font-mono" style={{ color }}>
        {count}
      </span>
      <span className="text-[8px] text-f1-text-muted uppercase tracking-wider">{label}</span>
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
