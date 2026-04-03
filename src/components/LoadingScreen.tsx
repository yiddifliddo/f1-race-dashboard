export function LoadingScreen() {
  return (
    <div className="flex items-center justify-center h-screen bg-f1-bg">
      <div className="text-center">
        <div className="relative w-16 h-16 mx-auto mb-4">
          <div className="absolute inset-0 rounded-full border-2 border-f1-border" />
          <div className="absolute inset-0 rounded-full border-2 border-t-f1-accent animate-spin" />
        </div>
        <h2 className="text-lg font-bold text-f1-accent tracking-wider">F1 DASH</h2>
        <p className="text-xs text-f1-text-muted mt-1">Loading live timing data...</p>
      </div>
    </div>
  )
}

export function ErrorScreen({ error }: { error: string }) {
  return (
    <div className="flex items-center justify-center h-screen bg-f1-bg">
      <div className="text-center max-w-md">
        <div className="w-12 h-12 rounded-full bg-f1-red/20 flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">&#9888;</span>
        </div>
        <h2 className="text-lg font-bold text-white mb-2">Connection Error</h2>
        <p className="text-sm text-f1-text-dim mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-f1-accent text-black font-semibold rounded hover:bg-f1-accent-dim transition-colors text-sm"
        >
          Retry Connection
        </button>
      </div>
    </div>
  )
}
