// Pure helpers for the Cast Registry: merge credits from many productions into
// one de-duplicated list of people, and flag probable synthetic characters.
// No requests here (see services/cast.js), which keeps these easy to test.

import { ENTITIES } from '../data/entities.js'

/** Top-billed cast members taken from each production. */
export const TOP_BILLED = 8

/**
 * Heuristic term match on character names. Measured on the first 40 archive
 * productions: "(voice)" was rejected (90 matches, mostly human/animal voices)
 * and "host" was rejected ("Self - Host" false positive).
 */
// ("a.i." is matched separately: \b does not work after a trailing dot.)
const SYNTHETIC_TERMS =
  /\b(?:robots?|androids?|cyborgs?|droids?|ai|computer|supercomputer|synth|synthetic|replicants?|terminator|t-\d{2,4}|hologram|machine|mech|automaton|bot)\b|\ba\.i\./i

// Dossier catalog matches: "personId:mediaType:mediaId" of verified credited characters.
const DOSSIER_KEYS = new Set(
  ENTITIES.filter((entity) => entity.creditPersonId).map(
    (entity) => `${entity.creditPersonId}:${entity.media.type}:${entity.media.tmdbId}`,
  ),
)

/** Why a role counts as synthetic: 'dossier' | 'term' | null. */
export function getSyntheticReason(personId, role) {
  if (DOSSIER_KEYS.has(`${personId}:${role.mediaType}:${role.mediaId}`)) return 'dossier'
  if (role.character && SYNTHETIC_TERMS.test(role.character)) return 'term'
  return null
}

/** Top-billed cast of one production as uniform rows (movie and TV shapes differ). */
function topBilled(production, credits) {
  return [...(credits?.cast ?? [])]
    .sort((a, b) => (a.order ?? 999) - (b.order ?? 999))
    .slice(0, TOP_BILLED)
    .map((member) => ({
      personId: member.id,
      name: member.name,
      profilePath: member.profile_path,
      department: member.known_for_department,
      order: member.order ?? 999,
      character:
        production.mediaType === 'movie'
          ? member.character || null
          : member.roles?.map((role) => role.character).filter(Boolean).join(' / ') || null,
    }))
}

/**
 * Merges credits into one person list.
 * @param {{ production: { mediaType, id, title, year }, credits?: object }[]} entries
 * @returns people sorted by number of archive roles, then by best billing order
 */
export function compileCast(entries) {
  const people = new Map()

  for (const { production, credits } of entries) {
    if (!credits) continue // failed request: skipped, reported separately
    for (const row of topBilled(production, credits)) {
      const role = {
        character: row.character,
        mediaType: production.mediaType,
        mediaId: production.id,
        title: production.title,
        year: production.year,
        order: row.order,
      }
      role.syntheticReason = getSyntheticReason(row.personId, role)

      const person = people.get(row.personId) ?? {
        id: row.personId,
        name: row.name,
        profilePath: row.profilePath,
        department: row.department,
        roles: [],
      }
      // The same production can appear in two batches if TMDB ordering shifts.
      if (!person.roles.some((r) => r.mediaType === role.mediaType && r.mediaId === role.mediaId)) {
        person.roles.push(role)
      }
      people.set(row.personId, person)
    }
  }

  return [...people.values()]
    .map((person) => ({
      ...person,
      bestOrder: Math.min(...person.roles.map((role) => role.order)),
      isSynthetic: person.roles.some((role) => role.syntheticReason),
    }))
    .sort((a, b) => b.roles.length - a.roles.length || a.bestOrder - b.bestOrder || a.name.localeCompare(b.name))
}

/**
 * Client-side filters over the compiled list (no requests).
 * @param {{ q?: string, type?: 'all'|'movie'|'tv', synthetic?: boolean }} filters
 */
export function filterCast(people, { q = '', type = 'all', synthetic = false } = {}) {
  const needle = q.trim().toLowerCase()
  return people.filter((person) => {
    if (needle && !person.name.toLowerCase().includes(needle)) return false
    if (type !== 'all' && !person.roles.some((role) => role.mediaType === type)) return false
    if (synthetic && !person.isSynthetic) return false
    return true
  })
}
