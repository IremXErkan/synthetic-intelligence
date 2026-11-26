import { useEffect, useId, useState } from 'react'
import { useSearchParams } from 'react-router'
import { ArrowLeftRight, Info } from 'lucide-react'
import { useReducedMotion } from 'framer-motion'
import { PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart, ResponsiveContainer } from 'recharts'
import { ENTITIES, SCORE_CRITERIA, getEntityBySlug } from '../data/entities.js'
import useDocumentTitle from '../hooks/useDocumentTitle.js'
import PageShell from '../components/layout/PageShell.jsx'
import HudPanel from '../components/common/HudPanel.jsx'
import HudRings from '../components/common/HudRings.jsx'
import HatchedBar from '../components/common/HatchedBar.jsx'
import LabEntityPanel from '../components/entity/LabEntityPanel.jsx'

// Chart colors mirror the theme tokens: A = signal (cyan), B = pulse (purple).
const COLOR_A = '#22d3ee'
const COLOR_B = '#a78bfa'
const ANALYSIS_DELAY_MS = 450 // short "ANALYZING…" beat; purely presentational

// Short axis labels for the radar (full names are in the breakdown below).
const CHART_LABELS = {
  humanInteraction: 'Interaction',
  mobility: 'Mobility',
  decisionMaking: 'Decisions',
}

const SELECT_CLASS = 'w-full border border-line-strong bg-void px-3 py-2 text-sm text-ink focus:border-signal'

/** Reads ?a=&b=; unknown or missing slugs fall back to two different defaults. */
function useLabPair() {
  const [searchParams, setSearchParams] = useSearchParams()
  const fallbackA = ENTITIES[0]
  const a = getEntityBySlug(searchParams.get('a')) ?? fallbackA
  let b = getEntityBySlug(searchParams.get('b'))
  if (!b || b.slug === a.slug) b = ENTITIES.find((entity) => entity.slug !== a.slug)

  const setPair = (nextA, nextB) => setSearchParams({ a: nextA, b: nextB })
  return { a, b, setPair }
}

function EntitySelect({ label, value, exclude, onChange }) {
  const id = useId()
  return (
    <div className="flex-1">
      <label htmlFor={id} className="label-mono mb-2 block text-ink-muted">
        {label}
      </label>
      <select id={id} className={SELECT_CLASS} value={value} onChange={(event) => onChange(event.target.value)}>
        {ENTITIES.filter((entity) => entity.slug !== exclude).map((entity) => (
          <option key={entity.slug} value={entity.slug}>
            {entity.name}
          </option>
        ))}
      </select>
    </div>
  )
}

function LabPage() {
  const { a, b, setPair } = useLabPair()
  const reduceMotion = useReducedMotion() // Recharts does not read the OS setting itself
  const pairKey = `${a.slug}|${b.slug}`
  useDocumentTitle(`${a.name} vs ${b.name} · Comparison Lab`)

  // "ANALYZING…" → "ANALYSIS COMPLETE" after a short beat whenever the pair changes.
  const [completedKey, setCompletedKey] = useState(null)
  useEffect(() => {
    const timer = setTimeout(() => setCompletedKey(pairKey), ANALYSIS_DELAY_MS)
    return () => clearTimeout(timer)
  }, [pairKey])
  const analyzing = completedKey !== pairKey

  const chartData = SCORE_CRITERIA.map((criterion) => ({
    criterion: CHART_LABELS[criterion.key] ?? criterion.label,
    [a.slug]: a.scores[criterion.key],
    [b.slug]: b.scores[criterion.key],
  }))

  const chartSummary = SCORE_CRITERIA.map(
    (criterion) => `${criterion.label}: ${a.name} ${a.scores[criterion.key]}, ${b.name} ${b.scores[criterion.key]}`,
  ).join('; ')

  return (
    <PageShell
      code="SEC-05"
      eyebrow="Comparison Lab"
      title="Lab"
      description="Compare two synthetic entities across five capability criteria. Production data is live from TMDB; the scores are the archive's editorial assessment."
    >
      <HudPanel variant="neutral" title="Select subjects" titleAs="h2" bodyClassName="p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
          <EntitySelect label="Subject A" value={a.slug} exclude={b.slug} onChange={(slug) => setPair(slug, b.slug)} />
          <button
            type="button"
            onClick={() => setPair(b.slug, a.slug)}
            className="chamfer inline-flex items-center justify-center gap-2 bg-line-strong px-4 py-2 text-sm text-ink transition-colors [--cut:8px] hover:bg-signal/20 hover:text-signal"
            aria-label="Swap subjects A and B"
          >
            <ArrowLeftRight className="size-4" aria-hidden="true" />
            <span className="sm:hidden">Swap</span>
          </button>
          <EntitySelect label="Subject B" value={b.slug} exclude={a.slug} onChange={(slug) => setPair(a.slug, slug)} />
        </div>
      </HudPanel>

      <p
        role="status"
        className={`label-mono my-6 text-center ${analyzing ? 'animate-pulse text-threat-moderate motion-reduce:animate-none' : 'text-threat-low'}`}
      >
        {analyzing ? 'Analyzing…' : `Analysis complete · ${a.name} vs ${b.name}`}
      </p>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr_1fr] lg:items-center">
        <LabEntityPanel entity={a} slotLabel="Subject A" accent="signal" />

        {/* Radar chart inside HUD rings. The SVG is summarized for screen readers;
            the bars below carry the same numbers as text. */}
        <figure className="relative mx-auto aspect-square w-full max-w-[26rem]">
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

        <LabEntityPanel entity={b} slotLabel="Subject B" accent="pulse" />
      </div>

      <HudPanel variant="editorial" title="Criterion breakdown · Editorial assessment" titleAs="h2" className="mt-12" bodyClassName="p-5 sm:p-6">
        <ul className="grid gap-8 md:grid-cols-2">
          {SCORE_CRITERIA.map((criterion) => {
            const diff = a.scores[criterion.key] - b.scores[criterion.key]
            return (
              <li key={criterion.key}>
                <h3 className="font-semibold text-ink">{criterion.label}</h3>
                <p className="mt-1 text-xs text-ink-muted">{criterion.description}</p>
                <div className="mt-3 space-y-2">
                  <HatchedBar label={a.name} value={a.scores[criterion.key]} variant="data" />
                  <HatchedBar label={b.name} value={b.scores[criterion.key]} variant="editorial" />
                </div>
                <p className="label-mono mt-2 text-[0.6875rem] text-ink-muted">
                  {diff === 0 ? 'Even' : `${diff > 0 ? a.name : b.name} leads by ${Math.abs(diff)}`}
                </p>
              </li>
            )
          })}
        </ul>
        <p className="mt-8 flex gap-2 text-xs text-ink-muted">
          <Info className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
          All scores (1–10) are the archive&apos;s subjective editorial assessment based on each entity&apos;s portrayal on
          screen. They are not measurements and do not come from TMDB.
        </p>
      </HudPanel>
    </PageShell>
  )
}

export default LabPage
