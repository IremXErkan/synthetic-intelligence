// Archive Terminal: a fixed command set (no free-text interpretation, no AI).
// Suggestions are pure functions; commands read live data through the TMDB
// service layer and the editorial catalog, and never invent output.

import { discoverTheme, getConnectionStatus, getMediaDetails, isInArchive, searchMedia } from '../../services/tmdb.js'
import { ENTITIES, ENTITY_TYPES, getEntityBySlug, getEntityCode } from '../../data/entities.js'
import { getTitle, getYear } from '../../utils/media.js'

export const SECTIONS = [
  { key: 'home', label: 'Command Center', path: '/' },
  { key: 'movies', label: 'Cinematic Archive — Movies', path: '/movies' },
  { key: 'series', label: 'Cinematic Archive — Series', path: '/series' },
  { key: 'cast', label: 'Cast Registry', path: '/cast' },
  { key: 'entities', label: 'Intelligence Database', path: '/entities' },
  { key: 'lab', label: 'Comparison Lab', path: '/lab' },
  { key: 'network', label: 'Intelligence Network', path: '/network' },
  { key: 'about', label: 'About & methodology', path: '/about' },
]

// `takesArgs`: picking the command only fills the input (it cannot run bare).
export const COMMANDS = [
  { name: 'help', usage: 'help', description: 'List all commands', takesArgs: false },
  { name: 'goto', usage: 'goto <section>', description: 'Open a section of the archive', takesArgs: true },
  { name: 'search', usage: 'search <movie|tv> <query>', description: 'Search all of TMDB (top 5 results)', takesArgs: true },
  { name: 'open', usage: 'open <n>', description: 'Open result n of the last list', takesArgs: true },
  { name: 'dossier', usage: 'dossier <slug>', description: 'Show a classified dossier summary', takesArgs: true },
  { name: 'dossiers', usage: 'dossiers', description: 'List all dossiers in the catalog', takesArgs: false },
  { name: 'compare', usage: 'compare <slug> <slug>', description: 'Compare two dossiers in the Lab', takesArgs: true },
  { name: 'stats', usage: 'stats', description: 'Archive size, live from TMDB', takesArgs: false },
  { name: 'status', usage: 'status', description: 'TMDB connection status', takesArgs: false },
  { name: 'clear', usage: 'clear', description: 'Clear the terminal log', takesArgs: false },
  { name: 'exit', usage: 'exit', description: 'Close the terminal (same as Esc)', takesArgs: false },
]

const SEARCH_TYPES = { movie: 'movie', tv: 'tv', series: 'tv' }
const SEARCH_LIMIT = 5
const MAX_DOSSIER_SUGGESTIONS = 6

/** "  Search  movie   Her " → { name: 'search', args: ['movie', 'Her'] } */
export function parseCommand(input) {
  const [name = '', ...args] = input.trim().split(/\s+/).filter(Boolean)
  return { name: name.toLowerCase(), args }
}

// 0 = starts with the query, 1 = contains it, null = no match.
function rank(query, ...candidates) {
  const q = query.toLowerCase()
  let best = null
  for (const candidate of candidates) {
    const value = candidate.toLowerCase()
    if (value.startsWith(q)) return 0
    if (value.includes(q)) best = 1
  }
  return best
}

function matchList(items, query, fields) {
  return items
    .map((item) => ({ item, score: rank(query, ...fields(item)) }))
    .filter((entry) => entry.score !== null)
    .sort((a, b) => a.score - b.score)
    .map((entry) => entry.item)
}

const commandItem = (command) => ({
  id: `cmd-${command.name}`,
  group: 'commands',
  label: command.usage,
  detail: command.description,
  tag: 'CMD',
  value: command.takesArgs ? `${command.name} ` : command.name,
  runnable: !command.takesArgs,
})

const dossierItem = (entity, value, runnable) => ({
  id: `dossier-${entity.slug}-${value}`,
  group: 'dossiers',
  label: entity.slug,
  detail: entity.name,
  tag: 'DOSSIER',
  value,
  runnable,
})

const sectionItem = (section) => ({
  id: `section-${section.key}`,
  group: 'sections',
  label: section.key,
  detail: section.label,
  tag: 'SECTION',
  value: `goto ${section.key}`,
  runnable: true,
})

