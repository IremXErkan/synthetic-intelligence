import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router'
import { Info } from 'lucide-react'
import { fetchCastBatch } from '../services/cast.js'
import useFetch from '../hooks/useFetch.js'
import useDocumentTitle from '../hooks/useDocumentTitle.js'
import { compileCast, filterCast, TOP_BILLED } from '../utils/castCompiler.js'
import PageShell from '../components/layout/PageShell.jsx'
import HudPanel from '../components/common/HudPanel.jsx'
import SearchBar from '../components/common/SearchBar.jsx'
import ErrorState from '../components/common/ErrorState.jsx'
import EmptyState from '../components/common/EmptyState.jsx'
import { SkeletonGrid } from '../components/common/Skeleton.jsx'
import PersonCard from '../components/person/PersonCard.jsx'

const GRID = 'grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5'
const TYPE_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'movie', label: 'Films' },
  { value: 'tv', label: 'Series' },
]

/** Filter state in the URL: ?q=&type=tv&synthetic=1 (defaults omitted). */
function useCastFilters() {
  const [searchParams, setSearchParams] = useSearchParams()
  const filters = useMemo(() => {
    const type = searchParams.get('type')
    return {
      q: searchParams.get('q')?.trim() ?? '',
      type: TYPE_OPTIONS.some((option) => option.value === type) ? type : 'all',
      synthetic: searchParams.get('synthetic') === '1',
    }
  }, [searchParams])

  const write = (next, replace = false) => {
    const params = new URLSearchParams()
    if (next.q) params.set('q', next.q)
    if (next.type !== 'all') params.set('type', next.type)
    if (next.synthetic) params.set('synthetic', '1')
    setSearchParams(params, { replace })
  }

  return { filters, write }
}

function ProgressNote({ progress }) {
  if (!progress || progress.total === 0) return null
  return (
    <p className="label-mono mb-4 text-signal" role="status">
      Compiling credits {progress.done}/{progress.total}…
    </p>
  )
}

