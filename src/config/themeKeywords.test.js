import { describe, expect, it } from 'vitest'
import {
  MIN_VOTE_COUNT,
  THEME_GROUPS,
  THEME_GROUP_KEYS,
  TV_EXCLUDED_GENRES,
  buildKeywordFilter,
  getThemeDiscoverParams,
  getThemeGroupsForKeywords,
} from './themeKeywords.js'

const idsOf = (key) => THEME_GROUPS[key].keywords.map((keyword) => keyword.id)

describe('buildKeywordFilter', () => {
  it('joins every group with | (logical OR) by default', () => {
    const ids = THEME_GROUP_KEYS.flatMap(idsOf)
    expect(buildKeywordFilter()).toBe(ids.join('|'))
  })

  it('only includes the selected groups', () => {
    expect(buildKeywordFilter(['cyborg'])).toBe(idsOf('cyborg').join('|'))
  })

  it('ignores unknown keys and never returns an empty (unthemed) filter', () => {
    expect(buildKeywordFilter(['bogus'])).toBe(buildKeywordFilter())
    expect(buildKeywordFilter([])).toBe(buildKeywordFilter())
  })
})

describe('getThemeDiscoverParams', () => {
  it('applies the vote threshold, and drops it for low-vote mode', () => {
    expect(getThemeDiscoverParams('movie')['vote_count.gte']).toBe(MIN_VOTE_COUNT)
    expect(getThemeDiscoverParams('movie', { includeLowVotes: true })['vote_count.gte']).toBe(0)
  })

  it('excludes the Kids genre for TV only', () => {
    expect(getThemeDiscoverParams('tv').without_genres).toBe(TV_EXCLUDED_GENRES.join(','))
    expect(getThemeDiscoverParams('movie').without_genres).toBeUndefined()
  })
})

describe('getThemeGroupsForKeywords', () => {
  it('maps TMDB keyword IDs to theme groups', () => {
    // 803 = android, 310 = artificial intelligence (a.i.)
    expect(getThemeGroupsForKeywords([803, 310, 999999])).toEqual(['ai', 'android'])
  })

  it('returns [] for titles outside the theme', () => {
    expect(getThemeGroupsForKeywords([1, 2, 3])).toEqual([])
  })
})
