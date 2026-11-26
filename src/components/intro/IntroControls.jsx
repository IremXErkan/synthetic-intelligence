// Small presentational pieces of the holographic stage.

/** Left chapter menu; the active chapter has an orange frame. Buttons jump to a scene. */
export function ChapterRail({ scenes, activeIndex, onSelect }) {
  return (
    <nav aria-label="Intro chapters">
      <ol className="space-y-1.5">
        {scenes.map((scene, index) => {
          const active = index === activeIndex
          return (
            <li key={scene.id}>
              <button
                type="button"
                onClick={() => onSelect(index)}
                aria-current={active ? 'step' : undefined}
                className={`w-full border px-3 py-1.5 text-left font-mono text-xs uppercase tracking-wider transition-colors ${
                  active
                    ? 'border-threat-high bg-threat-high/10 text-threat-high'
                    : 'border-transparent text-ink-muted hover:text-ink'
                }`}
              >
                {String(index + 1).padStart(2, '0')} {scene.chapter}
              </button>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

/** Key cap + label, e.g. [ESC] SKIP. Also a clickable button for mouse/touch users. */
export function KeyHint({ keyLabel, label, onClick, pressed }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={pressed}
      className="group flex items-center gap-2 font-mono text-sm uppercase tracking-widest text-ink"
    >
      <span className="chamfer bg-signal/20 px-2 py-1 text-xs text-signal [--cut:5px] group-hover:bg-signal/35">{keyLabel}</span>
      <span>{label}</span>
    </button>
  )
}

/** Decorative waveform shown while the narrator speaks (aria-hidden, no data). */
export function VoiceWave({ active }) {
  return (
    <span aria-hidden="true" className="flex h-5 items-end gap-0.5">
      {[0.5, 0.9, 0.6, 1, 0.7, 0.4, 0.8].map((height, i) => (
        <span
          key={i}
          className={`w-1 origin-bottom bg-signal ${active ? 'animate-[voice_0.9s_ease-in-out_infinite] motion-reduce:animate-none' : 'opacity-30'}`}
          style={{ height: `${height * 100}%`, animationDelay: `${i * 0.11}s` }}
        />
      ))}
    </span>
  )
}
