// List-page filter definitions and the mapping from URL state to a TMDB query.
// Param names verified against /discover/movie and /discover/tv (2026-11-25).

import { MIN_VOTE_COUNT, THEME_GROUP_KEYS } from './themeKeywords.js'

// Release-date field names differ between movies and TV.
export const RELEASE_FIELD = { movie: 'primary_release_date', tv: 'first_air_date' }

export const SORT_OPTIONS = [
  { value: 'popularity', label: 'Popularity' },
  { value: 'rating', label: 'Rating' },
  { value: 'date', label: 'Release date' },
]

// Oldest archive titles at verification: The Doll (1919), The Twilight Zone (1959).
const FIRST_DECADE = { movie: 1910, tv: 1950 }

export function getDecades(mediaType) {
  const decades = []
  const current = Math.floor(new Date().getFullYear() / 10) * 10
  for (let decade = current; decade >= FIRST_DECADE[mediaType]; decade -= 10) decades.push(decade)
  return decades
}

/** Default URL state: these values are never written to the URL. */
export const DEFAULT_FILTERS = {
  q: '',
  groups: THEME_GROUP_KEYS,
  genre: null,
  decade: null,
  sort: 'popularity',
  lowVotes: false,
}

/**
 * Turns list-page state into discoverTheme() arguments.
 * - rating sort always keeps the vote threshold (otherwise 1-vote 10.0 titles win)
 * - date sort never returns titles released after today
 */
export function buildArchiveQuery(mediaType, { groups, genre, decade, sort, lowVotes }) {
  const field = RELEASE_FIELD[mediaType]
  const filters = {}

  if (genre) filters.with_genres = genre
  if (decade) {
    filters[`${field}.gte`] = `${decade}-01-01`
    filters[`${field}.lte`] = `${decade + 9}-12-31`
  }

  let sortBy = 'popularity.desc'
  if (sort === 'rating') sortBy = 'vote_average.desc'
  if (sort === 'date') {
    sortBy = `${field}.desc`
    const today = new Date().toISOString().slice(0, 10)
    if (!filters[`${field}.lte`] || filters[`${field}.lte`] > today) filters[`${field}.lte`] = today
  }

  return {
    groups,
    includeLowVotes: lowVotes && sort !== 'rating',
    sort: sortBy,
    filters,
  }
}

export { MIN_VOTE_COUNT }
