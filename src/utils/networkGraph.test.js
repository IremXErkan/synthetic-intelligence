import { describe, expect, it } from 'vitest'
import { buildNetworkGraph, entityNodeId, productionNodeId } from './networkGraph.js'
import { ENTITIES } from '../data/entities.js'

const entity = (slug, type, tmdbId, related = []) => ({ slug, media: { type, tmdbId }, related })

describe('buildNetworkGraph', () => {
  it('creates one node per entity and per unique production', () => {
    const { nodes } = buildNetworkGraph([entity('a', 'movie', 1), entity('b', 'movie', 1), entity('c', 'tv', 2)])
    expect(nodes.filter((n) => n.type === 'entity')).toHaveLength(3)
    expect(nodes.filter((n) => n.type === 'production').map((n) => n.id)).toEqual(['media-movie-1', 'media-tv-2'])
  })

  it('links every entity to its production with a source edge', () => {
    const { edges } = buildNetworkGraph([entity('a', 'movie', 1)])
    expect(edges).toEqual([
      { id: 'source-a', source: entityNodeId('a'), target: productionNodeId({ type: 'movie', tmdbId: 1 }), data: { kind: 'source' } },
    ])
  })

  it('keeps each editorial relation once and ignores unknown slugs', () => {
    const { edges } = buildNetworkGraph([
      entity('a', 'movie', 1, ['b', 'ghost']),
      entity('b', 'movie', 2, ['a']),
    ])
    const editorial = edges.filter((edge) => edge.data.kind === 'editorial')
    expect(editorial.map((edge) => edge.id)).toEqual(['editorial-a|b'])
  })

  it('builds the real catalog: 10 entities, 10 productions, 10 source edges', () => {
    const { nodes, edges } = buildNetworkGraph(ENTITIES)
    expect(nodes).toHaveLength(20)
    expect(edges.filter((edge) => edge.data.kind === 'source')).toHaveLength(10)
    expect(edges.filter((edge) => edge.data.kind === 'editorial').length).toBeGreaterThan(0)
  })
})
