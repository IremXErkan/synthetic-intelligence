/**
 * Finds a dossier entity's performer in the live TMDB credits of its production
 * (`media` fetched with credits / aggregate_credits appended). Returns the
 * credited character string, or null when TMDB does not list them (→ editorial match).
 */
export function findCreditedCharacter(entity, media) {
  if (!entity.creditPersonId) return null
  const cast = (entity.media.type === 'movie' ? media.credits : media.aggregate_credits)?.cast ?? []
  const member = cast.find((person) => person.id === entity.creditPersonId)
  if (!member) return null
  return member.character || member.roles?.map((role) => role.character).filter(Boolean).join(' / ') || null
}

/** append_to_response that includes the right credits for the media type (verified). */
export const CREDITS_APPEND = { movie: 'credits', tv: 'aggregate_credits' }
