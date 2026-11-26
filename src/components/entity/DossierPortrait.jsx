import { motion, useReducedMotion } from 'framer-motion'
import TintedImage from '../common/TintedImage.jsx'

// Decorative "tracking points" (fixed positions; they carry no data).
const TRACKING_POINTS = [
  { top: '28%', left: '38%' },
  { top: '31%', left: '61%' },
  { top: '46%', left: '50%' },
  { top: '58%', left: '42%' },
  { top: '60%', left: '58%' },
]

/**
 * Dossier portrait with a one-time opening scan: a line sweeps down once, then a
 * few tracking points blink in. Nothing runs when the user prefers reduced motion.
 */
function DossierPortrait({ src, alt }) {
  const reduceMotion = useReducedMotion()

  return (
    <div className="group/portrait relative overflow-hidden border border-pulse/40">
      <TintedImage src={src} alt={alt} className="[&_img]:object-top" />

      {!reduceMotion && src && (
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          <motion.div
            className="absolute inset-x-0 h-0.5 bg-signal shadow-[0_0_12px_rgb(34_211_238/0.9)]"
            initial={{ top: '0%', opacity: 1 }}
            animate={{ top: '100%', opacity: 0 }}
            transition={{ duration: 1.4, ease: 'easeInOut', delay: 0.3 }}
          />
          {TRACKING_POINTS.map((point, i) => (
            <motion.span
              key={i}
              className="absolute size-1.5 rounded-full bg-signal shadow-[0_0_6px_rgb(34_211_238)]"
              style={point}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: [0, 1, 0.6], scale: 1 }}
              transition={{ delay: 1.4 + i * 0.12, duration: 0.5 }}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default DossierPortrait
