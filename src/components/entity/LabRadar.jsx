import { useReducedMotion } from 'framer-motion'
import { PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart, ResponsiveContainer } from 'recharts'
import { SCORE_CRITERIA } from '../../data/entities.js'
import HudRings from '../common/HudRings.jsx'

// Chart colors mirror the theme tokens: A = signal (cyan), B = pulse (purple).
const COLOR_A = '#22d3ee'
const COLOR_B = '#a78bfa'

// Short axis labels for the radar (full names are in the Lab's breakdown).
const CHART_LABELS = {
  humanInteraction: 'Interaction',
  mobility: 'Mobility',
  decisionMaking: 'Decisions',
}

/**
 * Editorial score radar for two entities inside HUD rings. Used by the
 * Comparison Lab and the intro. The SVG is summarized for screen readers.
 */
function LabRadar({ a, b, className = 'max-w-[26rem]' }) {
  const reduceMotion = useReducedMotion() // Recharts does not read the OS setting itself

  const chartData = SCORE_CRITERIA.map((criterion) => ({
    criterion: CHART_LABELS[criterion.key] ?? criterion.label,
    [a.slug]: a.scores[criterion.key],
    [b.slug]: b.scores[criterion.key],
  }))

  const chartSummary = SCORE_CRITERIA.map(
    (criterion) => `${criterion.label}: ${a.name} ${a.scores[criterion.key]}, ${b.name} ${b.scores[criterion.key]}`,
  ).join('; ')

  return (
    <figure className={`relative mx-auto aspect-square w-full ${className}`}>
      <HudRings className="absolute inset-0 size-full opacity-60" />
      <div role="img" aria-label={`Radar chart. ${chartSummary}`} className="absolute inset-0">
        <ResponsiveContainer width="100%" height="100%">
          {/* Smaller radius + short axis labels so the labels are never clipped by the SVG edge. */}
          <RadarChart data={chartData} outerRadius="52%" style={{ overflow: 'visible' }}>
            <PolarGrid stroke="#3a4a6b" />
            <PolarAngleAxis dataKey="criterion" tick={{ fill: '#8b97ad', fontSize: 11, fontFamily: 'JetBrains Mono' }} />
            <PolarRadiusAxis domain={[0, 10]} tickCount={6} tick={false} axisLine={false} />
            <Radar name={a.name} dataKey={a.slug} stroke={COLOR_A} fill={COLOR_A} fillOpacity={0.25} isAnimationActive={!reduceMotion} />
            <Radar name={b.name} dataKey={b.slug} stroke={COLOR_B} fill={COLOR_B} fillOpacity={0.25} isAnimationActive={!reduceMotion} />
          </RadarChart>
        </ResponsiveContainer>
      </div>
      <figcaption className="absolute inset-x-0 -bottom-2 flex justify-center gap-4 text-xs">
        <span className="inline-flex items-center gap-1.5 text-signal">
          <span aria-hidden="true" className="size-2.5 bg-signal" /> {a.name}
        </span>
        <span className="inline-flex items-center gap-1.5 text-pulse">
          <span aria-hidden="true" className="size-2.5 bg-pulse" /> {b.name}
        </span>
      </figcaption>
    </figure>
  )
}

export default LabRadar
