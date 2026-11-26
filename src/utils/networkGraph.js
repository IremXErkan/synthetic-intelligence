// Builds the Intelligence Network graph from the dossier catalog (no separate
// hand-written graph data):
//   entity nodes      → one per dossier (editorial)
//   production nodes  → the dossier's TMDB production (label filled live from TMDB)
//   source edges      → entity → production, backed by a verified TMDB ID (solid)
//   editorial edges   → entity ↔ entity from `related` (dashed)

import { ENTITIES } from '../data/entities.js'

const ENTITY_RADIUS = 250
const PRODUCTION_RADIUS = 460

export const productionNodeId = (media) => `media-${media.type}-${media.tmdbId}`
export const entityNodeId = (slug) => `entity-${slug}`

function onCircle(radius, angle) {
  return { x: Math.round(radius * Math.cos(angle)), y: Math.round(radius * Math.sin(angle)) }
}

/**
 * @param {object[]} entities dossier catalog
 * @returns {{ nodes: object[], edges: object[] }} React Flow nodes/edges (positions included)
 */
export function buildNetworkGraph(entities) {
  const nodes = []
  const edges = []
  const seenProductions = new Set()

  entities.forEach((entity, index) => {
    // Start at the top and go clockwise; each production sits outside its entity.
    const angle = -Math.PI / 2 + (index / entities.length) * 2 * Math.PI
    const entityId = entityNodeId(entity.slug)
    const productionId = productionNodeId(entity.media)

    nodes.push({ id: entityId, type: 'entity', position: onCircle(ENTITY_RADIUS, angle), data: { entity } })

    if (!seenProductions.has(productionId)) {
      seenProductions.add(productionId)
      nodes.push({
        id: productionId,
        type: 'production',
        position: onCircle(PRODUCTION_RADIUS, angle),
        data: { mediaType: entity.media.type, tmdbId: entity.media.tmdbId },
      })
    }

    edges.push({ id: `source-${entity.slug}`, source: entityId, target: productionId, data: { kind: 'source' } })
  })

  // Editorial relations are often listed on both sides; keep each pair once.
  const seenPairs = new Set()
  const slugs = new Set(entities.map((entity) => entity.slug))
  for (const entity of entities) {
    for (const other of entity.related) {
      if (!slugs.has(other) || other === entity.slug) continue
      const pair = [entity.slug, other].sort().join('|')
      if (seenPairs.has(pair)) continue
      seenPairs.add(pair)
      edges.push({
        id: `editorial-${pair}`,
        source: entityNodeId(entity.slug),
        target: entityNodeId(other),
        data: { kind: 'editorial' },
      })
    }
  }

  return { nodes, edges }
}

/** The graph of the real dossier catalog (shared by /network and the intro). */
export const CATALOG_GRAPH = buildNetworkGraph(ENTITIES)

/** TMDB production records keyed by production node id, from fetchCatalogProductions data. */
export function mediaByProductionNode(catalogData) {
  const map = {}
  for (const entity of ENTITIES) {
    const media = catalogData?.[entity.slug]?.media
    if (media) map[productionNodeId(entity.media)] = media
  }
  return map
}
