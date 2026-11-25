import { useCallback } from 'react'
import { discoverTheme } from '../services/tmdb.js'
import useFetch from '../hooks/useFetch.js'
import { imageUrl, IMAGE_SIZES } from '../utils/imageUrl.js'
import PageShell from '../components/layout/PageShell.jsx'
import SectionHeader from '../components/common/SectionHeader.jsx'
import ErrorState from '../components/common/ErrorState.jsx'
import EmptyState from '../components/common/EmptyState.jsx'
import HudPanel from '../components/common/HudPanel.jsx'
import HudRings from '../components/common/HudRings.jsx'
import HatchedBar from '../components/common/HatchedBar.jsx'
import TintedImage from '../components/common/TintedImage.jsx'
import { DataList, DataRow } from '../components/common/DataRow.jsx'
import { SkeletonGrid } from '../components/common/Skeleton.jsx'
import { Badge, ThreatBadge } from '../components/common/Badge.jsx'
import { SCORE_CRITERIA, THREAT_LEVELS, getEntityBySlug } from '../data/entities.js'

// TEMPORARY (day 2): building-block preview with live TMDB data.
// Replaced by the Command Center dashboard on day 3 morning.

function ThemePreview() {
  const fetcher = useCallback((signal) => discoverTheme('movie', {}, { signal }), [])
  const { data, error, loading, retry } = useFetch(fetcher)

  if (loading) return <SkeletonGrid count={5} label="Loading archive" />
  if (error) return <ErrorState error={error} onRetry={retry} />
  if (!data?.results?.length) return <EmptyState />

  const movies = data.results.slice(0, 5)
  const first = movies[0]

  return (
    <>
      <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {movies.map((movie) => (
          <li key={movie.id} className="group">
            <HudPanel variant="data" glow cut={12} bodyClassName="p-0">
              <TintedImage src={imageUrl(movie.poster_path, IMAGE_SIZES.posterCard)} alt={`${movie.title} poster`} />
              <div className="border-t border-line p-3">
                <p className="truncate text-sm font-medium text-ink">{movie.title}</p>
                <p className="mt-1 font-mono text-xs text-ink-muted">
                  {movie.release_date?.slice(0, 4) || '—'} · ★ {movie.vote_average.toFixed(1)} · TMDB #{movie.id}
                </p>
              </div>
            </HudPanel>
          </li>
        ))}
      </ul>

      <HudPanel variant="data" title="TMDB record" className="mt-10 max-w-2xl">
        <DataList>
          <DataRow label="Title" value={first.title} />
          <DataRow label="Release date" value={first.release_date} />
          <DataRow label="Rating" value={`${first.vote_average.toFixed(1)} / 10 (${first.vote_count.toLocaleString('en-US')} votes)`} />
          <DataRow label="TMDB ID" value={`#${first.id}`} />
        </DataList>
      </HudPanel>
    </>
  )
}

function HomePage() {
  const hal = getEntityBySlug('hal-9000')

  return (
    <PageShell
      code="SEC-00"
      eyebrow="Fictional AI & Robotics Archive"
      title="Synthetic Intelligence"
      description="Building-block preview. The Command Center dashboard replaces this page next."
    >
      <section>
        <SectionHeader eyebrow="Live · TMDB" title="HUD cards + tinted images" />
        <ThemePreview />
      </section>

      <section className="mt-14 grid gap-8 lg:grid-cols-[1fr_320px]">
        <HudPanel variant="editorial" title="Archive analysis · HAL 9000" brackets bodyClassName="p-6">
          <div className="space-y-3">
            {SCORE_CRITERIA.map((criterion) => (
              <HatchedBar key={criterion.key} label={criterion.label} value={hal.scores[criterion.key]} />
            ))}
          </div>
          <DataList className="mt-6 border-t border-line pt-4">
            <DataRow label="Classification" value={hal.entityType} variant="editorial" />
            <DataRow label="Threat" value={<ThreatBadge level={hal.threatLevel} />} variant="editorial" />
          </DataList>
          <p className="mt-4 text-xs text-ink-muted">Scores are the project&apos;s subjective editorial assessment.</p>
        </HudPanel>

        <div className="relative mx-auto grid aspect-square w-full max-w-80 place-items-center">
          <HudRings className="absolute inset-0 size-full" />
          <p className="label-mono text-center text-signal">
            HUD rings
            <br />
            <span className="text-ink-muted">decorative</span>
          </p>
        </div>
      </section>

      <section className="mt-14">
        <SectionHeader eyebrow="Components" title="Badges" />
        <div className="flex flex-wrap gap-3">
          {THREAT_LEVELS.map((level) => (
            <ThreatBadge key={level} level={level} />
          ))}
          <Badge tone="signal">In archive</Badge>
          <Badge tone="pulse">Archive Analysis</Badge>
          <Badge>Android</Badge>
        </div>
      </section>
    </PageShell>
  )
}

export default HomePage
