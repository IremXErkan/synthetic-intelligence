import { motion, useReducedMotion } from 'framer-motion'

const COLORS = {
  editorial: 'text-pulse', // editorial scores
  data: 'text-signal',
}

/**
 * Hatched score bar (default scale 1–10). Accessible as a meter, and the
 * number is always printed as text so the value never depends on bar length alone.
 * Fills once on mount. MotionConfig(reducedMotion="user") only skips transform
 * animations, not `width`, so reduced motion is checked here explicitly.
 */
function HatchedBar({ label, value, min = 1, max = 10, variant = 'editorial' }) {
  const reduceMotion = useReducedMotion()
  const clamped = Math.min(Math.max(value, 0), max)
  const percent = `${(clamped / max) * 100}%`
  const color = COLORS[variant] ?? COLORS.editorial

  return (
    <div className="flex items-center gap-3">
      <span className="label-mono w-28 shrink-0 text-ink-muted sm:w-44">{label}</span>
      <div
        role="meter"
        aria-label={label}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={clamped}
        aria-valuetext={`${clamped} of ${max}`}
        className="relative h-3 flex-1 border border-line-strong bg-panel-raised"
      >
        <motion.div
          className={`bg-hatched h-full border-r-2 border-current ${color}`}
          initial={reduceMotion ? false : { width: 0 }}
          animate={{ width: percent }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
      </div>
      <span className={`w-12 shrink-0 text-right font-mono text-sm ${color}`} aria-hidden="true">
        {clamped}/{max}
      </span>
    </div>
  )
}

export default HatchedBar
