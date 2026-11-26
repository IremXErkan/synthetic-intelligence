import { useCallback, useMemo, useState } from 'react'
import { Globe } from 'lucide-react'
import { discoverTheme, isInArchive, searchMedia } from '../../services/tmdb.js'
import useFetch from '../../hooks/useFetch.js'
import useArchiveQuery from '../../hooks/useArchiveQuery.js'
import useDocumentTitle from '../../hooks/useDocumentTitle.js'
import { buildArchiveQuery } from '../../config/archiveFilters.js'
import PageShell from '../layout/PageShell.jsx'
import HudPanel from '../common/HudPanel.jsx'
import SearchBar from '../common/SearchBar.jsx'
import FilterBar from '../common/FilterBar.jsx'
import ErrorState from '../common/ErrorState.jsx'
import EmptyState from '../common/EmptyState.jsx'
import { SkeletonCard, SkeletonGrid } from '../common/Skeleton.jsx'
import MediaCard from './MediaCard.jsx'

const MIN_QUERY_LENGTH = 2
const TMDB_MAX_PAGE = 500 // TMDB rejects page numbers above 500

const GRID = 'grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5'

/** Cards for one result page. */
function ResultCards({ results, mediaType, searching, page }) {
  return results.map((item) => (
    // page in the key: TMDB ordering can shift between requests and repeat an ID.
    <li key={`${page}-${item.id}`}>
      <MediaCard item={item} mediaType={mediaType} inArchive={searching && isInArchive(mediaType, item.id)} />
    </li>
  ))
}

/** Page 2..N, appended by "Load more". Each page has its own loading/error state. */
function ExtraPage({ page, fetchPage, mediaType, searching }) {
  const fetcher = useCallback((signal) => fetchPage(page, signal), [fetchPage, page])
  const { data, error, loading, retry } = useFetch(fetcher)

  if (loading) {
    return Array.from({ length: 5 }, (_, i) => (
      <li key={`loading-${page}-${i}`} aria-hidden="true">
        <SkeletonCard />
      </li>
    ))
  }
  if (error) {
    return (
      <li className="col-span-full">
        <ErrorState error={error} title={`Page ${page} failed to load`} onRetry={retry} />
      </li>
    )
  }
  return <ResultCards results={data.results} mediaType={mediaType} searching={searching} page={page} />
}

/**
 * Shared list page for /movies and /series.
 * Archive mode: theme discover query with filters. Search mode (q ≥ 2 chars):
 * /search/{type} across all of TMDB; filters are disabled because the search
 * endpoint does not support them.
 */
function MediaArchive({ mediaType, code, eyebrow, title, description, unitLabel }) {
  const { state, setFilter, setQuery, resetFilters, isFiltered } = useArchiveQuery(mediaType)
  const searching = state.q.length >= MIN_QUERY_LENGTH
  useDocumentTitle(searching ? `“${state.q}” · ${title}` : title)

  const archiveQuery = useMemo(() => buildArchiveQuery(mediaType, state), [mediaType, state])
  const queryKey = searching ? `search:${state.q}` : `archive:${JSON.stringify(archiveQuery)}`

  const fetchPage = useCallback(
    (page, signal) =>
      searching
        ? searchMedia(mediaType, state.q, { page }, { signal })
        : discoverTheme(mediaType, { ...archiveQuery, page }, { signal }),
    [searching, mediaType, state.q, archiveQuery],
  )

  // Number of loaded pages, reset to 1 whenever the query changes (no effect needed:
  // a count stored for another query key is simply ignored).
  const [loaded, setLoaded] = useState({ key: queryKey, count: 1 })
  const pageCount = loaded.key === queryKey ? loaded.count : 1

  const firstPageFetcher = useCallback((signal) => fetchPage(1, signal), [fetchPage])
  const first = useFetch(firstPageFetcher)

  const totalPages = Math.min(first.data?.total_pages ?? 0, TMDB_MAX_PAGE)
  const hasMore = pageCount < totalPages

  let results
  if (first.loading) {
    results = <SkeletonGrid count={10} label={`Loading ${unitLabel}`} />
  } else if (first.error) {
    results = <ErrorState error={first.error} onRetry={first.retry} />
  } else if (first.data.results.length === 0) {
    results = searching ? (
      <EmptyState title={`No TMDB ${unitLabel} match “${state.q}”`} message="Check the spelling or try a shorter title.">
        <button type="button" onClick={() => setQuery('')} className="label-mono text-signal hover:underline">
          Clear search
        </button>
      </EmptyState>
    ) : (
      <EmptyState title="No records match these filters" message="Try another decade or genre, or turn subclasses back on.">
        <button type="button" onClick={resetFilters} className="label-mono text-signal hover:underline">
          Reset filters
        </button>
      </EmptyState>
    )
  } else {
    results = (
      <>
        <ul className={GRID}>
          <ResultCards results={first.data.results} mediaType={mediaType} searching={searching} page={1} />
          {Array.from({ length: pageCount - 1 }, (_, i) => (
            <ExtraPage key={`${queryKey}-${i + 2}`} page={i + 2} fetchPage={fetchPage} mediaType={mediaType} searching={searching} />
          ))}
        </ul>
        <div className="mt-8 text-center">
          {hasMore ? (
            <button
              type="button"
              onClick={() => setLoaded({ key: queryKey, count: pageCount + 1 })}
              className="chamfer bg-signal/15 px-6 py-2.5 text-sm font-semibold text-signal transition-colors [--cut:8px] hover:bg-signal/25"
            >
              Load more
            </button>
          ) : (
            <p className="label-mono text-ink-muted">End of {searching ? 'results' : 'archive'}</p>
          )}
        </div>
      </>
    )
  }

  const total = first.data?.total_results

  return (
    <PageShell code={code} eyebrow={eyebrow} title={title} description={description}>
      <HudPanel variant="data" title="Control panel" titleAs="h2" bodyClassName="space-y-6 p-5 sm:p-6">
        <SearchBar
          value={state.q}
          onSearch={setQuery}
          label={`Search ${unitLabel}`}
          placeholder={`Title, e.g. ${mediaType === 'movie' ? 'Ex Machina' : 'Westworld'}`}
        />
        {state.q.length > 0 && !searching && (
          <p className="-mt-4 text-xs text-ink-muted">Type at least {MIN_QUERY_LENGTH} characters to search.</p>
        )}
        <FilterBar
          mediaType={mediaType}
          state={state}
          onChange={setFilter}
          onReset={resetFilters}
          isFiltered={isFiltered}
          disabled={searching}
        />
        {searching && <p className="text-xs text-ink-muted">Filters apply to the archive view. Clear the search to use them.</p>}
      </HudPanel>

      {/* Results header */}
      <div className="mb-5 mt-10 flex flex-wrap items-end justify-between gap-3 border-b border-line pb-3" aria-live="polite">
        <p className="label-mono text-ink">
          {searching ? 'Search results' : 'Records found'}:{' '}
          <span className="text-signal">{total === undefined ? '…' : total.toLocaleString('en-US')}</span>
        </p>
        {searching && (
          <p className="inline-flex items-center gap-2 text-xs text-threat-moderate">
            <Globe className="size-4" aria-hidden="true" />
            Searching all of TMDB, not only the archive. “In archive” marks titles seen in archive lists during this visit.
          </p>
        )}
      </div>

      {results}
    </PageShell>
  )
}

export default MediaArchive
