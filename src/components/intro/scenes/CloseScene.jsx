import { ShieldCheck } from 'lucide-react'

/** Final scene — clearance granted; ENTER ARCHIVE closes the intro. */
function CloseScene({ lineIndex, onEnter }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-6 text-center">
      <ShieldCheck className="size-12 text-threat-low" aria-hidden="true" />
      <div>
        <p className="font-mono text-2xl tracking-[0.3em] text-threat-low sm:text-3xl">CLEARANCE GRANTED</p>
        {lineIndex >= 1 && <p className="label-mono mt-3 text-threat-high">Enter carefully</p>}
      </div>
      <button
        type="button"
        onClick={onEnter}
        autoFocus
        className="chamfer bg-signal px-8 py-3 font-mono text-base font-semibold tracking-[0.3em] text-void transition-colors [--cut:10px] hover:bg-signal/85"
      >
        [ ENTER ARCHIVE ]
      </button>
    </div>
  )
}

export default CloseScene