const matchDossiers = (query, exclude) =>
  matchList(
    ENTITIES.filter((entity) => entity.slug !== exclude),
    query,
    (entity) => [entity.slug, entity.name],
  ).slice(0, MAX_DOSSIER_SUGGESTIONS)

/**
 * Live suggestions for the palette, in group order (commands, dossiers, sections).
 * Each item: { id, group, label, detail, tag, value, runnable } — `value` is the
 * text Tab puts in the input; Enter runs it when `runnable`, otherwise completes it.
 */
export function getSuggestions(input) {
  if (!input.trim()) return []
  const hasArgs = /\S\s/.test(input.trimStart())

  // First word: match everything.
  if (!hasArgs) {
    const query = input.trim()
    return [
      ...matchList(COMMANDS, query, (command) => [command.name]).map(commandItem),
      ...matchDossiers(query).map((entity) => dossierItem(entity, `dossier ${entity.slug}`, true)),
      ...matchList(SECTIONS, query, (section) => [section.key]).map(sectionItem),
    ]
  }

  // After a known command: complete its arguments.
  const { name, args } = parseCommand(input)
  const endsWithSpace = /\s$/.test(input)
  const current = endsWithSpace ? '' : (args.at(-1) ?? '')
  const position = endsWithSpace ? args.length : args.length - 1 // index of the argument being typed

  switch (name) {
    case 'goto':
      return position === 0 ? matchList(SECTIONS, current, (s) => [s.key]).map(sectionItem) : []
    case 'dossier':
      return position === 0 ? matchDossiers(current).map((e) => dossierItem(e, `dossier ${e.slug}`, true)) : []
    case 'compare':
      if (position === 0) return matchDossiers(current).map((e) => dossierItem(e, `compare ${e.slug} `, false))
      if (position === 1) return matchDossiers(current, args[0]).map((e) => dossierItem(e, `compare ${args[0]} ${e.slug}`, true))
      return []
    case 'search':
      if (position !== 0) return []
      return ['movie', 'tv']
        .filter((type) => type.startsWith(current.toLowerCase()))
        .map((type) => ({
          id: `search-${type}`,
          group: 'commands',
          label: `search ${type} <query>`,
          detail: type === 'movie' ? 'Search films on TMDB' : 'Search series on TMDB',
          tag: 'CMD',
          value: `search ${type} `,
          runnable: false,
        }))
    default:
      return []
  }
}

// ---- Execution -------------------------------------------------------------

const line = (text, tone = 'default') => ({ type: 'line', text, tone })
const usage = (command) => line(`usage: ${COMMANDS.find((c) => c.name === command).usage}`, 'error')
const formatCount = (value) => value.toLocaleString('en-US')

/**
 * Runs one command. Returns { output: Block[], list?, navigateTo?, clear?, close? }.
 * - `list`: items `open <n>` can open next ({ path } each).
 * - Blocks: line | media | dossiers | dossier | help (rendered by the terminal).
 * @param {string} input
 * @param {{ lastList?: { path: string }[], signal?: AbortSignal }} context
 */
