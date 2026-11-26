const SIZES = {
  md: { text: 'text-base gap-2.5', cap: 'px-2 py-0.5 text-xs' },
  sm: { text: 'text-xs gap-2', cap: 'px-1.5 py-px text-[0.6875rem]' },
}

/**
 * Outlined key cap + label, e.g. [ESC] SKIP. With `onClick` it is also a button
 * for mouse/touch users; without one it is a plain hint (nothing to click).
 * Used by the intro and the Archive Terminal.
 */
function KeyHint({ keyLabel, label, onClick, pressed, size = 'md' }) {
  const style = SIZES[size] ?? SIZES.md
  const className = `group flex items-center font-mono uppercase tracking-[0.18em] text-ink ${style.text}`
  const content = (
    <>
      <span className={`rounded-[3px] border-2 border-ink/80 group-hover:border-holo group-hover:text-holo ${style.cap}`}>
        {keyLabel}
      </span>
      <span>{label}</span>
    </>
  )

  if (!onClick) return <span className={className}>{content}</span>
  return (
    <button type="button" onClick={onClick} aria-pressed={pressed} className={className}>
      {content}
    </button>
  )
}

export default KeyHint
