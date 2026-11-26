// Live TMDB records for every dossier's production (10 requests, cached and
// shared by /entities, /network and the dossier pages). allSettled: one failed
// production only affects its own card/node.

import { getMediaDetails, getPerson } from './tmdb.js'
import { ENTITIES } from '../data/entities.js'
import { CREDITS_APPEND } from '../utils/dossier.js'

/**
 * Everything a dossier needs from TMDB: the production (with credits, to check
 * the character match) and the credited performer, if any. Shared by
 * /entity/:slug and the intro (same URLs → same cache entries).
 */
export async function fetchDossierRecord(entity, signal) {
  const [media, person] = await Promise.all([
    getMediaDetails(entity.media.type, entity.media.tmdbId, { append: CREDITS_APPEND[entity.media.type] }, { signal }),
    entity.creditPersonId ? getPerson(entity.creditPersonId, {}, { signal }) : null,
  ])
  return { media, person }
}

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
