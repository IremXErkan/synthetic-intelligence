import { useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router'
import { THEME_GROUP_KEYS } from '../config/themeKeywords.js'
import { DEFAULT_FILTERS, SORT_OPTIONS, getDecades } from '../config/archiveFilters.js'

const SORT_VALUES = SORT_OPTIONS.map((option) => option.value)

/**
 * List-page state stored in the URL query string, so links are shareable and
 * the back button works. Defaults are omitted from the URL; invalid values
 * fall back to defaults.
 *
 *   ?q=robot&groups=ai,android&genre=878&decade=1980&sort=rating&lowvotes=1
 */
export default function useArchiveQuery(mediaType) {
  const [searchParams, setSearchParams] = useSearchParams()

  const state = useMemo(() => {
    const groupsParam = searchParams.get('groups')
    const groups = groupsParam
      ? groupsParam.split(',').filter((key) => THEME_GROUP_KEYS.includes(key))
      : THEME_GROUP_KEYS
    const genre = Number(searchParams.get('genre')) || null
    const decade = Number(searchParams.get('decade'))
    const sort = searchParams.get('sort')

    return {
      q: searchParams.get('q')?.trim() ?? '',
      groups: groups.length > 0 ? groups : THEME_GROUP_KEYS,
      genre,
      decade: getDecades(mediaType).includes(decade) ? decade : null,
      sort: SORT_VALUES.includes(sort) ? sort : DEFAULT_FILTERS.sort,
      lowVotes: searchParams.get('lowvotes') === '1',
    }
  }, [searchParams, mediaType])

  /** Writes a full state object to the URL, leaving defaults out. */
  const writeState = useCallback(
    (next, { replace = false } = {}) => {
      const params = new URLSearchParams()
      if (next.q) params.set('q', next.q)
      if (next.groups.length !== THEME_GROUP_KEYS.length) params.set('groups', next.groups.join(','))
      if (next.genre) params.set('genre', String(next.genre))
      if (next.decade) params.set('decade', String(next.decade))
      if (next.sort !== DEFAULT_FILTERS.sort) params.set('sort', next.sort)
      if (next.lowVotes) params.set('lowvotes', '1')
      setSearchParams(params, { replace })
    },
    [setSearchParams],
  )

  // Filter changes add a history entry (back button undoes them).
  const setFilter = useCallback((key, value) => writeState({ ...state, [key]: value }), [state, writeState])

  // Typing replaces the entry, so each keystroke does not pile up in history.
  const setQuery = useCallback((q) => writeState({ ...state, q }, { replace: true }), [state, writeState])

  const resetFilters = useCallback(() => writeState({ ...DEFAULT_FILTERS, q: state.q }), [state.q, writeState])

  const isFiltered =
    state.groups.length !== THEME_GROUP_KEYS.length ||
    state.genre !== null ||
    state.decade !== null ||
    state.sort !== DEFAULT_FILTERS.sort ||
    state.lowVotes

  return { state, setFilter, setQuery, resetFilters, isFiltered }
}
