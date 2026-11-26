import { describe, expect, it } from 'vitest'
import { act, renderHook } from '@testing-library/react'
import { MemoryRouter, useLocation } from 'react-router'
import useArchiveQuery from './useArchiveQuery.js'
import { THEME_GROUP_KEYS } from '../config/themeKeywords.js'

// Renders the hook inside a router that starts at `url`, and also returns the live location.
function setup(url) {
  const wrapper = ({ children }) => <MemoryRouter initialEntries={[url]}>{children}</MemoryRouter>
  return renderHook(() => ({ query: useArchiveQuery('movie'), location: useLocation() }), { wrapper })
}

describe('useArchiveQuery', () => {
  it('reads filters from the URL', () => {
    const { result } = setup('/movies?q=robot&groups=ai,cyborg&genre=878&decade=1980&sort=rating&lowvotes=1')
    expect(result.current.query.state).toEqual({
      q: 'robot',
      groups: ['ai', 'cyborg'],
      genre: 878,
      decade: 1980,
      sort: 'rating',
      lowVotes: true,
    })
    expect(result.current.query.isFiltered).toBe(true)
  })

  it('falls back to defaults for invalid values', () => {
    const { result } = setup('/movies?groups=bogus&genre=abc&decade=1234&sort=xyz')
    expect(result.current.query.state).toMatchObject({
      groups: THEME_GROUP_KEYS,
      genre: null,
      decade: null,
      sort: 'popularity',
    })
    expect(result.current.query.isFiltered).toBe(false)
  })

  it('writes changes to the URL and leaves defaults out', () => {
    const { result } = setup('/movies')
    act(() => result.current.query.setFilter('decade', 1990))
    expect(result.current.location.search).toBe('?decade=1990')

    act(() => result.current.query.setFilter('sort', 'popularity'))
    expect(result.current.location.search).toBe('?decade=1990')

    act(() => result.current.query.resetFilters())
    expect(result.current.location.search).toBe('')
  })

  it('keeps the search text when filters are reset', () => {
    const { result } = setup('/movies?q=her&genre=18')
    act(() => result.current.query.resetFilters())
    expect(result.current.location.search).toBe('?q=her')
  })
})
