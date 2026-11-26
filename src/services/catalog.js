// Live TMDB records for every dossier's production (10 requests, cached and
// shared by /entities, /network and the dossier pages). allSettled: one failed
// production only affects its own card/node.

import { getMediaDetails } from './tmdb.js'
import { ENTITIES } from '../data/entities.js'

/** @returns {Promise<Record<string, { media?: object, error?: Error }>>} keyed by entity slug */
export async function fetchCatalogProductions(signal) {
  const results = await Promise.allSettled(
    ENTITIES.map((entity) => getMediaDetails(entity.media.type, entity.media.tmdbId, {}, { signal })),
  )
  if (signal?.aborted) throw new DOMException('Aborted', 'AbortError')
  return Object.fromEntries(
    ENTITIES.map((entity, i) => [
      entity.slug,
      results[i].status === 'fulfilled' ? { media: results[i].value } : { error: results[i].reason },
    ]),
  )
}
