import { useMemo } from 'react'
import { useSearchParams } from 'react-router'
import { fetchCatalogProductions } from '../services/catalog.js'
import useFetch from '../hooks/useFetch.js'
import useDocumentTitle from '../hooks/useDocumentTitle.js'
import { getReleaseDate } from '../utils/media.js'
import { ENTITIES, ENTITY_TYPES, THREAT_LEVELS } from '../data/entities.js'
import PageShell from '../components/layout/PageShell.jsx'
import HudPanel from '../components/common/HudPanel.jsx'
import SearchBar from '../components/common/SearchBar.jsx'
import EmptyState from '../components/common/EmptyState.jsx'
import EntityCard from '../components/entity/EntityCard.jsx'

const SELECT_CLASS = 'w-full border border-line-strong bg-void px-3 py-2 text-sm text-ink focus:border-signal'

// Only types that actually occur in the catalog are offered.
const TYPE_OPTIONS = [...new Set(ENTITIES.map((entity) => entity.entityType))]
const MEDIA_OPTIONS = [
  { value: 'all', label: 'Films & series' },
  { value: 'movie', label: 'Films' },
  { value: 'tv', label: 'Series' },
]
const SORT_OPTIONS = [
  { value: 'catalog', label: 'File number' },
  { value: 'name', label: 'Name' },
  { value: 'threat', label: 'Threat level (high first)' },
  { value: 'date', label: 'First appearance (oldest first)' },
]


function useEntityFilters() {
  const [searchParams, setSearchParams] = useSearchParams()
  const filters = useMemo(() => {
    const type = searchParams.get('type')
    const media = searchParams.get('media')
    const sort = searchParams.get('sort')
    return {
      q: searchParams.get('q')?.trim() ?? '',
      type: TYPE_OPTIONS.includes(type) ? type : 'all',
      media: MEDIA_OPTIONS.some((o) => o.value === media) ? media : 'all',
      sort: SORT_OPTIONS.some((o) => o.value === sort) ? sort : 'catalog',
    }
  }, [searchParams])

  const write = (next, replace = false) => {
    const params = new URLSearchParams()
    if (next.q) params.set('q', next.q)
    if (next.type !== 'all') params.set('type', next.type)
    if (next.media !== 'all') params.set('media', next.media)
    if (next.sort !== 'catalog') params.set('sort', next.sort)
    setSearchParams(params, { replace })
  }

  return { filters, write }
}

function EntitiesPage() {
  useDocumentTitle('Intelligence Database')
  const { filters, write } = useEntityFilters()
  const productions = useFetch(fetchCatalogProductions)

  const visible = useMemo(() => {
    const needle = filters.q.toLowerCase()
    const list = ENTITIES.filter((entity) => {
      if (filters.type !== 'all' && entity.entityType !== filters.type) return false
      if (filters.media !== 'all' && entity.media.type !== filters.media) return false
      if (needle) {
        const names = [entity.name, ...entity.aliases].join(' ').toLowerCase()
        if (!names.includes(needle)) return false
      }
      return true
    })

    const releaseDate = (entity) => getReleaseDate(productions.data?.[entity.slug]?.media) ?? '9999'
    const sorters = {
      catalog: () => 0,
      name: (a, b) => a.name.localeCompare(b.name),
      threat: (a, b) => THREAT_LEVELS.indexOf(b.threatLevel) - THREAT_LEVELS.indexOf(a.threatLevel),
      date: (a, b) => releaseDate(a).localeCompare(releaseDate(b)),
    }
    return [...list].sort(sorters[filters.sort])
  }, [filters, productions.data])

  const isFiltered = filters.q || filters.type !== 'all' || filters.media !== 'all'
  const failed = productions.data ? Object.values(productions.data).filter((p) => p.error).length : 0

  return (
    <PageShell
      code="SEC-04"
      eyebrow="Intelligence Database"
      title="Entities"
      description="Classified dossiers on notable synthetic minds. Production data is live from TMDB; classification, capabilities and threat levels are the archive's editorial analysis."
    >
      <HudPanel variant="editorial" title="Database query" titleAs="h2" bodyClassName="space-y-5 p-5 sm:p-6">
        <SearchBar
          value={filters.q}
          onSearch={(q) => write({ ...filters, q }, true)}
          label="Search by name or alias"
          placeholder="e.g. HAL, Jarvis, Data"
        />
        <div className="grid gap-4 sm:grid-cols-3">
          <label className="block">
            <span className="label-mono mb-2 block text-ink-muted">Entity type</span>
            <select className={SELECT_CLASS} value={filters.type} onChange={(e) => write({ ...filters, type: e.target.value })}>
              <option value="all">All types</option>
              {TYPE_OPTIONS.map((type) => (
                <option key={type} value={type}>
                  {ENTITY_TYPES[type]}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="label-mono mb-2 block text-ink-muted">Appears in</span>
            <select className={SELECT_CLASS} value={filters.media} onChange={(e) => write({ ...filters, media: e.target.value })}>
              {MEDIA_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="label-mono mb-2 block text-ink-muted">Sort by</span>
            <select className={SELECT_CLASS} value={filters.sort} onChange={(e) => write({ ...filters, sort: e.target.value })}>
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>
        {filters.sort === 'date' && productions.loading && (
          <p className="text-xs text-ink-muted">Waiting for TMDB release dates to sort…</p>
        )}
      </HudPanel>

      <div className="mb-5 mt-10 flex flex-wrap items-end justify-between gap-3 border-b border-line pb-3" aria-live="polite">
        <p className="label-mono text-ink">
          Dossiers on file: <span className="text-pulse">{visible.length}</span> / {ENTITIES.length}
        </p>
        {failed > 0 && (
          <p className="text-xs text-threat-moderate" role="alert">
            Production data for {failed} {failed === 1 ? 'dossier' : 'dossiers'} could not be loaded.{' '}
            <button type="button" onClick={productions.retry} className="underline hover:text-ink">
              Retry
            </button>
          </p>
        )}
      </div>

      {visible.length === 0 ? (
        <EmptyState title="No dossiers match" message="Try another name, type or media filter.">
          {isFiltered && (
            <button type="button" onClick={() => write({ q: '', type: 'all', media: 'all', sort: filters.sort })} className="label-mono text-signal hover:underline">
              Clear filters
            </button>
          )}
        </EmptyState>
      ) : (
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((entity) => {
            const production = productions.data?.[entity.slug]
            return (
              <li key={entity.slug}>
                <EntityCard entity={entity} media={production?.media ?? null} mediaError={productions.error ?? production?.error} />
              </li>
            )
          })}
        </ul>
      )}
    </PageShell>
  )
}

export default EntitiesPage
