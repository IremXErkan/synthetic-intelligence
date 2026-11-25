import { Link } from 'react-router'
import { discoverLatestTheme } from '../../services/tmdb.js'
import useFetch from '../../hooks/useFetch.js'
import { formatDate, getReleaseDate, getTitle } from '../../utils/media.js'
import HudPanel from '../common/HudPanel.jsx'
import ErrorState from '../common/ErrorState.jsx'
import { SkeletonBlock } from '../common/Skeleton.jsx'

const FEED_SIZE = 6

// Newest released theme films and series merged into one list, newest first.
// Module-level fetcher → stable identity → fetched once per mount.
async function fetchLatest(signal) {
  const [movies, series] = await Promise.all([
    discoverLatestTheme('movie', { signal }),
    discoverLatestTheme('tv', { signal }),
  ])
  const tag = (type) => (item) => ({ ...item, mediaType: type })
  return [...movies.results.map(tag('movie')), ...series.results.map(tag('tv'))]
    .sort((a, b) => (getReleaseDate(b) ?? '').localeCompare(getReleaseDate(a) ?? ''))
    .slice(0, FEED_SIZE)
}

function LatestFeed() {
  const { data, error, loading, retry } = useFetch(fetchLatest)

  let content
  if (loading) {
    content = (
      <div role="status" aria-label="Loading latest releases" className="space-y-4">
        {Array.from({ length: FEED_SIZE }, (_, i) => (
          <SkeletonBlock key={i} className="h-10 w-full" />
        ))}
      </div>
    )
  } else if (error) {
    content = <ErrorState error={error} onRetry={retry} />
  } else if (data.length === 0) {
    content = <p className="text-sm text-ink-muted">No released titles found.</p>
  } else {
    content = (
      <ol className="divide-y divide-line">
        {data.map((item) => (
          <li key={`${item.mediaType}-${item.id}`}>
            <Link
              to={`/media/${item.mediaType}/${item.id}`}
              className="group flex items-start gap-3 py-3 first:pt-0 last:pb-0"
            >
              <span
                className={`label-mono mt-0.5 w-14 shrink-0 text-[0.6875rem] ${item.mediaType === 'movie' ? 'text-signal' : 'text-threat-low'}`}
              >
                {item.mediaType === 'movie' ? 'Film' : 'Series'}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium text-ink group-hover:text-signal">
                  {getTitle(item)}
                </span>
                <span className="font-mono text-xs text-ink-muted">
                  {formatDate(getReleaseDate(item)) ?? 'Date unknown'}
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ol>
    )
  }

  return (
    <HudPanel variant="data" title="Latest intelligence feed" className="h-full" bodyClassName="p-5">
      <p className="mb-4 text-xs text-ink-muted">Newest released titles in the archive · live from TMDB</p>
      {content}
    </HudPanel>
  )
}

export default LatestFeed
