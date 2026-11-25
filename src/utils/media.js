// Small helpers that hide the movie/TV field-name differences (verified):
// movie → title, release_date   |   tv → name, first_air_date

export function getTitle(item) {
  return item?.title ?? item?.name ?? 'Untitled'
}

export function getReleaseDate(item) {
  return item?.release_date || item?.first_air_date || null
}

/** Four-digit year, or null when TMDB has no date. */
export function getYear(item) {
  return getReleaseDate(item)?.slice(0, 4) || null
}

const dateFormatter = new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })

/** "2014-11-04" → "04 Nov 2014". Parsed as UTC so the day never shifts. */
export function formatDate(isoDate) {
  if (!isoDate) return null
  const [year, month, day] = isoDate.split('-').map(Number)
  return dateFormatter.format(new Date(Date.UTC(year, month - 1, day)))
}