export async function runCommand(input, { lastList = [], signal } = {}) {
  const { name, args } = parseCommand(input)

  switch (name) {
    case 'help':
      return { output: [{ type: 'help', rows: COMMANDS.map(({ usage, description }) => ({ usage, description })) }] }

    case 'goto': {
      if (args.length !== 1) return { output: [usage('goto')] }
      const section = SECTIONS.find((s) => s.key === args[0].toLowerCase())
      if (!section) return { output: [line(`section not found: ${args[0]} — sections: ${SECTIONS.map((s) => s.key).join(', ')}`, 'error')] }
      return { output: [line(`opening ${section.label}…`, 'success')], navigateTo: section.path }
    }

    case 'search': {
      const mediaType = SEARCH_TYPES[args[0]?.toLowerCase()]
      const query = args.slice(1).join(' ')
      if (!mediaType || !query) return { output: [usage('search')] }
      const data = await searchMedia(mediaType, query, {}, { signal })
      const items = data.results.slice(0, SEARCH_LIMIT).map((item, index) => ({
        n: index + 1,
        id: item.id,
        mediaType,
        title: getTitle(item),
        year: getYear(item),
        posterPath: item.poster_path,
        inArchive: isInArchive(mediaType, item.id),
        path: `/media/${mediaType}/${item.id}`,
      }))
      if (items.length === 0) return { output: [line('no records found', 'muted')], list: [] }
      return {
        output: [
          line(`${formatCount(data.total_results)} TMDB ${data.total_results === 1 ? 'match' : 'matches'} · showing ${items.length} · open <n>`, 'muted'),
          { type: 'media', items },
        ],
        list: items,
      }
    }

    case 'open': {
      const n = Number(args[0])
      if (args.length !== 1 || !Number.isInteger(n)) return { output: [usage('open')] }
      if (lastList.length === 0) return { output: [line('nothing to open — run search or dossiers first', 'error')] }
      const item = lastList[n - 1]
      if (!item) return { output: [line(`no item ${n} — the last list has ${lastList.length}`, 'error')] }
      return { output: [line(`opening ${item.title ?? item.name}…`, 'success')], navigateTo: item.path }
    }

    case 'dossiers': {
      const items = ENTITIES.map((entity, index) => ({
        n: index + 1,
        slug: entity.slug,
        code: getEntityCode(entity.slug),
        name: entity.name,
        typeLabel: ENTITY_TYPES[entity.entityType],
        threatLevel: entity.threatLevel,
        path: `/entity/${entity.slug}`,
      }))
      return { output: [{ type: 'dossiers', items }], list: items }
    }

    case 'dossier': {
      if (args.length !== 1) return { output: [usage('dossier')] }
      const entity = getEntityBySlug(args[0].toLowerCase())
      if (!entity) return { output: [line(`entity not found: ${args[0]} — type dossiers for the list`, 'error')] }
      const item = {
        n: 1,
        slug: entity.slug,
        code: getEntityCode(entity.slug),
        name: entity.name,
        typeLabel: ENTITY_TYPES[entity.entityType],
        threatLevel: entity.threatLevel,
        summary: entity.summary,
        path: `/entity/${entity.slug}`,
      }
      // Production title and year are TMDB data, fetched live.
      let production = null
      let error = null
      try {
        const media = await getMediaDetails(entity.media.type, entity.media.tmdbId, {}, { signal })
        production = { title: getTitle(media), year: getYear(media), mediaType: entity.media.type }
      } catch (caught) {
        if (caught?.name === 'AbortError') throw caught
        error = caught
      }
      const output = [{ type: 'dossier', item, production }]
      if (error) output.push(line(`ERROR production data unavailable: ${error.message}`, 'error'))
      return { output, list: [item] }
    }

    case 'compare': {
      if (args.length !== 2) return { output: [usage('compare')] }
      const [a, b] = args.map((slug) => slug.toLowerCase())
      const missing = [a, b].find((slug) => !getEntityBySlug(slug))
      if (missing) return { output: [line(`entity not found: ${missing} — type dossiers for the list`, 'error')] }
      if (a === b) return { output: [line('pick two different dossiers', 'error')] }
      return { output: [line(`opening Comparison Lab: ${a} vs ${b}…`, 'success')], navigateTo: `/lab?a=${a}&b=${b}` }
    }

    case 'stats': {
      const [movies, series] = await Promise.all([
        discoverTheme('movie', {}, { signal }),
        discoverTheme('tv', {}, { signal }),
      ])
      return {
        output: [
          line(`films in archive   ${formatCount(movies.total_results)}`),
          line(`series in archive  ${formatCount(series.total_results)}`),
          line('source: TMDB discover, theme keyword filter (live)', 'muted'),
          line(`dossiers           ${ENTITIES.length}  (editorial catalog)`, 'editorial'),
        ],
      }
    }

    case 'status':
      return { output: [line(`TMDB link: ${getConnectionStatus().toUpperCase()}`, getConnectionStatus() === 'error' ? 'error' : 'success')] }

    case 'clear':
      return { output: [], clear: true }

    case 'exit':
      return { output: [], close: true }

    default:
      return { output: [line(`unknown command: ${name} — type help`, 'error')] }
  }
}
