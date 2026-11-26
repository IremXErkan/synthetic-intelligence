// Small presentational pieces of the holographic stage.

/** Chapter menu floating left of the screen; the active chapter has an orange frame. Buttons jump to a scene. */
export function ChapterRail({ scenes, activeIndex, onSelect }) {
  return (
    <nav aria-label="Intro chapters">
      <ol className="space-y-2">
        {scenes.map((scene, index) => {
          const active = index === activeIndex
          return (
            <li key={scene.id}>
              <button
                type="button"
                onClick={() => onSelect(index)}
                aria-current={active ? 'step' : undefined}
                className={`w-full border px-3 py-2 text-left font-mono text-sm uppercase tracking-wider transition-colors ${
                  active
                    ? 'border-threat-high bg-threat-high/10 text-threat-high shadow-[0_0_12px_rgb(251_146_60/0.35)]'
                    : 'border-transparent text-ink hover:text-holo'
                }`}
              >
                {scene.chapter}
              </button>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

/** Decorative waveform shown while the narrator speaks (aria-hidden, no data). */
export function VoiceWave({ active }) {
  const bars = [0.5, 0.9, 0.6, 1, 0.7, 0.4, 0.8, 0.55, 0.95, 0.65, 0.45, 0.85]
  return (
    <span aria-hidden="true" className="flex h-6 shrink-0 items-end gap-0.5">
      {bars.map((height, i) => (
        <span
          key={i}
          className={`w-1 origin-bottom bg-holo ${active ? 'animate-[voice_0.9s_ease-in-out_infinite] motion-reduce:animate-none' : 'opacity-30'}`}
          style={{ height: `${height * 100}%`, animationDelay: `${i * 0.09}s` }}
        />
      ))}
    </span>
  )
}
