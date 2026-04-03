import { useState } from 'react'

const NAV_ITEMS = [
  { icon: '🏠', label: 'Home', sublabel: 'Welcome to F1Dash', id: 'home' },
  { icon: '📊', label: 'Dashboard', sublabel: 'Live timing & telemetry', id: 'dashboard', active: true },
  { icon: '🔄', label: 'Simulate', sublabel: 'Replay sessions', id: 'simulate' },
  { icon: '📈', label: 'Telemetry', sublabel: 'Deep dive analysis', id: 'telemetry' },
  { icon: '📅', label: 'Schedule', sublabel: 'Race calendar', id: 'schedule' },
  { icon: '🌤', label: 'Weather', sublabel: 'Race weekend forecast', id: 'weather' },
  { icon: '🏎', label: 'Drivers', sublabel: 'Driver profiles', id: 'drivers' },
  { icon: '🏗', label: 'Constructors', sublabel: 'Team standings', id: 'constructors' },
  { icon: '🏆', label: 'Standings', sublabel: 'Championship', id: 'standings' },
  { icon: '📜', label: 'Records', sublabel: 'All-time records', id: 'records' },
  { icon: '🗺', label: 'Map', sublabel: 'Track overview', id: 'map' },
  { icon: '📰', label: 'News', sublabel: 'Latest updates', id: 'news' },
  { icon: '📁', label: 'Archive', sublabel: 'Past sessions', id: 'archive' },
]

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside
      className={`${
        collapsed ? 'w-16' : 'w-52'
      } bg-f1-panel border-r border-f1-border flex flex-col h-full transition-all duration-200 shrink-0`}
    >
      {/* Logo */}
      <div className="p-3 border-b border-f1-border flex items-center gap-2">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="text-f1-accent hover:text-f1-accent-dim transition-colors"
        >
          <svg className="w-8 h-8" viewBox="0 0 32 32" fill="none">
            <rect width="32" height="32" rx="6" fill="currentColor" fillOpacity="0.15" />
            <text x="4" y="22" fontSize="16" fontWeight="900" fill="currentColor" fontFamily="Inter">
              F1
            </text>
          </svg>
        </button>
        {!collapsed && (
          <div>
            <div className="text-sm font-bold text-f1-accent tracking-wide">F1DASH</div>
            <div className="text-[10px] text-f1-text-dim uppercase tracking-widest">Live Timing</div>
          </div>
        )}
      </div>

      {/* Navigation */}
      {!collapsed && (
        <div className="px-3 pt-3 pb-1">
          <span className="text-[10px] uppercase text-f1-text-muted tracking-widest font-medium">
            Navigation
          </span>
        </div>
      )}

      <nav className="flex-1 overflow-y-auto py-1 space-y-0.5 px-2">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            className={`w-full flex items-center gap-2.5 px-2 py-1.5 rounded-md text-left transition-colors ${
              item.active
                ? 'bg-f1-accent/15 text-f1-accent border border-f1-accent/30'
                : 'text-f1-text-dim hover:text-f1-text hover:bg-f1-panel-light border border-transparent'
            }`}
          >
            <span className="text-sm shrink-0">{item.icon}</span>
            {!collapsed && (
              <div className="min-w-0">
                <div className={`text-xs font-semibold truncate ${item.active ? 'text-f1-accent' : ''}`}>
                  {item.label}
                </div>
                <div className="text-[10px] text-f1-text-muted truncate">{item.sublabel}</div>
              </div>
            )}
            {!collapsed && item.active && (
              <svg className="w-3 h-3 ml-auto text-f1-accent shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            )}
          </button>
        ))}
      </nav>

      {/* Bottom section */}
      {!collapsed && (
        <div className="p-3 border-t border-f1-border space-y-2">
          <div className="flex gap-2 text-[10px] text-f1-text-muted">
            <span className="hover:text-f1-text cursor-pointer">Learn F1</span>
            <span className="hover:text-f1-text cursor-pointer">FAQ</span>
            <span className="hover:text-f1-text cursor-pointer">About</span>
          </div>
          <div className="flex gap-3 text-f1-text-muted">
            <span className="hover:text-f1-accent cursor-pointer text-xs">Discord</span>
            <span className="hover:text-f1-accent cursor-pointer text-xs">Help</span>
          </div>
          <div className="space-y-1.5 pt-1">
            <button className="w-full py-1.5 text-xs font-semibold bg-f1-accent text-black rounded-md hover:bg-f1-accent-dim transition-colors">
              Log In
            </button>
            <button className="w-full py-1.5 text-xs font-semibold border border-f1-border text-f1-text-dim rounded-md hover:border-f1-accent/50 hover:text-f1-text transition-colors">
              Sign Up
            </button>
          </div>
          <div className="text-[9px] text-f1-text-muted text-center pt-1">
            v1.0.0 &middot; 2026 Season
          </div>
        </div>
      )}
    </aside>
  )
}
