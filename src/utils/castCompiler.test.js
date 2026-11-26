import { describe, expect, it } from 'vitest'
import { TOP_BILLED, compileCast, filterCast, getSyntheticReason } from './castCompiler.js'

// Small hand-made credits in the two TMDB shapes (movie credits / TV aggregate_credits).
const film = (id, title, cast) => ({ production: { mediaType: 'movie', id, title, year: '2000' }, credits: { cast } })
const series = (id, title, cast) => ({ production: { mediaType: 'tv', id, title, year: '2010' }, credits: { cast } })
const actor = (id, name, character, order) => ({ id, name, character, order, profile_path: null, known_for_department: 'Acting' })

describe('getSyntheticReason', () => {
  it('matches dossier characters by person + production (HAL 9000: person 253, movie 62)', () => {
    expect(getSyntheticReason(253, { character: 'HAL 9000 (voice)', mediaType: 'movie', mediaId: 62 })).toBe('dossier')
  })

  it('matches machine terms in character names', () => {
    expect(getSyntheticReason(1, { character: 'T-1000', mediaType: 'movie', mediaId: 1 })).toBe('term')
    expect(getSyntheticReason(1, { character: "Ship's Computer (voice)", mediaType: 'movie', mediaId: 1 })).toBe('term')
    expect(getSyntheticReason(1, { character: 'The A.I. Unit', mediaType: 'movie', mediaId: 1 })).toBe('term')
  })

  it('does not match rejected noise ("(voice)" alone, "host")', () => {
    expect(getSyntheticReason(1, { character: 'Max (voice)', mediaType: 'movie', mediaId: 1 })).toBeNull()
    expect(getSyntheticReason(1, { character: 'Self - Host', mediaType: 'tv', mediaId: 1 })).toBeNull()
  })
})

describe('compileCast', () => {
  it('merges the same person across productions into one entry', () => {
    const people = compileCast([
      film(1, 'Blade Runner', [actor(10, 'Harrison Ford', 'Deckard', 0)]),
      film(2, 'Star Wars', [actor(10, 'Harrison Ford', 'Han Solo', 1), actor(11, 'Mark Hamill', 'Luke', 0)]),
    ])
    expect(people).toHaveLength(2)
    expect(people[0].name).toBe('Harrison Ford') // most roles first
    expect(people[0].roles.map((role) => role.character)).toEqual(['Deckard', 'Han Solo'])
  })

  it(`keeps only the top ${TOP_BILLED} billed members per production`, () => {
    const cast = Array.from({ length: 12 }, (_, i) => actor(100 + i, `Actor ${i}`, `Role ${i}`, i))
    expect(compileCast([film(1, 'Big Film', cast)])).toHaveLength(TOP_BILLED)
  })

  it('reads TV character names from aggregate_credits roles', () => {
    const [dolores] = compileCast([
      series(63247, 'Westworld', [{ ...actor(38940, 'Evan Rachel Wood', undefined, 0), roles: [{ character: 'Dolores Abernathy' }, { character: 'Christina' }] }]),
    ])
    expect(dolores.roles[0].character).toBe('Dolores Abernathy / Christina')
    expect(dolores.isSynthetic).toBe(true) // dossier match
  })

  it('skips productions whose credits failed to load', () => {
    expect(compileCast([{ production: { mediaType: 'movie', id: 1 }, error: new Error('x') }])).toEqual([])
  })
})

describe('filterCast', () => {
  const people = compileCast([
    film(1, 'Terminator 2', [actor(20, 'Robert Patrick', 'T-1000', 0), actor(21, 'Linda Hamilton', 'Sarah Connor', 1)]),
    series(2, 'Some Show', [{ ...actor(22, 'Linda Park', undefined, 0), roles: [{ character: 'Pilot' }] }]),
  ])

  it('filters by name, case-insensitively (order follows billing: Park 0, Hamilton 1)', () => {
    expect(filterCast(people, { q: 'linda' }).map((p) => p.name)).toEqual(['Linda Park', 'Linda Hamilton'])
  })

  it('filters by media type', () => {
    expect(filterCast(people, { type: 'tv' }).map((p) => p.name)).toEqual(['Linda Park'])
  })

  it('keeps only probable synthetic characters', () => {
    expect(filterCast(people, { synthetic: true }).map((p) => p.name)).toEqual(['Robert Patrick'])
  })
})
