/**
 * Shows a real site component as a shrunken, non-interactive preview inside the
 * intro: rendered at full layout width, scaled down, `inert` (no focus, not read
 * out — the caption carries the information) and clipped to the scene area.
 */
function ScaledPreview({ scale = 0.6, className = '', children }) {
  return (
    <div className={`pointer-events-none relative overflow-hidden ${className}`} inert aria-hidden="true">
      <div style={{ width: `${100 / scale}%`, transform: `scale(${scale})`, transformOrigin: 'top left' }}>{children}</div>
    </div>
  )
}

export default ScaledPreview
