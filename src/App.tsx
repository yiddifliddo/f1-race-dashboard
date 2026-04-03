import { useF1Data } from './hooks/useF1Data'
import { Sidebar } from './components/Sidebar'
import { Header } from './components/Header'
import { LiveTiming } from './components/LiveTiming'
import { TrackMap } from './components/TrackMap'
import { RaceControl } from './components/RaceControl'
import { TeamRadio } from './components/TeamRadio'
import { Incidents } from './components/Incidents'
import { DriverStandings, ConstructorStandings } from './components/Standings'
import { PitStopPrediction } from './components/PitStopPrediction'
import { LoadingScreen, ErrorScreen } from './components/LoadingScreen'

export default function App() {
  const data = useF1Data()

  if (data.loading) return <LoadingScreen />
  if (data.error && data.drivers.length === 0) return <ErrorScreen error={data.error} />

  return (
    <div className="flex h-screen bg-f1-bg overflow-hidden">
      {/* Left Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex flex-1 min-w-0 overflow-hidden">
        {/* Center Content */}
        <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
          {/* Header */}
          <Header
            session={data.session}
            meeting={data.meeting}
            weather={data.weather}
            trackStatus={data.trackStatus}
            isLive={data.isLive}
            currentLap={data.currentLap}
            totalLaps={data.totalLaps}
          />

          {/* Scrollable content area */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {/* Track Map */}
            <TrackMap locations={data.trackLocations} drivers={data.drivers} />

            {/* Three-panel row: Race Control | Team Radio | Incidents */}
            <div className="grid grid-cols-3 gap-3">
              <RaceControl messages={data.raceControl} />
              <TeamRadio messages={data.teamRadio} />
              <Incidents
                incidents={data.incidents}
                messages={data.raceControl}
                drivers={data.drivers}
              />
            </div>

            {/* Pit Stop Prediction */}
            <PitStopPrediction
              timings={data.timings}
              currentLap={data.currentLap}
              totalLaps={data.totalLaps}
            />

            {/* Standings row */}
            <div className="grid grid-cols-2 gap-3">
              <DriverStandings timings={data.timings} />
              <ConstructorStandings timings={data.timings} />
            </div>

            {/* Footer */}
            <footer className="text-center py-3 space-y-2">
              <div className="flex items-center justify-center gap-4 text-f1-text-muted">
                <span className="text-sm cursor-pointer hover:text-white">X</span>
                <span className="text-sm cursor-pointer hover:text-white">FB</span>
                <span className="text-sm cursor-pointer hover:text-white">YT</span>
                <span className="text-sm cursor-pointer hover:text-white">IG</span>
              </div>
              <p className="text-[9px] text-f1-text-muted">
                Unofficial fan project. Not affiliated with Formula One Group, FIA, or F1 teams.
                F1, Formula 1, Grand Prix and related marks are trademarks of Formula One Licensing BV.
              </p>
            </footer>
          </div>
        </div>

        {/* Right Panel - Live Timing */}
        <LiveTiming
          timings={data.timings}
          fastestLapDriver={data.fastestLapDriver}
          currentLap={data.currentLap}
        />
      </div>
    </div>
  )
}
