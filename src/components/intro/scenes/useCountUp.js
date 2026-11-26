import { useEffect, useState } from 'react'

/** Counts from 0 up to `target` over `durationMs` (shows the final value at once with reduced motion). */
export default function useCountUp(target, durationMs = 1400, reduceMotion = false) {
  const [value, setValue] = useState(0)

  useEffect(() => {
    if (target == null || reduceMotion) return undefined
    let frame
    const start = performance.now()
    const tick = (now) => {
      const progress = Math.min(1, (now - start) / durationMs)
      setValue(Math.round(target * (1 - (1 - progress) ** 3))) // ease-out
      if (progress < 1) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [target, durationMs, reduceMotion])

  if (target == null) return null
  return reduceMotion ? target : value
}
