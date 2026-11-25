// Real status indicator. The state is always written as text next to the dot.
const STATES = {
  connecting: { label: 'Connecting', dot: 'bg-threat-moderate', text: 'text-threat-moderate' },
  online: { label: 'Online', dot: 'bg-threat-low', text: 'text-threat-low' },
  error: { label: 'Error', dot: 'bg-threat-critical', text: 'text-threat-critical' },
}

function StatusDot({ status, label }) {
  const state = STATES[status] ?? STATES.connecting

  return (
    <span role="status" className="inline-flex items-center gap-2">
      {/* Label is visually hidden on narrow screens but still read by screen readers. */}
      {label && <span className="label-mono sr-only text-ink-muted sm:not-sr-only">{label}</span>}
      <span aria-hidden="true" className={`size-2 rounded-full ${state.dot}`} />
      <span className={`label-mono ${state.text}`}>{state.label}</span>
    </span>
  )
}

export default StatusDot
