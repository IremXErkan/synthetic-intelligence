import { useEffect, useState } from 'react'

const formatter = new Intl.DateTimeFormat('en-GB', {
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: false,
})

/**
 * The viewer's local time. Kept in its own component so the per-second state
 * update re-renders only this element, not the status bar or page.
 * No aria-live: a screen reader should not announce every tick.
 */
function LocalClock() {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <span className="inline-flex items-center gap-2">
      <span className="label-mono text-ink-muted">Local time</span>
      <time dateTime={now.toISOString()} className="font-mono text-xs text-ink tabular-nums">
        {formatter.format(now)}
      </time>
    </span>
  )
}

export default LocalClock
