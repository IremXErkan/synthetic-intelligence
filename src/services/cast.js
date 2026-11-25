// Cast Registry data loading: one "batch" = one theme discover page of films
// plus one of series, then one credits request per production.
// ~42 requests per batch; the concurrency limit in tmdb.js keeps ≤6 in flight,
// and every response is cached, so revisiting the page costs nothing.

import { discoverTheme, getCredits } from './tmdb.js'
import { getTitle, getYear } from '../utils/media.js'

/**
 * @param {number} page discover page for both films and series
 * @param {{ signal?: AbortSignal, onProgress?: (done: number, total: number) => void }} options
 */
export async function fetchCastBatch(page, { signal, onProgress } = {}) {
  const [movies, series] = await Promise.all([
    discoverTheme('movie', { page }, { signal }),
    discoverTheme('tv', { page }, { signal }),
  ])

  const productions = [
    ...movies.results.map((item) => ({ mediaType: 'movie', id: item.id, title: getTitle(item), year: getYear(item) })),
    ...series.results.map((item) => ({ mediaType: 'tv', id: item.id, title: getTitle(item), year: getYear(item) })),
  ]

  let done = 0
  onProgress?.(0, productions.length)

  // One failed production does not fail the batch; it is counted and can be retried.
  const entries = await Promise.all(
    productions.map((production) =>
      getCredits(production.mediaType, production.id, { signal })
        .then((credits) => ({ production, credits }))
        .catch((error) => {
          if (error?.name === 'AbortError') throw error
          return { production, error }
        })
        .finally(() => {
          done += 1
          onProgress?.(done, productions.length)
        }),
    ),
  )

  return {
    page,
    entries,
    failedCount: entries.filter((entry) => entry.error).length,
    hasMore: movies.page < movies.total_pages || series.page < series.total_pages,
  }
}
