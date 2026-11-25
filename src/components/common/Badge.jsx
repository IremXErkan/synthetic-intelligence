import { OctagonAlert, ShieldAlert, ShieldCheck, TriangleAlert } from 'lucide-react'

const TONES = {
  neutral: 'border-line-strong text-ink-muted',
  signal: 'border-signal/40 bg-signal/10 text-signal',
  pulse: 'border-pulse/40 bg-pulse/10 text-pulse',
}

/** Small mono label. `tone`: neutral | signal (TMDB) | pulse (editorial). */
export function Badge({ tone = 'neutral', className = '', children }) {
  return (
    <span
      className={`label-mono chamfer inline-flex items-center gap-1 border px-2 [--cut:5px] py-0.5 text-[0.6875rem] ${TONES[tone]} ${className}`}
    >
      {children}
    </span>
  )
}

// Threat levels never rely on color alone: each has a text label and a distinct icon.
const THREAT_STYLES = {
  low: { icon: ShieldCheck, className: 'border-threat-low/40 bg-threat-low/10 text-threat-low' },
  moderate: { icon: TriangleAlert, className: 'border-threat-moderate/40 bg-threat-moderate/10 text-threat-moderate' },
  high: { icon: ShieldAlert, className: 'border-threat-high/40 bg-threat-high/10 text-threat-high' },
  critical: { icon: OctagonAlert, className: 'border-threat-critical/40 bg-threat-critical/10 text-threat-critical' },
}

/** Threat level badge, e.g. <ThreatBadge level="high" /> → "⚠ HIGH". */
export function ThreatBadge({ level }) {
  const style = THREAT_STYLES[level]
  if (!style) return null
  const Icon = style.icon

  return (
    <span
      className={`label-mono chamfer inline-flex items-center gap-1.5 border px-2 [--cut:5px] py-0.5 text-[0.6875rem] ${style.className}`}
    >
      <Icon className="size-3.5" aria-hidden="true" />
      <span>
        <span className="sr-only">Threat level: </span>
        {level}
      </span>
    </span>
  )
}
