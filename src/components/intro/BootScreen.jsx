/**
 * First screen of the intro. The click on INITIALIZE is also the user gesture
 * browsers require before speech can play. SKIP INTRO is always available.
 */
function BootScreen({ onStart, onSkip }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-10 px-6 text-center">
      <div className="space-y-2 font-mono text-sm text-ink-muted">
        <p>SYNTHETIC INTELLIGENCE // FICTIONAL AI ARCHIVE</p>
        <p className="text-signal">
          &gt; awaiting operator
          <span aria-hidden="true" className="ml-1 inline-block w-2 animate-pulse bg-signal motion-reduce:animate-none">
            &nbsp;
          </span>
        </p>
      </div>

      <button
        type="button"
        onClick={onStart}
        autoFocus
        className="chamfer bg-signal/15 px-8 py-4 font-mono text-lg tracking-[0.3em] text-signal transition-colors [--cut:12px] hover:bg-signal/25"
      >
        [ INITIALIZE ARCHIVE ]
      </button>

      <div className="space-y-3 text-sm text-ink-muted">
        <p>A one-minute narrated tour. Narration uses your browser&apos;s built-in speech voice.</p>
        <button type="button" onClick={onSkip} className="label-mono text-ink-muted underline-offset-4 hover:text-ink hover:underline">
          [ Skip intro ]
        </button>
      </div>
    </div>
  )
}

export default BootScreen
