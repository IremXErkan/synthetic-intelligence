import { useCallback } from 'react'
import { discoverMovies } from '../services/tmdb.js'
import useFetch from '../hooks/useFetch.js'
import { imageUrl, IMAGE_SIZES } from '../utils/imageUrl.js'
import PageShell from '../components/layout/PageShell.jsx'
import SectionHeader from '../components/common/SectionHeader.jsx'
import ErrorState from '../components/common/ErrorState.jsx'
import EmptyState from '../components/common/EmptyState.jsx'
import { SkeletonGrid } from '../components/common/Skeleton.jsx'
import { Badge, ThreatBadge } from '../components/common/Badge.jsx'
import { THREAT_LEVELS } from '../data/entities.js'

// TEMPORARY (day 1–2): live API check + component preview.
// Replaced by the real Command Center in the next step.
function ApiCheck() {
  const fetcher = useCallback(
    (signal) => discoverMovies({ sort_by: 'popularity.desc', page: 1 }, { signal }),
    [],
  )
  const { data, error, loading, retry } = useFetch(fetcher)

  if (loading) return <SkeletonGrid count={5} label="Loading movies" />
  if (error) return <ErrorState error={error} onRetry={retry} />
  if (!data?.results?.length) return <EmptyState />

  return (
    <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {data.results.slice(0, 5).map((movie) => {
        const poster = imageUrl(movie.poster_path, IMAGE_SIZES.posterCard)
        return (
          <li key={movie.id} className="rounded-lg border border-line bg-panel p-2">
            {poster ? (
              <img src={poster} alt={`${movie.title} poster`} className="aspect-[2/3] w-full rounded object-cover" />
            ) : (
              <div className="aspect-[2/3] w-full rounded bg-panel-raised" aria-hidden="true" />
            )}
            <p className="mt-2 text-sm font-medium text-ink">{movie.title}</p>
            <p className="font-mono text-xs text-ink-muted">
              {movie.release_date?.slice(0, 4) || '—'} · ★ {movie.vote_average.toFixed(1)}
            </p>
          </li>
        )
      })}
    </ul>
  )
}

function HomePage() {
  return (
    <PageShell
      eyebrow="Fictional AI & Robotics Archive"
      title="Synthetic Intelligence"
      description="Design system preview. The Command Center replaces this page in the next step."
    >
      <section>
        <SectionHeader eyebrow="Live · TMDB" title="API check" />
        <ApiCheck />
      </section>

      <section className="mt-12">
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
