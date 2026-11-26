// Decorative rotating HUD rings (SVG). Purely visual: aria-hidden, no pointer
// events. Slow rotation stops for prefers-reduced-motion.
const RING = 'origin-center [transform-box:fill-box] motion-reduce:animate-none'

function HudRings({ className = '', color = 'text-signal' }) {
  return (
    <svg
      viewBox="0 0 200 200"
      aria-hidden="true"
      focusable="false"
      className={`pointer-events-none ${color} ${className}`}
    >
      <g className={`${RING} animate-[spin_90s_linear_infinite]`}>
        <circle cx="100" cy="100" r="97" fill="none" stroke="currentColor" strokeOpacity="0.5" strokeWidth="0.6" strokeDasharray="1 4" />
      </g>
      <g className={`${RING} animate-[spin_60s_linear_infinite] [animation-direction:reverse]`}>
        <circle cx="100" cy="100" r="86" fill="none" stroke="currentColor" strokeOpacity="0.35" strokeWidth="3" strokeDasharray="60 18 8 18" />
      </g>
      <g className={`${RING} animate-[spin_120s_linear_infinite]`}>
        <circle cx="100" cy="100" r="74" fill="none" stroke="currentColor" strokeOpacity="0.6" strokeWidth="0.8" strokeDasharray="120 40" />
      </g>
      <circle cx="100" cy="100" r="66" fill="none" stroke="currentColor" strokeOpacity="0.15" strokeWidth="0.5" />
    </svg>
  )
}

export default HudRings
