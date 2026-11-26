import { describe, expect, it } from 'vitest'
import { formatDate, getReleaseDate, getTitle, getYear } from './media.js'

describe('movie / TV field helpers', () => {
  const movie = { title: 'Ex Machina', release_date: '2015-01-21' }
  const series = { name: 'Westworld', first_air_date: '2016-10-02' }

  it('reads title and date from both shapes', () => {
    expect(getTitle(movie)).toBe('Ex Machina')
    expect(getTitle(series)).toBe('Westworld')
    expect(getReleaseDate(movie)).toBe('2015-01-21')
    expect(getReleaseDate(series)).toBe('2016-10-02')
    expect(getYear(series)).toBe('2016')
  })

  it('handles missing data without inventing values', () => {
    expect(getTitle({})).toBe('Untitled')
    expect(getReleaseDate({ release_date: '' })).toBeNull()
    expect(getYear({})).toBeNull()
  })
})

describe('formatDate', () => {
  it('formats an ISO date without shifting the day', () => {
    expect(formatDate('2014-11-04')).toBe('04 Nov 2014')
    expect(formatDate('1968-01-01')).toBe('01 Jan 1968')
  })

  it('returns null for no date', () => {
    expect(formatDate(null)).toBeNull()
  })
})
