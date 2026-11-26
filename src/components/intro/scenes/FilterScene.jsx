import { useCallback, useEffect, useState } from 'react'
import { discoverTheme } from '../../../services/tmdb.js'
import useFetch from '../../../hooks/useFetch.js'
import { THEME_GROUP_KEYS } from '../../../config/themeKeywords.js'
import { DEFAULT_FILTERS } from '../../../config/archiveFilters.js'
import FilterBar from '../../common/FilterBar.jsx'
import ScaledPreview from './ScaledPreview.jsx'

const noop = () => {}

/**
 * Scene 4 — the real /movies filter bar. Subclass toggles switch on one by one,
 * and the record count is the live TMDB total for the groups lit so far.
 */
function FilterScene({ reduceMotion }) {
  const [lit, setLit] = useState(reduceMotion ? THEME_GROUP_KEYS.length : 1)

  useEffect(() => {
    if (reduceMotion) return undefined
    const id = setInterval(() => setLit((n) => (n >= THEME_GROUP_KEYS.length ? n : n + 1)), 900)
    return () => clearInterval(id)
  }, [reduceMotion])

  const groups = THEME_GROUP_KEYS.slice(0, lit)
  const fetcher = useCallback(
    (signal) => discoverTheme('movie', { groups: THEME_GROUP_KEYS.slice(0, lit) }, { signal }),
    [lit],
  )
  const total = useFetch(fetcher)

  return (
    <div className="flex h-full flex-col justify-center gap-5">
      <ScaledPreview scale={0.75} className="h-60 sm:h-56">
        <div className="max-w-4xl border border-holo/30 bg-panel/70 p-5">
          <FilterBar
            mediaType="movie"
            state={{ ...DEFAULT_FILTERS, groups }}
            onChange={noop}
            onReset={noop}
            isFiltered={false}
            disabled={false}
          />
        </div>
      </ScaledPreview>
      <p className="label-mono text-ink">
        Records found:{' '}
        <span className="font-mono text-2xl text-holo">{total.data ? total.data.total_results.toLocaleString('en-US') : '…'}</span>
        <span className="ml-3 text-ink-muted">classes: {groups.join(' + ')}</span>
      </p>
    </div>
  )
}

export default FilterScene