function CastPage() {
  useDocumentTitle('Cast Registry')
  const { filters, write } = useCastFilters()
  const [progress, setProgress] = useState(null)

  // Batch 1 loads on mount.
  const fetchFirst = useCallback(
    (signal) => fetchCastBatch(1, { signal, onProgress: (done, total) => setProgress({ page: 1, done, total }) }),
    [],
  )
  const first = useFetch(fetchFirst)

  // Batches 2..N load on "Load more" (event-driven, so they live in their own state).
  const [extra, setExtra] = useState([]) // [{ page, status: 'loading'|'done'|'error', data?, error? }]
  const controllers = useRef(new Set())
  useEffect(() => {
    const active = controllers.current
    return () => active.forEach((controller) => controller.abort())
  }, [])

  const loadBatch = (page) => {
    const controller = new AbortController()
    controllers.current.add(controller)
    setExtra((list) => [...list.filter((b) => b.page !== page), { page, status: 'loading' }].sort((a, b) => a.page - b.page))

    fetchCastBatch(page, {
      signal: controller.signal,
      onProgress: (done, total) => setProgress({ page, done, total }),
    })
      .then((data) => setExtra((list) => list.map((b) => (b.page === page ? { page, status: 'done', data } : b))))
      .catch((error) => {
        if (error?.name !== 'AbortError') {
          setExtra((list) => list.map((b) => (b.page === page ? { page, status: 'error', error } : b)))
        }
      })
      .finally(() => controllers.current.delete(controller))
  }

  const batches = useMemo(
    () => [first.data, ...extra.filter((b) => b.status === 'done').map((b) => b.data)].filter(Boolean),
    [first.data, extra],
  )
  const entries = useMemo(() => batches.flatMap((batch) => batch.entries), [batches])
  const people = useMemo(() => compileCast(entries), [entries])
  const visiblePeople = useMemo(() => filterCast(people, filters), [people, filters])

  const loadedProductions = entries.filter((entry) => entry.credits)
  const filmCount = loadedProductions.filter((entry) => entry.production.mediaType === 'movie').length
  const seriesCount = loadedProductions.length - filmCount
  const failedCount = batches.reduce((sum, batch) => sum + batch.failedCount, 0)

  const lastBatch = extra.at(-1)
  const isLoadingMore = lastBatch?.status === 'loading'
  const lastLoaded = lastBatch?.status === 'done' ? lastBatch.data : extra.length === 0 ? first.data : null
  const hasMore = Boolean(lastLoaded?.hasMore)
  const nextPage = extra.length + 2 // batch 1 is `first`, extra batches are 2..N

  const retryFailed = () => {
    first.retry()
    extra.filter((b) => b.status === 'done' && b.data.failedCount > 0).forEach((b) => loadBatch(b.page))
  }

  let content
  if (first.loading) {
    content = (
      <>
        <ProgressNote progress={progress?.page === 1 ? progress : null} />
        <SkeletonGrid count={10} label="Compiling cast" />
      </>
    )
  } else if (first.error) {
    content = <ErrorState error={first.error} onRetry={first.retry} />
  } else if (visiblePeople.length === 0) {
    content = (
      <EmptyState title="No cast records match" message="Try another name, media type, or turn off the synthetic filter.">
        <button type="button" onClick={() => write({ q: '', type: 'all', synthetic: false })} className="label-mono text-signal hover:underline">
          Clear filters
        </button>
      </EmptyState>
    )
  } else {
    content = (
      <ul className={GRID}>
        {visiblePeople.map((person) => (
          <li key={person.id}>
            <PersonCard person={person} />
          </li>
        ))}
      </ul>
    )
  }

  return (
    <PageShell
      code="SEC-03"
      eyebrow="Cast Registry"
      title="Cast"
      description="The actors and voice artists behind fictional machines, compiled live from the credits of archived productions."
    >
      <HudPanel variant="data" title="Control panel" titleAs="h2" bodyClassName="space-y-5 p-5 sm:p-6">
        <SearchBar
          value={filters.q}
          onSearch={(q) => write({ ...filters, q }, true)}
          label="Search loaded cast by name"
          placeholder="e.g. Alicia Vikander"
        />

        <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
          <div>
            <p className="label-mono mb-2 text-ink-muted" id="cast-type-label">
              Appears in
            </p>
            <div role="group" aria-labelledby="cast-type-label" className="flex gap-2">
              {TYPE_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  aria-pressed={filters.type === option.value}
                  onClick={() => write({ ...filters, type: option.value })}
                  className={`chamfer label-mono px-3 py-2 transition-colors [--cut:6px] ${
                    filters.type === option.value ? 'bg-signal/20 text-signal' : 'bg-line text-ink-muted hover:text-ink'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-ink">
            <input
              type="checkbox"
              checked={filters.synthetic}
              onChange={(event) => write({ ...filters, synthetic: event.target.checked })}
              className="size-4 accent-signal"
            />
            Probable synthetic characters only
          </label>
        </div>

        <p className="flex gap-2 text-xs text-ink-muted">
          <Info className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
          <span>
            Heuristic filter: matches character names containing terms like robot, android, cyborg or AI, plus
            characters from the dossier catalog. It may miss some machines and include a few humans.
          </span>
        </p>
      </HudPanel>

      {/* Results header */}
      <div className="mb-5 mt-10 flex flex-wrap items-end justify-between gap-3 border-b border-line pb-3" aria-live="polite">
        {first.data ? (
          <p className="label-mono text-ink">
            Showing <span className="text-signal">{visiblePeople.length}</span> of {people.length} people
          </p>
        ) : (
          <p className="label-mono text-ink">Compiling…</p>
        )}
        {first.data && (
          <p className="text-xs text-ink-muted">
            Compiled from {loadedProductions.length} archived productions ({filmCount} films · {seriesCount} series),
            top {TOP_BILLED} billed per title.
          </p>
        )}
      </div>

      {failedCount > 0 && (
        <p className="mb-4 text-xs text-threat-moderate" role="alert">
          {failedCount} {failedCount === 1 ? 'production' : 'productions'} could not be loaded.{' '}
          <button type="button" onClick={retryFailed} className="underline hover:text-ink">
            Retry
          </button>
        </p>
      )}

      {content}

      {first.data && (
        <div className="mt-8 text-center">
          {isLoadingMore && <ProgressNote progress={progress?.page === lastBatch.page ? progress : null} />}
          {lastBatch?.status === 'error' && (
            <div className="mb-4">
              <ErrorState error={lastBatch.error} title={`Batch ${lastBatch.page} failed`} onRetry={() => loadBatch(lastBatch.page)} />
            </div>
          )}
          {hasMore && !isLoadingMore && (
            <button
              type="button"
              onClick={() => loadBatch(nextPage)}
              className="chamfer bg-signal/15 px-6 py-2.5 text-sm font-semibold text-signal transition-colors [--cut:8px] hover:bg-signal/25"
            >
              Load more productions
            </button>
          )}
          {!hasMore && !isLoadingMore && lastBatch?.status !== 'error' && (
            <p className="label-mono text-ink-muted">All archived productions compiled</p>
          )}
        </div>
      )}
    </PageShell>
  )
}

export default CastPage
