import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { buildArchiveQuery, getDecades } from './archiveFilters.js'
import { THEME_GROUP_KEYS } from './themeKeywords.js'

const base = { groups: THEME_GROUP_KEYS, genre: null, decade: null, sort: 'popularity', lowVotes: false }

describe('buildArchiveQuery', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-11-26T12:00:00Z'))
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  it('defaults to popularity with no extra filters', () => {
    expect(buildArchiveQuery('movie', base)).toEqual({
      groups: THEME_GROUP_KEYS,
      includeLowVotes: false,
      sort: 'popularity.desc',
      filters: {},
    })
  })

  it('maps genre and decade to the right field per media type', () => {
    expect(buildArchiveQuery('movie', { ...base, genre: 878, decade: 1980 }).filters).toEqual({
      with_genres: 878,
      'primary_release_date.gte': '1980-01-01',
      'primary_release_date.lte': '1989-12-31',
    })
    expect(buildArchiveQuery('tv', { ...base, decade: 2010 }).filters).toEqual({
      'first_air_date.gte': '2010-01-01',
      'first_air_date.lte': '2019-12-31',
    })
  })

  it('keeps the vote threshold for rating sort even in low-vote mode', () => {
    const query = buildArchiveQuery('movie', { ...base, sort: 'rating', lowVotes: true })
    expect(query.sort).toBe('vote_average.desc')
    expect(query.includeLowVotes).toBe(false)
  })

  it('never returns future titles when sorting by date', () => {
    const query = buildArchiveQuery('tv', { ...base, sort: 'date' })
    expect(query.sort).toBe('first_air_date.desc')
    expect(query.filters['first_air_date.lte']).toBe('2026-11-26')
  })

  it('caps the current decade at today for date sort', () => {
    const query = buildArchiveQuery('movie', { ...base, sort: 'date', decade: 2020 })
    expect(query.filters['primary_release_date.lte']).toBe('2026-11-26')
  })
})

describe('getDecades', () => {
  it('lists decades from newest to the oldest archive title', () => {
    vi.setSystemTime(new Date('2026-06-01'))
    expect(getDecades('tv')).toEqual([2020, 2010, 2000, 1990, 1980, 1970, 1960, 1950])
    expect(getDecades('movie').at(-1)).toBe(1910)
  })
})
