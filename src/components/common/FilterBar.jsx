import { useCallback, useId } from 'react'
import { RotateCcw } from 'lucide-react'
import { getGenres } from '../../services/tmdb.js'
import useFetch from '../../hooks/useFetch.js'
import { THEME_GROUPS, THEME_GROUP_KEYS, TV_EXCLUDED_GENRES } from '../../config/themeKeywords.js'
import { MIN_VOTE_COUNT, SORT_OPTIONS, getDecades } from '../../config/archiveFilters.js'

const SELECT_CLASS = 'w-full border border-line-strong bg-void px-3 py-2 text-sm text-ink focus:border-signal disabled:opacity-50'

function Field({ label, children }) {
  const id = useId()
  return (
    <div>
      <label htmlFor={id} className="label-mono mb-2 block text-ink-muted">
        {label}
      </label>
      {children(id)}
    </div>
  )
}

/**
 * "Control panel" for the theme archive: subclass toggles, genre, decade,
 * sort and the low-vote switch. `disabled` greys it out in search mode.
 */
function FilterBar({ mediaType, state, onChange, onReset, isFiltered, disabled }) {
  const genreFetcher = useCallback((signal) => getGenres(mediaType, { signal }), [mediaType])
  const genres = useFetch(genreFetcher)

  const toggleGroup = (key) => {
    const active = state.groups.includes(key)
    if (active && state.groups.length === 1) return // keep at least one subclass
    const next = active ? state.groups.filter((g) => g !== key) : THEME_GROUP_KEYS.filter((g) => g === key || state.groups.includes(g))
    onChange('groups', next)
  }

  return (
    <fieldset disabled={disabled} className="min-w-0 space-y-5 disabled:opacity-60">
      <legend className="sr-only">Archive filters</legend>

      {/* Subclass toggles (keyword groups) */}
      <div>
        <p className="label-mono mb-2 text-ink-muted" id={`${mediaType}-subclass`}>
          Subclass
        </p>
        <div role="group" aria-labelledby={`${mediaType}-subclass`} className="flex flex-wrap gap-2">
          {THEME_GROUP_KEYS.map((key) => {
            const active = state.groups.includes(key)
            return (
              <button
                key={key}
                type="button"
                aria-pressed={active}
                onClick={() => toggleGroup(key)}
                className={`chamfer label-mono px-3 py-2 transition-colors [--cut:6px] ${
                  active ? 'bg-signal/20 text-signal' : 'bg-line text-ink-muted hover:text-ink'
                }`}
              >
                <span aria-hidden="true">{active ? '■ ' : '□ '}</span>
                {THEME_GROUPS[key].label}
              </button>
            )
          })}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Genre">
          {(id) => (
            <select
              id={id}
              className={SELECT_CLASS}
              value={state.genre ?? ''}
              onChange={(event) => onChange('genre', Number(event.target.value) || null)}
              disabled={disabled || genres.loading || Boolean(genres.error)}
            >
              <option value="">{genres.error ? 'Genres unavailable' : 'All genres'}</option>
              {/* Genres the archive always excludes (TV Kids) would only ever return 0 results. */}
              {genres.data?.genres
                .filter((genre) => mediaType !== 'tv' || !TV_EXCLUDED_GENRES.includes(genre.id))
                .map((genre) => (
                <option key={genre.id} value={genre.id}>
                  {genre.name}
                </option>
              ))}
            </select>
          )}
        </Field>

        <Field label="Decade">
          {(id) => (
            <select
              id={id}
              className={SELECT_CLASS}
              value={state.decade ?? ''}
              onChange={(event) => onChange('decade', Number(event.target.value) || null)}
            >
              <option value="">All decades</option>
              {getDecades(mediaType).map((decade) => (
                <option key={decade} value={decade}>
                  {decade}s
                </option>
              ))}
            </select>
          )}
        </Field>

        <Field label="Sort by">
          {(id) => (
            <select id={id} className={SELECT_CLASS} value={state.sort} onChange={(event) => onChange('sort', event.target.value)}>
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          )}
        </Field>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-ink-muted">
          <input
            type="checkbox"
            checked={state.lowVotes}
            onChange={(event) => onChange('lowVotes', event.target.checked)}
            className="size-4 accent-signal"
          />
          Include low-vote titles
          {state.lowVotes && state.sort === 'rating' && (
            <span className="text-xs text-threat-moderate">(rating sort still requires {MIN_VOTE_COUNT}+ votes)</span>
          )}
        </label>

        {isFiltered && (
          <button type="button" onClick={onReset} className="label-mono inline-flex items-center gap-2 text-signal hover:underline">
            <RotateCcw className="size-3.5" aria-hidden="true" />
            Reset filters
          </button>
        )}
      </div>
    </fieldset>
  )
}

export default FilterBar
