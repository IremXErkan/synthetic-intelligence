import { discoverTheme } from '../../services/tmdb.js'
import useFetch from '../../hooks/useFetch.js'
import useTmdbStatus from '../../hooks/useTmdbStatus.js'
import StatusDot from '../common/StatusDot.jsx'
import LocalClock from './LocalClock.jsx'

// Module-level fetchers have a stable identity, so useFetch runs them once.
// They call discoverTheme with its defaults: exactly the same query (and cache
// entry) as page 1 of /movies and /series with no filters applied.
const fetchMovieArchive = (signal) => discoverTheme('movie', {}, { signal })
const fetchSeriesArchive = (signal) => discoverTheme('tv', {}, { signal })
const ARCHIVE_FETCHERS = { movie: fetchMovieArchive, tv: fetchSeriesArchive }

/** Live archive total for 'movie' or 'tv' (also used by the Archive Terminal). */
export function ArchiveCount({ mediaType, unit }) {
  const { data, error, loading } = useFetch(ARCHIVE_FETCHERS[mediaType])

  let value
  if (loading) value = '…'
  else if (error) value = 'N/A'
  else value = data.total_results.toLocaleString('en-US')

  return (
    <span className="whitespace-nowrap">
      <span className="font-mono text-xs text-ink tabular-nums">{value}</span>{' '}
      <span className="label-mono text-ink-muted">{unit}</span>
    </span>
  )
}

/** Thin bar under the navbar with real system state (no decorative fake numbers). */
function StatusBar() {
  const status = useTmdbStatus()

  return (
    <div className="border-t border-line/60 bg-panel/60">
      <div className="mx-auto flex h-8 max-w-7xl items-center justify-between gap-4 overflow-hidden px-4 sm:px-6">
        <StatusDot status={status} label="TMDB link" />
        <div className="flex items-center gap-4">
          <span className="label-mono hidden text-ink-muted sm:inline">Archive</span>
          <ArchiveCount mediaType="movie" unit="Films" />
          <ArchiveCount mediaType="tv" unit="Series" />
          <span className="hidden lg:inline-flex">
            <LocalClock />
          </span>
        </div>
      </div>
    </div>
  )
}

export default StatusBar
