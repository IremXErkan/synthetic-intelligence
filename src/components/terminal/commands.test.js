import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('../../services/tmdb.js', () => ({
  searchMedia: vi.fn(),
  discoverTheme: vi.fn(),
  getMediaDetails: vi.fn(),
  getConnectionStatus: vi.fn(() => 'online'),
  isInArchive: vi.fn((type, id) => id === 62),
}))

const tmdb = await import('../../services/tmdb.js')
const { getSuggestions, parseCommand, runCommand } = await import('./commands.js')

const values = (input) => getSuggestions(input).map((item) => item.value)

describe('parseCommand', () => {
  it('splits on any whitespace and lower-cases the command name only', () => {
    expect(parseCommand('  Search  movie   Blade Runner ')).toEqual({ name: 'search', args: ['movie', 'Blade', 'Runner'] })
    expect(parseCommand('')).toEqual({ name: '', args: [] })
  })
})

describe('getSuggestions', () => {
  it('returns nothing for empty input', () => {
    expect(getSuggestions('   ')).toEqual([])
  })

  it('matches commands, dossiers and sections for the first word, in group order', () => {
    const items = getSuggestions('da')
    expect(items.map((item) => item.group)).toEqual(['dossiers'])
    expect(items[0].value).toBe('dossier data')

    const groups = getSuggestions('s').map((item) => item.group)
    expect(groups.indexOf('commands')).toBeLessThan(groups.indexOf('dossiers'))
    expect(groups.indexOf('dossiers')).toBeLessThan(groups.indexOf('sections'))
  })

  it('ranks prefix matches before contains matches', () => {
    expect(values('o')[0]).toBe('open ') // "open" starts with o; "goto" only contains it
  })

  it('commands that need arguments complete instead of running', () => {
    const search = getSuggestions('sea').find((item) => item.group === 'commands')
    expect(search).toMatchObject({ value: 'search ', runnable: false })
    expect(getSuggestions('stats')[0]).toMatchObject({ value: 'stats', runnable: true })
  })

  it('completes arguments of goto, dossier, search and compare', () => {
    expect(values('goto ne')).toEqual(['goto network'])
    expect(values('dossier hal')).toEqual(['dossier hal-9000'])
    expect(values('search t')).toEqual(['search tv '])
    expect(values('compare hal')).toEqual(['compare hal-9000 '])
    const second = values('compare hal-9000 ')
    expect(second).not.toContain('compare hal-9000 hal-9000')
    expect(second).toContain('compare hal-9000 tars')
  })

  it('offers nothing once the free-text part starts or for unknown commands', () => {
    expect(getSuggestions('search movie her')).toEqual([])
    expect(getSuggestions('launch missiles')).toEqual([])
  })
})

describe('runCommand', () => {
  beforeEach(() => vi.clearAllMocks())

  it('rejects unknown commands', async () => {
    const { output } = await runCommand('hack')
    expect(output[0]).toMatchObject({ tone: 'error', text: 'unknown command: hack — type help' })
  })

  it('goto navigates to a known section and explains an unknown one', async () => {
    expect((await runCommand('goto Movies')).navigateTo).toBe('/movies')
    expect((await runCommand('goto home')).navigateTo).toBe('/')
    const bad = await runCommand('goto mars')
    expect(bad.navigateTo).toBeUndefined()
    expect(bad.output[0].tone).toBe('error')
  })

  it('search maps the top 5 TMDB results and remembers them for open', async () => {
    tmdb.searchMedia.mockResolvedValue({
      total_results: 7,
      results: Array.from({ length: 7 }, (_, i) => ({
        id: 60 + i,
        title: `Film ${i}`,
        release_date: '1968-04-02',
        poster_path: i === 0 ? null : `/p${i}.jpg`,
      })),
    })
    const result = await runCommand('search movie space odyssey')
    expect(tmdb.searchMedia).toHaveBeenCalledWith('movie', 'space odyssey', {}, { signal: undefined })
    const media = result.output.find((block) => block.type === 'media')
    expect(media.items).toHaveLength(5)
    expect(media.items[2]).toMatchObject({ n: 3, title: 'Film 2', year: '1968', inArchive: true, path: '/media/movie/62' })
    expect(result.list).toHaveLength(5)

    expect((await runCommand('open 3', { lastList: result.list })).navigateTo).toBe('/media/movie/62')
    expect((await runCommand('open 9', { lastList: result.list })).output[0].tone).toBe('error')
  })

  it('search accepts "series" for tv, and needs a type and a query', async () => {
    tmdb.searchMedia.mockResolvedValue({ total_results: 0, results: [] })
    const empty = await runCommand('search series westworld')
    expect(tmdb.searchMedia).toHaveBeenCalledWith('tv', 'westworld', {}, expect.anything())
    expect(empty.output[0].text).toBe('no records found')

    expect((await runCommand('search movie')).output[0].text).toMatch(/^usage:/)
    expect((await runCommand('search games zelda')).output[0].text).toMatch(/^usage:/)
  })

  it('open without a previous list explains what to do', async () => {
    expect((await runCommand('open 1')).output[0].text).toMatch(/run search or dossiers first/)
  })

  it('dossier shows editorial fields plus the live production title', async () => {
    tmdb.getMediaDetails.mockResolvedValue({ title: '2001: A Space Odyssey', release_date: '1968-04-02' })
    const { output, list } = await runCommand('dossier HAL-9000')
    expect(tmdb.getMediaDetails).toHaveBeenCalledWith('movie', 62, {}, { signal: undefined })
    expect(output[0]).toMatchObject({
      type: 'dossier',
      item: { slug: 'hal-9000', code: 'SI-001', threatLevel: 'high' },
      production: { title: '2001: A Space Odyssey', year: '1968' },
    })
    expect(list[0].path).toBe('/entity/hal-9000')
  })

  it('dossier keeps the editorial part and reports an API error', async () => {
    tmdb.getMediaDetails.mockRejectedValue(new Error('Network error'))
    const { output } = await runCommand('dossier tars')
    expect(output[0].production).toBeNull()
    expect(output[1]).toMatchObject({ tone: 'error', text: 'ERROR production data unavailable: Network error' })
  })

  it('dossier and compare reject unknown slugs; compare needs two different ones', async () => {
    expect((await runCommand('dossier glados')).output[0].text).toMatch(/^entity not found: glados/)
    expect((await runCommand('compare hal-9000 glados')).output[0].text).toMatch(/^entity not found: glados/)
    expect((await runCommand('compare tars tars')).output[0].tone).toBe('error')
    expect((await runCommand('compare tars')).output[0].text).toMatch(/^usage:/)
    expect((await runCommand('compare hal-9000 tars')).navigateTo).toBe('/lab?a=hal-9000&b=tars')
  })

  it('stats reads both archive totals from discover', async () => {
    tmdb.discoverTheme.mockImplementation((type) => Promise.resolve({ total_results: type === 'movie' ? 407 : 124 }))
    const { output } = await runCommand('stats')
    expect(output.map((block) => block.text)).toEqual(expect.arrayContaining(['films in archive   407', 'series in archive  124']))
  })

  it('clear and exit return flags; help lists every command', async () => {
    expect((await runCommand('clear')).clear).toBe(true)
    expect((await runCommand('exit')).close).toBe(true)
    expect((await runCommand('help')).output[0].rows.length).toBe(11)
  })
})
